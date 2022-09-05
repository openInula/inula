/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */

//@ts-ignore
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

export class Observer implements IObserver {
  vNodeKeys = new WeakMap();

  keyVNodes = new Map();

  listeners: (() => void)[] = [];

  watchers = {} as { [key: string]: ((key: string, oldValue: any, newValue: any) => void)[] };

  useProp(key: string | symbol): void {
    const processingVNode = getProcessingVNode();
    if (processingVNode === null || !processingVNode.observers) {
      return;
    }

    // vNode -> Observers
    processingVNode.observers.add(this);

    // key -> vNodes
    let vNodes = this.keyVNodes.get(key);
    if (!vNodes) {
      vNodes = new Set();
      this.keyVNodes.set(key, vNodes);
    }
    vNodes.add(processingVNode);

    // vNode -> keys
    let keys = this.vNodeKeys.get(processingVNode);
    if (!keys) {
      keys = new Set();
      this.vNodeKeys.set(processingVNode, keys);
    }
    keys.add(key);
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter(item => item != listener);
  }

  setProp(key: string | symbol): void {
    const vNodes = this.keyVNodes.get(key);
    vNodes?.forEach((vNode: VNode) => {
      if (vNode.isStoreChange) {
        // update already triggered
        return;
      }
      vNode.isStoreChange = true;

      // 触发vNode更新
      this.triggerUpdate(vNode);
    });
    this.triggerChangeListeners();
  }

  triggerChangeListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  triggerUpdate(vNode: VNode): void {
    if (!vNode) {
      return;
    }
    launchUpdateFromVNode(vNode);
  }

  allChange(): void {
    let keyIt = this.keyVNodes.keys();
    let keyItem = keyIt.next();
    while (!keyItem.done) {
      this.setProp(keyItem.value);
      keyItem = keyIt.next();
    }
  }

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
