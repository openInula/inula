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

import { launchUpdateFromVNode } from '../../renderer/TreeBuilder';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { VNode } from '../../renderer/vnode/VNode';

export interface IObserver {
  useProp: (key: string) => void;

  addListener: (listener: () => void) => void;

  removeListener: (listener: () => void) => void;

  setProp: (key: string) => void;

  triggerChangeListeners: () => void;

  triggerUpdate: (vNode: any) => void;

  allChange: () => void;

  clearByVNode: (vNode: any) => void;
}

/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
export class Observer implements IObserver {
  vNodeKeys = new WeakMap();

  keyVNodes = new Map();

  listeners: (() => void)[] = [];

  watchers = {} as { [key: string]: ((key: string, oldValue: any, newValue: any) => void)[] };

  // 对象的属性被使用时调用
  useProp(key: string | symbol): void {
    const processingVNode = getProcessingVNode();
    if (processingVNode === null || !processingVNode.observers) {
      // 异常场景
      return;
    }

    // vNode -> Observers
    processingVNode.observers.add(this);

    // key -> vNodes，记录这个prop被哪些VNode使用了
    let vNodes = this.keyVNodes.get(key);
    if (!vNodes) {
      vNodes = new Set();
      this.keyVNodes.set(key, vNodes);
    }
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
  setProp(key: string | symbol): void {
    const vNodes = this.keyVNodes.get(key);
    vNodes?.forEach((vNode: VNode) => {
      if (vNode.isStoreChange) {
        // VNode已经被触发过，不再重复触发
        return;
      }
      vNode.isStoreChange = true;

      // 触发vNode更新
      this.triggerUpdate(vNode);
    });

    this.triggerChangeListeners();
  }

  triggerUpdate(vNode: VNode): void {
    if (!vNode) {
      return;
    }

    // 触发VNode更新
    launchUpdateFromVNode(vNode);
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter(item => item != listener);
  }

  triggerChangeListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // 触发所有使用的props的VNode更新
  allChange(): void {
    const keyIt = this.keyVNodes.keys();
    let keyItem = keyIt.next();
    while (!keyItem.done) {
      this.setProp(keyItem.value);
      keyItem = keyIt.next();
    }
  }

  // 删除Observer中保存的这个VNode的关系数据
  clearByVNode(vNode: VNode): void {
    const keys = this.vNodeKeys.get(vNode);
    if (keys) {
      keys.forEach((key: any) => {
        const vNodes = this.keyVNodes.get(key);
        vNodes.delete(vNode);
        if (vNodes.size === 0) {
          this.keyVNodes.delete(key);
        }
      });
    }

    this.vNodeKeys.delete(vNode);
  }
}
