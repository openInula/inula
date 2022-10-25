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

// @ts-ignore
import { useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { createProxy } from '../proxy/ProxyHandler';
import readonlyProxy from '../proxy/readonlyProxy';
import { Observer } from '../proxy/Observer';
import { FunctionComponent, ClassComponent } from '../../renderer/vnode/VNodeTags';
import { VNode } from '../../renderer/Types';

const storeMap = new Map<string, StoreHandler<any, any, any>>();

function isPromise(obj: any): boolean {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

type StoreConfig<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  state?: S;
  actions?: A;
  id?: string;
  computed?: C;
};

export type ReduxStoreHandler = {
  reducer: (state: any, action: { type: string }) => any;
  dispatch: (action: { type: string }) => void;
  getState: () => any;
  subscribe: (listener: () => void) => () => void;
  replaceReducer: (reducer: (state: any, action: { type: string }) => any) => void;
};

type StoreHandler<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  $subscribe: (listener: () => void) => void;
  $unsubscribe: (listener: () => void) => void;
  $s: S;
  $queue: QueuedStoreActions<S, A>;
  $a: StoreActions<S, A>;
  $c: UserComputedValues<S>;
} & { [K in keyof S]: S[K] } & { [K in keyof A]: Action<A[K], S> } & { [K in keyof C]: ReturnType<C[K]> };

type PlannedAction<S extends object, F extends ActionFunction<S>> = {
  action: string;
  payload: any[];
  resolve: ReturnType<F>;
};
type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : ((...b: T) => void) extends (a, ...b: infer I) => void
  ? I
  : [];

type UserActions<S extends object> = { [K: string]: ActionFunction<S> };
type UserComputedValues<S extends object> = { [K: string]: ComputedFunction<S> };

type ActionFunction<S extends object> = (this: StoreHandler<S, any, any>, state: S, ...args: any[]) => any;
type ComputedFunction<S extends object> = (state: S) => any;
type Action<T extends ActionFunction<any>, S extends object> = (
  this: StoreHandler<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => ReturnType<T>;
type AsyncAction<T extends ActionFunction<any>, S extends object> = (
  this: StoreHandler<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => Promise<ReturnType<T>>;

type StoreActions<S extends object, A extends UserActions<S>> = { [K in keyof A]: Action<A[K], S> };
type QueuedStoreActions<S extends object, A extends UserActions<S>> = { [K in keyof A]: AsyncAction<A[K], S> };
type ComputedValues<S extends object, C extends UserComputedValues<S>> = { [K in keyof C]: ReturnType<C[K]> };

export function createStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  config: StoreConfig<S, A, C>
): () => StoreHandler<S, A, C> {
  // create a local shalow copy to ensure consistency (if user would change the config object after store creation)
  config = {
    id: config.id,
    options: config.options,
    state: config.state,
    actions: config.actions ? { ...config.actions } : undefined,
    computed: config.computed ? { ...config.computed } : undefined,
  };

  // 校验
  if (Object.prototype.toString.call(config) !== '[object Object]') {
    throw new Error('store obj must be pure object');
  }

  const proxyObj = createProxy(config.state, !config.options?.reduxAdapter);

  proxyObj.$pending = false;

  const $subscribe = listener => {
    proxyObj.addListener(listener);
  };

  const $unsubscribe = listener => {
    proxyObj.removeListener(listener);
  };

  const plannedActions: PlannedAction<S, ActionFunction<S>>[] = [];
  const $a: Partial<StoreActions<S, A>> = {};
  const $queue: Partial<StoreActions<S, A>> = {};
  const $c: Partial<ComputedValues<S, C>> = {};
  const handler = {
    $subscribe,
    $unsubscribe,
    $a: $a as StoreActions<S, A>,
    $s: proxyObj,
    $c: $c as ComputedValues<S, C>,
    $config: config,
    $queue: $queue as QueuedStoreActions<S, A>,
  } as unknown as StoreHandler<S, A, C>;

  function tryNextAction() {
    if (!plannedActions.length) {
      proxyObj.$pending = false;
      return;
    }

    const nextAction = plannedActions.shift()!;
    const result = config.actions
      ? config.actions[nextAction.action].bind(handler, proxyObj)(...nextAction.payload)
      : undefined;

    if (isPromise(result)) {
      result.then(value => {
        nextAction.resolve(value);
        tryNextAction();
      });
    } else {
      nextAction.resolve(result);
      tryNextAction();
    }
  }

  // 包装actions
  if (config.actions) {
    Object.keys(config.actions).forEach(action => {
      ($queue as any)[action] = (...payload) => {
        return new Promise(resolve => {
          if (!proxyObj.$pending) {
            proxyObj.$pending = true;
            const result = config.actions![action].bind(handler, proxyObj)(...payload);

            if (isPromise(result)) {
              result.then(value => {
                resolve(value);
                tryNextAction();
              });
            } else {
              resolve(result);
              tryNextAction();
            }
          } else {
            plannedActions.push({
              action,
              payload,
              resolve,
            });
          }
        });
      };

      ($a as any)[action] = function Wrapped(...payload) {
        return config.actions![action].bind(handler, proxyObj)(...payload);
      };

      // direct store access
      Object.defineProperty(handler, action, {
        writable: false,
        value: (...payload) => {
          return config.actions![action].bind(handler, proxyObj)(...payload);
        },
      });
    });
  }

  if (config.computed) {
    Object.keys(config.computed).forEach(key => {
      ($c as any)[key] = config.computed![key].bind(handler, readonlyProxy(proxyObj));

      // direct store access
      Object.defineProperty(handler, key, {
        get: $c[key] as () => any,
      });
    });
  }

  // direct state access
  if (config.state) {
    Object.keys(config.state).forEach(key => {
      Object.defineProperty(handler, key, {
        get: () => proxyObj[key],
      });
    });
  }

  if (config.id) {
    storeMap.set(config.id, handler);
  }

  return createStoreHook(handler);
}

export function clearVNodeObservers(vNode) {
  if (!vNode.observers) return;
  vNode.observers.forEach(observer => {
    observer.clearByVNode(vNode);
  });

  vNode.observers.clear();
}

function hookStore() {
  const processingVNode = getProcessingVNode();

  // did not execute in a component
  if (!processingVNode) {
    return;
  }

  if (!processingVNode.observers) {
    processingVNode.observers = new Set<Observer>();
  }

  if (processingVNode.tag === FunctionComponent) {
    // from FunctionComponent
    const vNodeRef = useRef(null) as unknown as { current: VNode };
    vNodeRef.current = processingVNode;

    useEffect(() => {
      return () => {
        clearVNodeObservers(vNodeRef.current);
        vNodeRef.current.observers = null;
      };
    }, []);
  } else if (processingVNode.tag === ClassComponent) {
    // from ClassComponent
    if (!processingVNode.classComponentWillUnmount) {
      processingVNode.classComponentWillUnmount = function (vNode) {
        clearVNodeObservers(vNode);
        vNode.observers = null;
      };
    }
  }
}

function createStoreHook<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  storeHandler: StoreHandler<S, A, C>
): () => StoreHandler<S, A, C> {
  const storeHook = () => {
    if (!storeHandler.$config.options?.suppressHooks) {
      hookStore();
    }

    return storeHandler;
  };

  return storeHook;
}

export function useStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  id: string
): StoreHandler<S, A, C> {
  const storeObj = storeMap.get(id);

  if (storeObj && !storeObj.$config.options?.suppressHooks) hookStore();

  return storeObj as StoreHandler<S, A, C>;
}

export function clearStore(id: string): void {
  storeMap.delete(id);
}
