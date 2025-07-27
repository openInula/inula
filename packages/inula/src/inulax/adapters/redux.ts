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

import { getRandomStr } from '../CommonUtils';
import { unstable_batchedUpdates } from '../../dom/DOMExternal';

export { thunk } from './reduxThunk';

export {
  Provider,
  useSelector,
  useStore,
  useDispatch,
  connect,
  createSelectorHook,
  createDispatchHook,
  ReduxAdapterContext,
} from './reduxReact';

export type ReduxStoreHandler<T = any> = {
  dispatch(action: { type: string }): void;
  getState(): T;
  subscribe(listener: () => void): () => void;
  replaceReducer(reducer: (state: T, action: { type: string }) => any): void;
};

export type ReduxAction = {
  type: string;
  [key: string]: any;
};

export type ReduxMiddleware = (
  store: ReduxStoreHandler,
  extraArgument?: any
) => (
  next: (action: ReduxAction) => any
) => (
  action:
    | ReduxAction
    | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)
) => ReduxStoreHandler;

type Reducer = (state: any, action: ReduxAction) => any;

type StoreCreator = (reducer: Reducer, preloadedState?: any) => ReduxStoreHandler;
type StoreEnhancer = (next: StoreCreator) => StoreCreator;

const BuildInAction = {
  INIT: `@@reduxAdapter/INIT${getRandomStr()}`,
  REPLACE: `@@reduxAdapter/REPLACE${getRandomStr()}`,
};

export function createStore(reducer: Reducer, preloadedState?: any, enhancer?: StoreEnhancer): ReduxStoreHandler {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(reducer, preloadedState);
  }

  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners: Record<number, () => void> | null = {};
  let nextListeners = currentListeners;
  let listenerId = 0;
  let inDispatching = false;

  function getState(): any {
    if (inDispatching) {
      throw new Error('Avoid calling store.getState() in reducers. Use the provided state parameter directly.');
    }
    return currentState;
  }

  // 确保nextListeners在当前的操作中可被安全的修改，不影响currentListeners
  function safelyMutateNextListener() {
    if (nextListeners === currentListeners) {
      nextListeners = { ...currentListeners };
    }
  }

  function dispatch(action: ReduxAction) {
    try {
      inDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      inDispatching = false;
    }
    currentListeners = nextListeners;
    Object.values(currentListeners).forEach(cb => {
      cb();
    });
  }

  function replaceReducer(nextReducer: Reducer): void {
    currentReducer = nextReducer;
    dispatch({ type: BuildInAction.REPLACE });
  }

  function subscribe(listener: () => void) {
    if (inDispatching) {
      throw new Error(
        'Avoid store.subscribe() in reducers. Subscribe in components and use store.getState() in the callback instead.'
      );
    }

    let subscribed = true;
    safelyMutateNextListener();
    const id = listenerId++;
    nextListeners[id] = listener;

    return function () {
      if (!subscribed) {
        return;
      }
      if (inDispatching) {
        throw new Error("Don't unsubscribe from store listeners during reducer execution.");
      }
      subscribed = false;
      safelyMutateNextListener();
      delete nextListeners[id];
      currentListeners = null;
    };
  }

  dispatch({ type: BuildInAction.INIT });

  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer,
  };
}

export function combineReducers(reducers: Record<string, Reducer>): Reducer {
  const finalReducers = Object.keys(reducers).reduce<Record<string, Reducer>>((final, key) => {
    if (typeof reducers[key] === 'function') {
      final[key] = reducers[key];
    }
    return final;
  }, {});

  const finalReducerKeys = Object.keys(finalReducers);

  return (state = {}, action) => {
    let changed = false;
    const newState = {};
    for (const reducerKey of finalReducerKeys) {
      const reducer = finalReducers[reducerKey];
      const previousReducerState = state[reducerKey];
      const nextReducerState = reducer(previousReducerState, action);
      if (typeof nextReducerState === 'undefined') {
        const actionType = action?.type;
        throw new Error(
          `Reducer for key "${reducerKey}" returned undefined on action ${
            actionType ? `"${String(actionType)}"` : '(unknown type)'
          }. Return the previous state or null instead.`
        );
      }
      newState[reducerKey] = nextReducerState;
      changed = changed || nextReducerState !== previousReducerState;
    }
    changed = changed || finalReducerKeys.length !== Object.keys(state).length;
    return changed ? newState : state;
  };
}

function applyMiddlewares(createStore: StoreCreator, middlewares: ReduxMiddleware[]): StoreCreator {
  return (reducer, preloadedState) => {
    middlewares = middlewares.slice();
    middlewares.reverse();
    const storeObj = createStore(reducer, preloadedState);
    let dispatch = storeObj.dispatch;
    middlewares.forEach(middleware => {
      dispatch = middleware(storeObj)(dispatch);
    });
    storeObj.dispatch = dispatch;
    return { ...storeObj, dispatch: dispatch };
  };
}

export function applyMiddleware(...middlewares: ReduxMiddleware[]): (createStore: StoreCreator) => StoreCreator {
  return createStore => {
    return applyMiddlewares(createStore, middlewares);
  };
}

type ActionCreator = (...params: any[]) => ReduxAction;
type ActionCreators = { [key: string]: ActionCreator };
export type BoundActionCreator = (...params: any[]) => void;
type BoundActionCreators = { [key: string]: BoundActionCreator };
export type Dispatch = (action: ReduxAction) => any;

export function bindActionCreators(actionCreators: ActionCreators, dispatch: Dispatch): BoundActionCreators {
  const boundActionCreators = {};
  Object.entries(actionCreators).forEach(([key, value]) => {
    boundActionCreators[key] = (...args) => {
      return dispatch(value(...args));
    };
  });

  return boundActionCreators;
}

export function compose<T = StoreCreator>(...middlewares: ((...args: any[]) => any)[]): (...args: any[]) => T {
  return (...args) => {
    let val: any;
    middlewares
      .slice()
      .reverse()
      .forEach((middleware, index) => {
        if (!index) {
          val = middleware(...args);
          return;
        }
        val = middleware(val);
      });
    return val;
  };
}

// InulaX batches updates by default, this function is only for backwards compatibility
export function batch(fn: () => void) {
  unstable_batchedUpdates(fn);
}
