/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import { launchUpdateFromVNode } from '../../renderer/TreeBuilder';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { VNode } from '../../renderer/vnode/VNode';
import { devtools } from '../devtools';
import { KeyTypes } from '../Constants';
import { addRContext, ContextType, DirtyLevels, RContextMap } from '../reactive/RContext';

import { IObserver, Listener, Mutation } from '../types/ProxyTypes';
import { queueJob } from './Scheduler';
import { ComputedImpl } from '../reactive/Computed';

export enum ObserverType {
  REF = 'REF',
  REACTIVE = 'REACTIVE',
  COMPUTED = 'COMPUTED',
}

/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
export class Observer implements IObserver {
  type: ObserverType;

  source?: ComputedImpl;

  vNodeKeys = new WeakMap<VNode, Set<any>>();

  keyVNodes = new Map<any, Set<VNode>>();

  // 处理：store.$subscribe(() => {})
  listeners: Listener[] = [];

  // 处理：store.$s.watch('key', () => {})
  watchers = {};

  // 处理：watchEffect(() => {}) 和 watch(ref/computed/reactive/() => obj, () => {})
  rContexts: {
    [key: string | symbol]: RContextMap;
  } = {};

  constructor(type: ObserverType, source?: ComputedImpl) {
    this.type = type;
    this.source = source;
  }

  // 对象的属性被使用时调用
  useProp(key: string | symbol): void {
    // 用于watchEffect 和 watch的监听
    addRContext(this, key);

    let vNodes = this.keyVNodes.get(key);
    if (!vNodes) {
      vNodes = new Set();
      this.keyVNodes.set(key, vNodes);
    }

    const processingVNode = getProcessingVNode();
    if (processingVNode === null) {
      // 异常场景
      return;
    }

    if (!processingVNode.observers) {
      processingVNode.observers = new Set<Observer>();
    }

    // vNode -> Observers
    processingVNode.observers.add(this);

    // key -> vNodes，记录这个prop被哪些VNode使用了
    vNodes.add(processingVNode);

    // vNode -> keys，记录这个VNode使用了哪些props
    let keys = this.vNodeKeys.get(processingVNode);
    if (!keys) {
      keys = new Set();
      this.vNodeKeys.set(processingVNode, keys);
    }
    keys.add(key);
  }

  // 对象的属性被赋值时调用
  setProp(
    key: string | symbol,
    mutation: Mutation,
    oldValue?: any,
    newValue?: any,
    dirtyLevel: DirtyLevels = DirtyLevels.Dirty
  ): void {
    const vNodes = this.keyVNodes.get(key);

    // 这里需要过滤调COLLECTION_CHANGE，因为这个是集合的变化，不是具体的某个prop的变化，否则会重复触发
    if (key !== KeyTypes.COLLECTION_CHANGE) {
      // 触发：store.$s.watch('key', () => {})
      if (this.watchers[key]) {
        this.watchers[key].forEach(cb => {
          cb(key, oldValue, newValue, mutation);
        });
      }

      if (this.listeners.length) {
        // 异步触发
        queueJob(() => {
          this.triggerChangeListeners({ mutation, vNodes });
        });
      }
    }

    const keyRContexts = this.rContexts[key];
    if (keyRContexts) {
      for (const rContext of keyRContexts.keys()) {
        let tracking: boolean | undefined;
        if (tracking === undefined) {
          tracking = keyRContexts.get(rContext) === rContext._trackId;
        }

        if (rContext._dirtyLevel < dirtyLevel && tracking) {
          if (rContext._shouldSchedule === undefined || rContext._shouldSchedule === false) {
            rContext._shouldSchedule = rContext._dirtyLevel === DirtyLevels.NotDirty;
          }
          rContext._dirtyLevel = dirtyLevel;
        }

        if (rContext._shouldSchedule && tracking) {
          if (rContext.type === ContextType.COMPUTED) {
            // 触发依赖
            rContext.trigger();
          } else {
            if (!rContext.runs && rContext._dirtyLevel !== DirtyLevels.MaybeDirty_ComputedSideEffect) {
              rContext._shouldSchedule = false;

              // 异步触发
              queueJob(rContext.job);
            }
          }
        }
      }
    }
  }

  triggerChangeListeners({ mutation, vNodes }): void {
    const nodesList = vNodes ? Array.from(vNodes) : [];
    this.listeners.forEach(listener =>
      listener({
        mutation,
        vNodes: nodesList.map((vNode: VNode) => {
          let realNode = vNode.realNode;
          let searchedNode: VNode | null | undefined = vNode;
          while (searchedNode && !realNode) {
            searchedNode = searchedNode?.child;
            realNode = searchedNode?.realNode;
          }
          return {
            type: vNode?.type?.name,
            id: devtools.getVNodeId(vNode),
            path: vNode.path,
            element: realNode?.outerHTML?.substr(0, 100),
          };
        }),
      })
    );
  }

  triggerUpdate(vNode: VNode): void {
    // 触发VNode更新
    launchUpdateFromVNode(vNode);
  }

  addListener(listener: Listener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: Listener): void {
    this.listeners = this.listeners.filter(item => item != listener);
  }

  // 触发所有使用的props的VNode更新
  allChange(): void {
    const keyIt = this.keyVNodes.keys();
    let keyItem = keyIt.next();
    while (!keyItem.done) {
      this.setProp(keyItem.value, {});
      keyItem = keyIt.next();
    }
  }

  arrayLengthChange(length: number): void {
    const keyIt = this.keyVNodes.keys();
    let keyItem = keyIt.next();
    while (!keyItem.done) {
      if (keyItem.value >= length) {
        this.setProp(keyItem.value, {});
      }
      keyItem = keyIt.next();
    }
  }

  // 删除Observer中保存的这个VNode的关系数据
  clearByVNode(vNode: VNode): void {
    const keys = this.vNodeKeys.get(vNode);
    if (keys) {
      keys.forEach((key: any) => {
        const vNodes = this.keyVNodes.get(key);
        vNodes!.delete(vNode);
        if (vNodes!.size === 0) {
          this.keyVNodes.delete(key);
        }
      });
    }

    this.vNodeKeys.delete(vNode);
  }
}
