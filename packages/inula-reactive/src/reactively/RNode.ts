/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { createProxy } from './proxy/RProxyHandler';
import { isFunction } from '../reactive/Utils';
import {getRNodeVal, preciseCompare, setRNodeVal} from "./RNodeAccessor";
import {isObject} from "./Utils";

/** current capture context for identifying @reactive sources (other reactive elements) and cleanups
 * - active while evaluating a reactive function body  */
let CurrentReaction: RNode<any> | undefined = undefined;
let CurrentGets: RNode<any>[] | null = null;
let CurrentGetsIndex = 0;

/** A list of non-clean 'effect' nodes that will be updated when stabilize() is called */
const EffectQueue: RNode<any>[] = [];

export const CacheClean = 0; // reactive value is valid, no need to recompute
export const CacheCheck = 1; // reactive value might be stale, check parent nodes to decide whether to recompute
export const CacheDirty = 2; // reactive value is invalid, parents have changed, valueneeds to be recomputed
export type CacheState = typeof CacheClean | typeof CacheCheck | typeof CacheDirty;
type CacheNonClean = typeof CacheCheck | typeof CacheDirty;

export interface RNodeOptions {
  root?: Root<any> | null;
  isSignal?: boolean;
  isEffect?: boolean;
  isComputed?: boolean;
  isProxy?: boolean;
  parent?: RNode<any> | null;
  key?: KEY | null;
  equals?: (a: any, b: any) => boolean;
}

export interface Root<T> {
  $?: T;
}

export type KEY = string | symbol;

function defaultEquality(a: any, b: any) {
  return a === b;
}

export class RNode<T = any> {
  private _value: T;
  private fn?: () => T;

  root: Root<T> | null;

  parent: RNode | null = null;
  key: KEY | null;
  children: Map<KEY, RNode> | null = null;

  proxy: any = null;

  private observers: RNode[] | null = null; // 被谁用
  private sources: RNode[] | null = null; // 使用谁

  private state: CacheState;
  private isSignal = false;
  private isEffect = false;
  private isComputed = false;
  private isProxy = false;

  cleanups: ((oldValue: T) => void)[] = [];
  equals = defaultEquality;

  constructor(fnOrValue: (() => T) | T, options?: RNodeOptions) {
    this.isSignal = options?.isSignal || false;
    this.isEffect = options?.isEffect || false;
    this.isProxy = options?.isProxy || false;
    this.isComputed = options?.isComputed || false;

    if (typeof fnOrValue === 'function') {
      this.fn = fnOrValue as () => T;
      this._value = undefined as any;
      this.state = CacheDirty;

      if (this.isEffect) {
        EffectQueue.push(this);
      }
    } else {
      this.fn = undefined;
      this._value = fnOrValue;
      this.state = CacheClean;
    }

    // large-scale object scene
    if (this.isProxy) {
      this.proxy = createProxy(this);
      this.parent = options?.parent || null;
      this.key = options?.key as KEY;
      this.root = options?.root || null;

      if (this.parent && !this.parent.children) {
        this.parent.children = new Map();
        this.parent.children.set(this.key, this);
      }
    }
  }

  get value(): T {
    return this.get();
  }

  set value(v: T) {
    this.set(v);
  }

  get(): T {
    if (CurrentReaction) {
      if (!CurrentGets && CurrentReaction.sources && CurrentReaction.sources[CurrentGetsIndex] == this) {
        CurrentGetsIndex++;
      } else {
        if (!CurrentGets) {
          CurrentGets = [this];
        } else {
          CurrentGets.push(this);
        }
      }
    }

    if (this.fn) {
      this.updateIfNecessary();
    }

    return this.getValue();
  }

  set(fnOrValue: T | (() => T)): void {
    if (typeof fnOrValue === 'function') {
      const fn = fnOrValue as () => T;
      if (fn !== this.fn) {
        this.stale(CacheDirty);
      }
      this.fn = fn;
    } else {
      if (this.fn) {
        this.removeParentObservers(0);
        this.sources = null;
        this.fn = undefined;
      }

      const value = fnOrValue as T;
      const prevValue = this.getValue();

      const isObj = isObject(value);
      const isPrevObj = isObject(prevValue);

      // 新旧数据都是 对象或数组
      if (isObj && isPrevObj) {
        preciseCompare(this, value, prevValue, false);

        this.setValue(value);
      } else {
        if (!this.equals(prevValue, value)) {
          this.setDirty();

          this.setValue(value);
        }
      }
    }

    // 运行EffectQueue
    runEffects();
  }

