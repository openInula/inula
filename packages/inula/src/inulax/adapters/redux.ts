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

import { createStore as createStoreX } from '../store/StoreHandler';

export { thunk } from './reduxThunk';

export {
  Provider,
  useSelector,
  useStore,
  useDispatch,
  connect,
  createSelectorHook,
  createDispatchHook,
} from './reduxReact';

export type ReduxStoreHandler<T = any> = {
  reducer(state: T, action: { type: string }): any;
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

type StoreCreator = (reducer: Reducer, preloadedState?: any) => ReduxStoreHandler
type StoreEnhancer = (next: StoreCreator) => StoreCreator

function mergeData(state, data) {
  if (!data) {
    state.stateWrapper = data;
    return;
  }

  if (Array.isArray(data) && Array.isArray(state?.stateWrapper)) {
    state.stateWrapper.length = data.length;
    data.forEach((item, idx) => {
      if (item != state.stateWrapper[idx]) {
        state.stateWrapper[idx] = item;
      }
    });
    return;
  }

  if (typeof data === 'object' && typeof state?.stateWrapper === 'object') {
    Object.keys(state.stateWrapper).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        delete state.stateWrapper[key];
      }
    });

    Object.entries(data).forEach(([key, value]) => {
      if (state.stateWrapper[key] !== value) {
        state.stateWrapper[key] = value;
      }
    });
    return;
  }

  state.stateWrapper = data;
}

export function createStore(reducer: Reducer, preloadedState?: any, enhancers?: StoreEnhancer): ReduxStoreHandler {
  const store = createStoreX({
    id: 'defaultStore',
    state: { stateWrapper: preloadedState },
    actions: {
      dispatch: (state: { stateWrapper?: any }, action) => {
        let result;
        if (state.stateWrapper !== undefined && state.stateWrapper !== null) {
          result = reducer(state.stateWrapper, action);
        } else {
          result = reducer(undefined, action);
        }

        if (result === undefined) {
          return;
        } // NOTE: reducer should never return undefined, in this case, do not change state
        state.stateWrapper = result;
      },
    },
    options: {
      isReduxAdapter: true,
    },
  })();

  const result: Record<string, any> = {
    reducer,
    getState: function () {
      return store.$s.stateWrapper;
    },
    subscribe: listener => {
      store.$subscribe(listener);

      return () => {
        store.$unsubscribe(listener);
      };
    },
    replaceReducer: newReducer => {
      reducer = newReducer;
    },
    _inulaXstore: store,
    dispatch: store.$a.dispatch,
  };

  result.dispatch({ type: 'InulaX' });

  store.reduxHandler = result;

  if (typeof enhancers === 'function') {
    return enhancers(createStore)(reducer, preloadedState);
  }

  return result as ReduxStoreHandler;
}

export function combineReducers(reducers: { [key: string]: Reducer }): Reducer {
  return (state, action) => {
    state = state || {};
    const newState = {};
    Object.entries(reducers).forEach(([key, reducer]) => {
      newState[key] = reducer(state[key], action);
    });
    return newState;
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
    return storeObj;
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
type Dispatch = (action: ReduxAction) => any;

export function bindActionCreators(actionCreators: ActionCreators, dispatch: Dispatch): BoundActionCreators {
  const boundActionCreators = {};
  Object.entries(actionCreators).forEach(([key, value]) => {
    boundActionCreators[key] = (...args) => {
      dispatch(value(...args));
    };
  });

  return boundActionCreators;
}

export function compose<T = StoreCreator>(...middlewares: ((...args: any[]) => any)[]): (...args: any[]) => T {
  return (...args) => {
    let val: any;
    middlewares.reverse().forEach((middleware, index) => {
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
  fn();
}
