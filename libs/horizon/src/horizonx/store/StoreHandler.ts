//@ts-ignore
import { useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { createProxy } from '../proxy/ProxyHandler';
import readonlyProxy from '../proxy/readonlyProxy';
import { StoreHandler, StoreConfig, UserActions, UserComputedValues } from '../types';
import { Observer } from '../proxy/Observer';
import { FunctionComponent, ClassComponent } from '../Constants';

const storeMap = new Map();

function isPromise(obj: any): boolean {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

export function createStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  config: StoreConfig<S, A, C>
): () => StoreHandler<S, A, C> {
  let handler: any = {
    $subscribe: null,
    $unsubscribe: null,
    $state: null,
    $config: config,
    $queue: null,
    $actions: {},
    $computed: {},
  };

  const obj = {
    ...config,
    config,
    plannedActions: [],
    rawState: config.state,
    rawActions: { ...config.actions },
  };

  // 校验
  if (Object.prototype.toString.call(obj) !== '[object Object]') {
    throw new Error('store obj must be pure object');
  }

  const proxyObj = createProxy(obj.state, !obj.options?.suppressHooks);
  proxyObj.$pending = false;
  handler.$subscribe = listener => {
    proxyObj.addListener(listener);
  };
  handler.$unsubscribe = listener => {
    proxyObj.removeListener(listener);
  };
  obj.rawState = obj.state;
  obj.state = proxyObj;

  handler.$state = obj.state;

  handler.$config = obj.config;

  // handles.$reset = ()=>{
  //   const keys = Object.keys(obj.state);
  //   Object.entries(obj.defaultState).forEach(([key,value])=>{
  //     obj.state[key]=value;
  //   });
  //   keys.forEach(key => {
  //     if(!obj.defaultState[key]){
  //       delete obj.state[key];
  //     }
  //   });
  // };

  function tryNextAction() {
    if (!obj.plannedActions.length) {
      proxyObj.$pending = false;
      return;
    }

    const nextAction = obj.plannedActions.shift();
    const result = obj.rawActions[nextAction.action].bind(self, obj.state)(...nextAction.payload);

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
  Object.keys(obj.actions).forEach(key => {
    (obj.actions as any)[key] = handler[key] = function Wrapped(...payload) {
      return obj.rawActions[key].bind(self, obj.state)(...payload);
    };
  });

  handler.$queue = {};
  Object.keys(obj.rawActions).forEach(action => {
    handler.$queue[action] = (...payload) => {
      return new Promise(resolve => {
        if (!proxyObj.$pending) {
          proxyObj.$pending = true;
          const result = obj.rawActions[action].bind(self, obj.state)(...payload);

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
          obj.plannedActions.push({
            action,
            payload,
            resolve,
          });
        }
      });
    };
  });

  handler.$actions = obj.actions;

  // native getters
  Object.keys(obj.state).forEach(key => {
    Object.defineProperty(handler, key, {
      get: () => obj.state[key],
    });
  });

  // computed
  if (obj.computed) {
    Object.keys(obj.computed).forEach(key => {
      // supports access through attributes
      Object.defineProperty(handler, key, {
        get: obj.computed[key].bind(handler, readonlyProxy(obj.state)),
      });

      // supports access through function
      (obj.computed as any)[key] = obj.computed[key].bind(handler, readonlyProxy(obj.state));
    });
  }
  handler.$computed = obj.computed || {};

  if (config.id) {
    storeMap.set(config.id, handler);
  }

  return createStoreHook(handler);
}

function clearVNodeObservers(vNode) {
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

  if (processingVNode.observers) {
    // 清除上一次缓存的Observer依赖
    clearVNodeObservers(processingVNode);
  } else {
    processingVNode.observers = new Set<Observer>();
  }

  if (processingVNode.tag === FunctionComponent) {
    // from FunctionComponent
    const vNodeRef = useRef(null);
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
      processingVNode.classComponentWillUnmount = function(vNode) {
        clearVNodeObservers(vNode);
        vNode.observers = null;
      };
    }
  }
}

function createStoreHook<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  storeHandler: StoreHandler<S, A, C>
): () => StoreHandler<S, A, C> {
  return () => {
    if (!storeHandler.$config.options?.suppressHooks) {
      hookStore();
    }

    return storeHandler;
  };
}

export function useStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(
  id: string
): StoreHandler<S, A, C> {
  const storeObj = storeMap.get(id);

  if (!storeObj.$config.options?.suppressHooks) {
    hookStore();
  }

  return storeObj;
}

export function clearStore(id: string): void {
  storeMap.delete(id);
}
