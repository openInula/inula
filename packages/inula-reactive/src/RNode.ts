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

let runningRNode: RNode<any> | undefined = undefined; // 当前正执行的RNode
let calledGets: RNode<any>[] | null = null;
let sameGetsIndex = 0; // 记录前后两次运行RNode时，调用get顺序没有变化的节点

const Effects: RNode<any>[] = [];

export const Fresh = 0; // 新数据不用更新
export const Check = 1; // 需要向上遍历检查，可能parents是dirty
export const Dirty = 2; // 数据是脏的，需要重复运行fn函数
export type State = typeof Fresh | typeof Check | typeof Dirty;
type NonClean = typeof Check | typeof Dirty;

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
  _value: T;
  fn?: () => T;

  private observers: RNode[] | null = null; // 被谁用
  private sources: RNode[] | null = null; // 使用谁

  private state: State;
  private isEffect = false;


  cleanups: ((oldValue: T) => void)[] = [];
  equals = defaultEquality;

  constructor(fnOrValue: (() => T) | T, options?: RNodeOptions) {
    this.isEffect = options?.isEffect || false;

    if (typeof fnOrValue === 'function') {
      this.fn = fnOrValue as () => T;
      this._value = undefined as any;
      this.state = Dirty;

      if (this.isEffect) {
        Effects.push(this);
      }
    } else {
      this.fn = undefined;
      this._value = fnOrValue;
      this.state = Fresh;
    }
  }

  get value(): T {
    return this.get();
  }

  set value(v: T) {
    this.set(v);
  }

  get(): T {
    this.track();

    return this.read();
  }

  track() {
    if (runningRNode) {
      // 前后两次运行RNode，从左到右对比，如果调用get的RNode相同就calledGetsIndex加1
      if (!calledGets && runningRNode.sources && runningRNode.sources[sameGetsIndex] == this) {
        sameGetsIndex++;
      } else {
        if (!calledGets) {
          calledGets = [this];
        } else {
          calledGets.push(this);
        }
      }
    }
  }

  read(): T {
    if (this.fn) {
      this.updateIfNecessary();
    }

    return this.getValue();
  }

  set(fnOrValue: T | ((prev: T) => T)): void {
    if (this.fn) {
      this.removeParentObservers(0);
      this.sources = null;
      this.fn = undefined;
    }

    const prevValue = this.getValue();

    const value = typeof fnOrValue === 'function' ? fnOrValue(prevValue) : fnOrValue;

    this.compare(prevValue, value);

    // 运行EffectQueue
    runEffects();
  }

  compare(prevValue: T, value: T) {
    if (!this.equals(prevValue, value)) {
      this.setDirty();

      this.setValue(value);
    }
  }

  setDirty() {
    if (this.observers) {
      for (let i = 0; i < this.observers.length; i++) {
        const observer = this.observers[i];
        observer.stale(Dirty);
      }
    }
  }

  private stale(state: NonClean): void {
    if (state > this.state) {
      if (this.state === Fresh && this.isEffect) {
        Effects.push(this);
      }

      this.state = state;

      // 孩子设置为Check
      if (this.observers) {
        for (let i = 0; i < this.observers.length; i++) {
          this.observers[i].stale(Check);
        }
      }
    }
  }

  update(): void {
    const prevValue = this.getValue();

    const prevReaction = runningRNode;
    const prevGets = calledGets;
    const prevGetsIndex = sameGetsIndex;

    runningRNode = this;
    calledGets = null as any;
    sameGetsIndex = 0;

    try {
      if (this.cleanups.length) {
        this.cleanups.forEach(c => c(this._value));
        this.cleanups = [];
      }

      // 执行 reactive 函数
      this.execute();

      if (calledGets) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(sameGetsIndex);

        // update source up links
        if (this.sources && sameGetsIndex > 0) {
          this.sources.length = sameGetsIndex + calledGets.length;
          for (let i = 0; i < calledGets.length; i++) {
            this.sources[sameGetsIndex + i] = calledGets[i];
          }
        } else {
          this.sources = calledGets;
        }

        for (let i = sameGetsIndex; i < this.sources.length; i++) {
          // Add ourselves to the end of the parent .observers array
          const source = this.sources[i];
          if (!source.observers) {
            source.observers = [this];
          } else {
            source.observers.push(this);
          }
        }
      } else if (this.sources && sameGetsIndex < this.sources.length) {
        // remove all old sources' .observers links to us
        this.removeParentObservers(sameGetsIndex);
        this.sources.length = sameGetsIndex;
      }
    } finally {
      calledGets = prevGets;
      runningRNode = prevReaction;
      sameGetsIndex = prevGetsIndex;
    }

    // 处理“钻石”问题
    if (!this.equals(prevValue, this.getValue()) && this.observers) {
      // 设置孩子为dirty
      for (let i = 0; i < this.observers.length; i++) {
        const observer = this.observers[i];
        observer.state = Dirty;
      }
    }

    this.state = Fresh;
  }

  execute() {
    // 执行 reactive 函数
    this._value = this.fn!();
  }

  /**
   * 1、如果this是check，就去找dirty的parent
   * 2、执行dirty的parent后，会
   * @private
   */
  private updateIfNecessary(): void {
    if (this.state === Check) {
      for (const source of this.sources!) {
        source.updateIfNecessary(); // updateIfNecessary() can change this.state
        if ((this.state as State) === Dirty) {
          // Stop the loop here so we won't trigger updates on other parents unnecessarily
          // If our computation changes to no longer use some sources, we don't
          // want to update() a source we used last time, but now don't use.
          break;
        }
      }
    }

    if (this.state === Dirty) {
      this.update();
    }

    this.state = Fresh;
  }

  private removeParentObservers(index: number): void {
    if (!this.sources) return;
    for (let i = index; i < this.sources.length; i++) {
      const source: RNode<any> = this.sources[i];
      const idx = source.observers!.findIndex(v => v === this);
      source.observers![idx] = source.observers![source.observers!.length - 1];
      source.observers!.pop();
    }
  }

  getValue() {
    return this._value;
  }

  setValue(value: any) {
    this._value = value;
  }

}

export function onCleanup<T = any>(fn: (oldValue: T) => void): void {
  if (runningRNode) {
    runningRNode.cleanups.push(fn);
  } else {
    console.error('onCleanup must be called from within a @reactive function');
  }
}

/** run all non-clean effect nodes */
export function runEffects(): void {
  for (let i = 0; i < Effects.length; i++) {
    Effects[i].get();
  }
  Effects.length = 0;
}

// 不进行响应式数据的使用追踪
export function untrack(fn) {
  if (runningRNode === null) {
    return fn();
  }

  const preRContext = runningRNode;
  runningRNode = null;
  try {
    return fn();
  } finally {
    runningRNode = preRContext;
  }
}
