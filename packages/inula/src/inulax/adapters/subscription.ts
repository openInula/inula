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

import { batch, ReduxStoreHandler } from './redux';

type LinkListNode<T> = {
  next: LinkListNode<T>;
  prev: LinkListNode<T>;
  value: T;
} | null;

type Callback = () => void;

interface ListenerManager {
  clear(): void;

  trigger(): void;

  subscribe(cb: Callback): () => void;
}

function getLinkedList<T>() {
  let firstNode: LinkListNode<T> = null;
  let lastNode: LinkListNode<T> = null;

  function clear() {
    firstNode = null;
    lastNode = null;
  }

  function getIterator(): T[] {
    const data: T[] = [];
    let curNode = firstNode;
    while (curNode) {
      data.push(curNode.value);
      curNode = curNode.next;
    }
    return data;
  }

  function add(element: T): NonNullable<LinkListNode<T>> {
    let newNode: LinkListNode<T>;
    if (!firstNode || !lastNode) {
      newNode = {
        value: element,
        prev: null,
        next: null,
      };
      firstNode = lastNode = newNode;
      return newNode;
    } else {
      newNode = {
        value: element,
        prev: lastNode,
        next: null,
      };
      lastNode.next = newNode;
      lastNode = newNode;
      return newNode;
    }
  }

  function removeNode(node: NonNullable<LinkListNode<T>>) {
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      lastNode = node.prev;
    }
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      firstNode = node.next;
    }
  }

  return {
    add,
    clear,
    removeNode,
    getIterator,
  };
}

function getListenerManager(): ListenerManager {
  const linkedList = getLinkedList<Callback>();

  function subscribe(cb: Callback): () => void {
    const listener = linkedList.add(cb);
    return () => linkedList.removeNode(listener);
  }

  function trigger() {
    const listeners = linkedList.getIterator();
    batch(() => {
      for (const listener of listeners) {
        listener();
      }
    });
  }

  function clear() {
    linkedList.clear();
  }

  return {
    clear,
    trigger,
    subscribe,
  };
}

export interface Subscription {
  stateChange?: () => any;

  addNestedSub(listener: Callback): Callback;

  triggerNestedSubs(): void;

  trySubscribe(): void;

  tryUnsubscribe(): void;
}

const nullListenerStore = {} as unknown as ListenerManager;

function createSubscription(store: ReduxStoreHandler, parentSub: Subscription | null = null): Subscription {
  let unsubscribe: Callback | undefined;
  let listenerStore: ListenerManager = nullListenerStore;

  function addNestedSub(listener: Callback) {
    trySubscribe();
    return listenerStore.subscribe(listener);
  }

  function triggerNestedSubs() {
    listenerStore.trigger();
  }

  function storeChangeHandler() {
    if (subscription.stateChange) {
      subscription.stateChange();
    }
  }

  function trySubscribe() {
    if (!unsubscribe) {
      // 尝试订阅store的变化。如果已经存在一个订阅，那么它会添加一个嵌套的订阅。否则，它会直接订阅store。
      unsubscribe = parentSub ? parentSub.addNestedSub(storeChangeHandler) : store.subscribe(storeChangeHandler);
      listenerStore = getListenerManager();
    }
  }

  function tryUnsubscribe() {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
      unsubscribe = undefined;
      listenerStore.clear();
      listenerStore = nullListenerStore;
    }
  }

  const subscription: Subscription = {
    stateChange: undefined,
    addNestedSub,
    triggerNestedSubs,
    trySubscribe,
    tryUnsubscribe,
  };

  return subscription;
}

export default createSubscription;
