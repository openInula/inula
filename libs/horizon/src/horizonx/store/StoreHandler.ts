//@ts-ignore
import { useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { getProcessingVNode } from '../../renderer/GlobalVar';
import { createProxy } from '../proxy/ProxyHandler';
import readonlyProxy from '../proxy/readonlyProxy';
import { StoreHandler, StoreConfig, UserActions, UserComputedValues, StoreActions, ComputedValues, ActionFunction, Action, QueuedStoreActions } from '../types';
import { Observer } from '../proxy/Observer';
import { FunctionComponent, ClassComponent } from '../Constants';

const storeMap = new Map<string,StoreHandler<any,any,any>>();

function isPromise(obj: any): boolean {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

type PlannedAction<S extends object,F extends ActionFunction<S>>={
  action:string,
  payload: any[],
  resolve: ReturnType<F>
}

export function createStore<S extends object,A extends UserActions<S>,C extends UserComputedValues<S>>(config: StoreConfig<S,A,C>): () => StoreHandler<S,A,C> {
  //create a local shalow copy to ensure consistency (if user would change the config object after store creation)
  config = {
    id:config.id,
    options: config.options,
    state: config.state,
    actions: config.actions ? {...config.actions}:undefined,
    computed: config.computed ? {...config.computed}:undefined
  }

  // 校验
  if (Object.prototype.toString.call(config) !== '[object Object]') {
    throw new Error('store obj must be pure object');
  }

  const proxyObj = createProxy(config.state, !config.options?.suppressHooks);
  
  proxyObj.$pending = false;
  
  const $subscribe = (listener) => {
    proxyObj.addListener(listener);
  };
  
  const $unsubscribe = (listener) => {
    proxyObj.removeListener(listener);
  };

  const plannedActions:PlannedAction<S,ActionFunction<S>>[] = [];
  const $actions:Partial<StoreActions<S,A>>={}
  const $queue:Partial<StoreActions<S,A>> = {};
  const $computed:Partial<ComputedValues<S,C>>={}
  const handler = {
    $subscribe,
    $unsubscribe,
    $actions:$actions as StoreActions<S,A>,
    $state:proxyObj,
    $computed: $computed as ComputedValues<S,C>,
    $config:config,
    $queue: $queue as QueuedStoreActions<S,A>,
  } as StoreHandler<S,A,C>;

  function tryNextAction() {
    if (!plannedActions.length) {
      proxyObj.$pending = false;
      return;
    }

    const nextAction = plannedActions.shift()!;
    const result = config.actions ? config.actions[nextAction.action].bind(self, proxyObj)(...nextAction.payload) : undefined;

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
  if(config.actions){
    Object.keys(config.actions).forEach(action => {
      ($queue as any)[action] = (...payload) => {
        return new Promise((resolve) => {
          if (!proxyObj.$pending) {
            proxyObj.$pending = true;
            const result = config.actions![action].bind(self, proxyObj)(...payload);
  
            if (isPromise(result)) {
              result.then((value) => {
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
              resolve
            });
          }
        });
      };
      
      ($actions as any)[action] = function Wrapped(...payload) {
        return config.actions![action].bind(self, proxyObj)(...payload);
      };

      // direct store access 
      Object.defineProperty(handler, action, {
        writable: false,
        value: $actions[action]
      });
    });
  }

    if (config.computed) {
    Object.keys(config.computed).forEach((key) => {
      ($computed as any)[key] = config.computed![key].bind(handler, readonlyProxy(proxyObj));

      // direct store access 
      Object.defineProperty(handler, key, {
        get: $computed[key] as ()=>any
      });
    });
  }

  // direct state access
  if(config.state){
    Object.keys(config.state).forEach(key => {
      Object.defineProperty(handler, key, {
        get: () => proxyObj[key]
      });
    });
  }

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

  if (storeObj && !storeObj.$config.options?.suppressHooks) hookStore();

  return storeObj as StoreHandler<S,A,C>;
}

export function clearStore(id:string):void {
  storeMap.delete(id);
}