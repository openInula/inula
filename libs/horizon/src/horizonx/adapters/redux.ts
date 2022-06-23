import { createStore as createStoreX } from '../store/StoreHandler';

import { ReduxStoreHandler, ReduxAction, ReduxMiddleware } from '../types';

export { thunk } from './reduxThunk';

export { Provider, useSelector, useStore, useDispatch, connect, createSelectorHook, createDispatchHook } from './reduxReact';

type Reducer = (state: any, action: ReduxAction) => any;

export function createStore(reducer: Reducer, preloadedState: any, enhancers): ReduxStoreHandler {
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
      suppressHooks: true,
    },
  })();

  const result = {
    reducer,
    getState: function() {
      return store.$state.stateWrapper;
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
    _horizonXstore: store,
    dispatch: store.$actions.dispatch,
  };

  enhancers && enhancers(result);

  result.dispatch({ type: 'HorizonX' });

  store.reduxHandler = result;

  return result;
}

export function combineReducers(reducers: { [key: string]: Reducer }): Reducer {
  return (state = {}, action) => {
    const newState = {};
    Object.entries(reducers).forEach(([key, reducer]) => {
      newState[key] = reducer(state[key], action);
    });
    return newState;
  };
}

export function applyMiddleware(...middlewares: ReduxMiddleware[]): (store: ReduxStoreHandler) => void {
  return store => {
    return applyMiddlewares(store, middlewares);
  };
}

function applyMiddlewares(store: ReduxStoreHandler, middlewares: ReduxMiddleware[]): void {
  middlewares = middlewares.slice();
  middlewares.reverse();
  let dispatch = store.dispatch;
  middlewares.forEach(middleware => {
    dispatch = middleware(store)(dispatch);
  });
  store.dispatch = dispatch;
}

type ActionCreator = (...params: any[]) => ReduxAction;
type ActionCreators = { [key: string]: ActionCreator };
export type BoundActionCreator = (...params: any[]) => void;
type BoundActionCreators = { [key: string]: BoundActionCreator };
type Dispatch = (action) => any;

export function bindActionCreators(actionCreators: ActionCreators, dispatch: Dispatch): BoundActionCreators {
  const boundActionCreators = {};
  Object.entries(actionCreators).forEach(([key, value]) => {
    boundActionCreators[key] = (...args) => {
      dispatch(value(...args));
    };
  });

  return boundActionCreators;
}

export function compose(middlewares: ReduxMiddleware[]) {
  return (store: ReduxStoreHandler, extraArgument: any) => {
    let val;
    middlewares.reverse().forEach((middleware: ReduxMiddleware, index) => {
      if (!index) {
        val = middleware(store, extraArgument);
        return;
      }
      val = middleware(val);
    });
    return val;
  };
}


// HorizonX batches updates by default, this function is only for backwards compatibility
export function batch(fn: () => void) {
  fn();
}