  setDirty() {
    if (this.observers) {
      for (let i = 0; i < this.observers.length; i++) {
        const observer = this.observers[i];
        observer.stale(CacheDirty);
      }
    }
  }

  private stale(state: CacheNonClean): void {
    if (this.state < state) {
      // If we were previously clean, then we know that we may need to update to get the new value
      if (this.state === CacheClean && this.isEffect) {
        EffectQueue.push(this);
      }

      this.state = state;
      if (this.observers) {
        for (let i = 0; i < this.observers.length; i++) {
          this.observers[i].stale(CacheCheck);
        }
      }
    }
  }

  /** run the computation fn, updating the cached value */
  private update(): void {
    const prevValue = this.getValue();

    /* Evalute the reactive function body, dynamically capturing any other reactives used */
    const prevReaction = CurrentReaction;
    const prevGets = CurrentGets;
    const prevIndex = CurrentGetsIndex;

    CurrentReaction = this;
    CurrentGets = null as any; // prevent TS from thinking CurrentGets is null below
    CurrentGetsIndex = 0;

    try {
      if (this.cleanups.length) {
        this.cleanups.forEach(c => c(this._value));
        this.cleanups = [];
      }

      if (this.isComputed) {
        this.root = { $: this.fn!() };
      } else {
        this._value = this.fn!();
      }

      // if the sources have changed, update source & observer links
      if (CurrentGets) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(CurrentGetsIndex);
        // update source up links
        if (this.sources && CurrentGetsIndex > 0) {
          this.sources.length = CurrentGetsIndex + CurrentGets.length;
          for (let i = 0; i < CurrentGets.length; i++) {
            this.sources[CurrentGetsIndex + i] = CurrentGets[i];
          }
        } else {
          this.sources = CurrentGets;
        }

        for (let i = CurrentGetsIndex; i < this.sources.length; i++) {
          // Add ourselves to the end of the parent .observers array
          const source = this.sources[i];
          if (!source.observers) {
            source.observers = [this];
          } else {
            source.observers.push(this);
          }
        }
      } else if (this.sources && CurrentGetsIndex < this.sources.length) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(CurrentGetsIndex);
        this.sources.length = CurrentGetsIndex;
      }
    } finally {
      CurrentGets = prevGets;
      CurrentReaction = prevReaction;
      CurrentGetsIndex = prevIndex;
    }

    // handles diamond depenendencies if we're the parent of a diamond.
    if (!this.equals(prevValue, this.getValue()) && this.observers) {
      // We've changed value, so mark our children as dirty so they'll reevaluate
      for (let i = 0; i < this.observers.length; i++) {
        const observer = this.observers[i];
        observer.state = CacheDirty;
      }
    }

    // We've rerun with the latest values from all of our sources.
    // This means that we no longer need to update until a signal changes
    this.state = CacheClean;
  }

  /** update() if dirty, or a parent turns out to be dirty. */
  private updateIfNecessary(): void {
    if (this.state === CacheCheck) {
      for (const source of this.sources!) {
        source.updateIfNecessary(); // updateIfNecessary() can change this.state
        if ((this.state as CacheState) === CacheDirty) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    // If we were already dirty or marked dirty by the step above, update.
    if (this.state === CacheDirty) {
      this.update();
    }

    // By now, we're clean
    this.state = CacheClean;
  }

  private removeParentObservers(index: number): void {
    if (!this.sources) return;
    for (let i = index; i < this.sources.length; i++) {
      const source: RNode<any> = this.sources[i]; // We don't actually delete sources here because we're replacing the entire array soon
      const swap = source.observers!.findIndex(v => v === this);
      source.observers![swap] = source.observers![source.observers!.length - 1];
      source.observers!.pop();
    }
  }

  private getValue() {
    return this.isProxy ? getRNodeVal(this) : this._value;
  }

  private setValue(value: any) {
    this.isProxy ? setRNodeVal(this, value) : (this._value = value);
  }
}

export function onCleanup<T = any>(fn: (oldValue: T) => void): void {
  if (CurrentReaction) {
    CurrentReaction.cleanups.push(fn);
  } else {
    console.error('onCleanup must be called from within a @reactive function');
  }
}

/** run all non-clean effect nodes */
export function runEffects(): void {
  for (let i = 0; i < EffectQueue.length; i++) {
    EffectQueue[i].get();
  }
  EffectQueue.length = 0;
}
