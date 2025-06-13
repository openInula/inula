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

import { useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { createProxy } from '../proxy/ProxyHandler';
import readonlyProxy from '../proxy/ReadonlyProxy';
import { Observer } from '../proxy/Observer';
import { FunctionComponent, ClassComponent } from '../../renderer/vnode/VNodeTags';
import { isPromise } from '../CommonUtils';
import type {
  ActionFunction,
  ComputedValues,
  PlannedAction,
  QueuedStoreActions,
  StoreActions,
  StoreConfig,
  StoreObj,
  UserActions,
  UserComputedValues,
} from '../types/StoreTypes';
import { VNode } from '../../renderer/vnode/VNode';
import { devtools } from '../devtools';
import {
  ACTION,
  ACTION_QUEUED,
  INITIALIZED,
  QUEUE_FINISHED,
  QUEUE_PENDING,
  STATE_CHANGE,
  SUBSCRIBED,
  UNSUBSCRIBED,
} from '../devtools/constants';
import { CurrentListener } from '../types/ProxyTypes';

const idGenerator = {
  id: 0,
  get: function (prefix) {
    return prefix.toString() + this.id++;
  },
};

const storeMap = new Map<string, StoreObj<any, any, any>>();
const pendingMap = new WeakMap<any, boolean | number>();

// 通过该方法执行store.$queue中的action
function tryNextAction(storeObj, proxyObj, config, plannedActions) {
  if (!plannedActions.length) {
    if (pendingMap.get(proxyObj)) {
      const timestamp = Date.now();
      const duration = timestamp - (pendingMap.get(proxyObj) as number);
      pendingMap.set(proxyObj, false);
      devtools.emit(QUEUE_FINISHED, {
        store: storeObj,
        endedAt: timestamp,
        duration,
      });
    }
    return;
  }

  const nextAction = plannedActions.shift()!;
  const result = config.actions
    ? config.actions[nextAction.action].bind(storeObj, proxyObj)(...nextAction.payload)
    : undefined;

  if (isPromise(result)) {
    result.then(value => {
      nextAction.resolve(value);
      tryNextAction(storeObj, proxyObj, config, plannedActions);
    });
  } else {
    nextAction.resolve(result);
    tryNextAction(storeObj, proxyObj, config, plannedActions);
  }
}

// 删除Observers中保存的这个VNode的相关数据
export function clearVNodeObservers(vNode: VNode) {
  if (!vNode.observers) {
    return;
  }

  vNode.observers.forEach(observer => {
    observer.clearByVNode(vNode);
  });

  vNode.observers.clear();
}

// createStore返回的是一个getStore的函数
function createGetStore<S extends Record<string, any>, A extends UserActions<S>, C extends UserComputedValues<S>>(
  storeObj: StoreObj<S, A, C>
): () => StoreObj<S, A, C> {
  const getStore = () => {
    return storeObj;
  };

  return getStore;
}

export function createStore<S extends Record<string, any>, A extends UserActions<S>, C extends UserComputedValues<S>>(
  config: StoreConfig<S, A, C>
): () => StoreObj<S, A, C> {
  // 校验
  if (Object.prototype.toString.call(config) !== '[object Object]') {
    throw new Error('store obj must be pure object');
  }

  const id = config.id || idGenerator.get('UNNAMED_STORE');

  const listener: CurrentListener = {
    current: listener => {},
  };

  const proxyObj = createProxy(config.state, listener, config.options?.isReduxAdapter, config.options?.isReduxAdapter);

  if (proxyObj !== undefined) {
    pendingMap.set(proxyObj, false);
  }

  const $a: Partial<StoreActions<S, A>> = {};
  const $queue: Partial<StoreActions<S, A>> = {};
  const $c: Partial<ComputedValues<S, C>> = {};
  const storeObj = {
    id,
    $state: proxyObj,
    $s: proxyObj,
    $a: $a as StoreActions<S, A>,
    $c: $c as ComputedValues<S, C>,
    $queue: $queue as QueuedStoreActions<S, A>,
    $config: config,
    $subscriptions: [
      change => {
        devtools.emit(STATE_CHANGE, {
          store: storeObj,
          change,
        });
      },
    ],
    $subscribe: listener => {
      devtools.emit(SUBSCRIBED, { store: storeObj, listener });
      storeObj.$subscriptions.push(listener);
      return () => {
        storeObj.$unsubscribe(listener);
      };
    },
    $unsubscribe: listener => {
      devtools.emit(UNSUBSCRIBED, { store: storeObj });
      storeObj.$subscriptions = storeObj.$subscriptions.filter(item => item != listener);
    },
  } as unknown as StoreObj<S, A, C>;

  listener.current = (...args) => {
    storeObj.$subscriptions.forEach(listener => listener(...args));
  };

  const plannedActions: PlannedAction<S, ActionFunction<S>>[] = [];

  // 包装actions
  if (config.actions) {
    Object.keys(config.actions).forEach(action => {
      // 让store.$queue[action]可以访问到action方法
      // 要达到的效果：如果通过store.$queue[action1]调用的action1返回promise,会阻塞下一个store.$queue[action2]
      ($queue as any)[action] = (...payload) => {
        devtools.emit(ACTION_QUEUED, {
          store: storeObj,
          action: {
            action,
            payload,
          },
          fromQueue: true,
        });
        return new Promise(resolve => {
          if (!pendingMap.get(proxyObj)) {
            pendingMap.set(proxyObj, Date.now());
            devtools.emit(QUEUE_PENDING, {
              store: storeObj,
              startedAt: pendingMap.get(proxyObj),
            });

            const result = config.actions![action].bind(storeObj, proxyObj)(...payload);

            if (isPromise(result)) {
              result.then(value => {
                resolve(value);
                tryNextAction(storeObj, proxyObj, config, plannedActions);
              });
            } else {
              resolve(result);
              tryNextAction(storeObj, proxyObj, config, plannedActions);
            }
          } else {
            // 加入队列
            plannedActions.push({
              action,
              payload,
              resolve,
            });
          }
        });
      };

      // 让store.$a[action]可以访问到action方法
      ($a as any)[action] = function Wrapped(...payload) {
        devtools.emit(ACTION, {
          store: storeObj,
          action: {
            action,
            payload,
          },
          fromQueue: false,
        });
        return config.actions![action].bind(storeObj, proxyObj)(...payload);
      };

      // 让store[action]可以访问到action方法
      Object.defineProperty(storeObj, action, {
        writable: false,
        value: (...payload) => {
          devtools.emit(ACTION, {
            store: storeObj,
            action: {
              action,
              payload,
            },
            fromQueue: false,
          });
          return config.actions![action].bind(storeObj, proxyObj)(...payload);
        },
      });
    });
  }

  if (config.computed) {
    Object.keys(config.computed).forEach(computeKey => {
      const computeFn = config.computed![computeKey].bind(storeObj, readonlyProxy(proxyObj));
      // 让store.$c[computeKey]可以访问到computed的值
      Object.defineProperty($c, computeKey, {
        get: computeFn as () => any,
      });

      // 让store[computeKey]可以访问到computed的值
      Object.defineProperty(storeObj, computeKey, {
        get: computeFn as () => any,
      });
    });
  }

  // 让store[key]可以访问到state的值
  if (config.state) {
    Object.keys(config.state).forEach(key => {
      Object.defineProperty(storeObj, key, {
        get: () => {
          // 从Proxy对象获取值，会触发代理
          return proxyObj[key];
        },
        set: value => {
          proxyObj[key] = value;
        },
      });
    });
  }

  storeMap.set(id, storeObj);

  devtools.emit(INITIALIZED, {
    store: storeObj,
  });

  return createGetStore(storeObj);
}

// 函数组件中使用的hook
export function useStore<S extends Record<string, unknown>, A extends UserActions<S>, C extends UserComputedValues<S>>(
  id: string
): StoreObj<S, A, C> {
  const storeObj = storeMap.get(id);

  return storeObj as StoreObj<S, A, C>;
}

export function getStore(id: string) {
  return storeMap.get(id);
}

export function getAllStores() {
  return Object.fromEntries(storeMap);
}

export function clearStore(id: string): void {
  storeMap.delete(id);
}
