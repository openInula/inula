/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { Observer, ObserverType } from '../proxy/Observer';
import { FnType } from '../types/ProxyTypes';
import { triggerComputed } from './Computed';
import { VNode } from '../../renderer/vnode/VNode';
import { launchUpdateFromVNode } from '../../renderer/TreeBuilder';
import { RContextScope, recordRContextScope } from './RContextScope';

export type RContextFn = FnType;
export type RContextMap = Map<RContext, number>;

export enum ContextType {
  COMPUTED = 'COMPUTE',
  WATCH = 'WATCH',
}

export enum DirtyLevels {
  NotDirty = 0,
  QueryingDirty = 1,
  MaybeDirty_ComputedSideEffect = 2,
  MaybeDirty = 3,
  Dirty = 4,
}

let currentRContext: RContext | null = null;

const reactiveContextStack: RContext[] = [];

export const NOOP = () => {};

export class RContext {
  // 记录当前RContext的运行次数，用于解决在watchEffect中的数据发生变化导致RContext重新运行的问题
  runs = 0;

  fn: RContextFn;
  type: ContextType;
  trigger: FnType;
  job?: FnType;

  // 记录该RContext中使用到的Reactive中的Observer
  reactiveDependents: Set<Observer> | null = null;

  _dirtyLevel: DirtyLevels = DirtyLevels.Dirty;

  _trackId = 0;

  _shouldSchedule = false;

  constructor(fn: RContextFn, type: ContextType, trigger: FnType = NOOP, job?: FnType) {
    this.fn = fn;
    this.type = type;
    this.trigger = trigger;
    this.job = job;

    recordRContextScope(this);
  }

  start() {
    this._trackId++;
    cleanupRContext(this);
    currentRContext = this;
    reactiveContextStack.push(this);

    return endRContext;
  }

  run() {
    this._dirtyLevel = DirtyLevels.NotDirty;
    const end = this.start();
    try {
      this.runs++;
      return this.fn();
    } finally {
      this.runs--;
      end();
    }
  }

  stop() {
    this._trackId++;
    cleanupRContext(this);
  }

  isDirty() {
    if (this._dirtyLevel === DirtyLevels.MaybeDirty || this._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect) {
      this._dirtyLevel = DirtyLevels.QueryingDirty;

      if (this.reactiveDependents) {
        for (const observer of this.reactiveDependents) {
          if (observer.type === ObserverType.COMPUTED && observer.source) {
            triggerComputed(observer.source);
            if (this._dirtyLevel >= DirtyLevels.Dirty) {
              return true; // 如果已经确定为脏，直接返回
            }
          }
        }
      }
      if (this._dirtyLevel === DirtyLevels.QueryingDirty) {
        this._dirtyLevel = DirtyLevels.NotDirty;
      }
    }
    return this._dirtyLevel >= DirtyLevels.Dirty;
  }

  setDirty(v) {
    this._dirtyLevel = v ? DirtyLevels.Dirty : DirtyLevels.NotDirty;
  }

  setDirtyLevel(dirtyLevel) {
    this._dirtyLevel = dirtyLevel;
  }
}

function endRContext() {
  reactiveContextStack.pop();
  currentRContext = reactiveContextStack[reactiveContextStack.length - 1] ?? null;
}

// 清除 RContext 和 响应式数据 的绑定，双向清除
export function cleanupRContext(rContext: RContext) {
  if (rContext.reactiveDependents !== null) {
    for (const observer of rContext.reactiveDependents) {
      // 遍历 observer 的所有属性
      for (const prop in observer.rContexts) {
        const propContexts = observer.rContexts[prop];
        // 如果属性对应的 Map 中包含当前的 rContext，则移除
        if (propContexts.has(rContext)) {
          propContexts.delete(rContext);

          // 如果移除后 Map 为空，则删除这个属性
          if (propContexts.size === 0) {
            delete observer.rContexts[prop];
          }
        }
      }
    }

    // 清空并移除 reactiveDependents
    rContext.reactiveDependents.clear();
    rContext.reactiveDependents = null;
  }
}

export function addRContext(observer: Observer, prop: string | symbol) {
  if (currentRContext !== null) {
    if (!observer.rContexts[prop]) {
      observer.rContexts[prop] = new Map();
    }

    if (observer.rContexts[prop].get(currentRContext) !== currentRContext._trackId) {
      observer.rContexts[prop].set(currentRContext, currentRContext._trackId);
    }

    if (currentRContext.reactiveDependents === null) {
      currentRContext.reactiveDependents = new Set<Observer>();
    }
    currentRContext.reactiveDependents.add(observer);
  }
}

/**
 * 创建组件（函数组件或Class组件）级别的RContext
 * @param renderFn 函数组件 或 Class的render
 * @param vNode
 */
export function createComponentRContext<T>(renderFn: () => T, vNode: VNode): T {
  let compRContext = vNode.compRContext;
  let compRContextScope = vNode.compRContextScope;

  if (!compRContext) {
    const job = () => {
      vNode.isStoreChange = true;

      // 触发vNode更新
      launchUpdateFromVNode(vNode);
    };

    // RContextScope收集RContext，用于在组件销毁时，清除组件中的RContext，如：清除组件中注册的watch
    compRContextScope = new RContextScope();
    compRContextScope.on();

    compRContext = new RContext(renderFn, ContextType.WATCH, undefined, job);

    vNode.compRContext = compRContext;
    vNode.compRContextScope = compRContextScope;
  } else {
    compRContext.fn = renderFn;
    compRContextScope!.on();
  }

  const result = compRContext.run();

  return result;
}
