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
import { useState, useContext, useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { createContext } from '../../renderer/components/context/CreateContext';
import { createElement } from '../../external/JSXElement';
import { BoundActionCreator } from './redux';
import { ReduxAction } from './redux';
import { ReduxStoreHandler } from '../store/StoreHandler'

const DefaultContext = createContext(null);
type Context = typeof DefaultContext;

export function Provider({
  store,
  context = DefaultContext,
  children,
}: {
  store: ReduxStoreHandler;
  context: Context;
  children?: any[];
}) {
  const Context = context; // NOTE: bind redux API to horizon API requires this renaming;
  return createElement(Context.Provider, { value: store }, children);
}

export function createStoreHook(context: Context) {
  return () => {
    return useContext(context);
  };
}

export function createSelectorHook(context: Context): (selector?: (any) => any) => any {
  const store = (createStoreHook(context)() as unknown) as ReduxStoreHandler;
  return function(selector = state => state) {
    const [b, fr] = useState(false);

    useEffect(() => {
      const unsubscribe = store.subscribe(() => fr(!b));
      return () => {
        unsubscribe();
      };
    });

    return selector(store.getState());
  };
}

export function createDispatchHook(context: Context): ()=>BoundActionCreator {
  const store = (createStoreHook(context)() as unknown) as ReduxStoreHandler;
  return function() {
    return action => {
      store.dispatch(action);
    };
  }.bind(store);
}

export const useSelector = selector => {
  return createSelectorHook(DefaultContext)(selector);
};

export const useDispatch = () => {
  return createDispatchHook(DefaultContext)();
};

export const useStore = () => {
  return createStoreHook(DefaultContext)();
};

// function shallowCompare(a,b){
//     return Object.keys(a).length === Object.keys(b).length &&
//     Object.keys(a).every(key => a[key] === b[key]);
// }

//TODO: implement options
// context?: Object,
// areStatesEqual?: Function, :)
// areOwnPropsEqual?: Function,
// areStatePropsEqual?: Function,
// areMergedPropsEqual?: Function,
// forwardRef?: boolean,
// const defaultOptions = {
//     areStatesEqual: shallowCompare,
//     areOwnPropsEqual: shallowCompare,
//     areStatePropsEqual: shallowCompare,
//     areMergedPropsEqual: shallowCompare
// };

export function connect(
  mapStateToProps?: (state: any, ownProps: { [key: string]: any }) => Object,
  mapDispatchToProps?:
    | { [key: string]: (...args: any[]) => ReduxAction }
    | ((dispatch: (action: ReduxAction) => any, ownProps?: Object) => Object),
  mergeProps?: (stateProps: Object, dispatchProps: Object, ownProps: Object) => Object,
  options?: {
    areStatesEqual?: (oldState: any, newState: any) => boolean;
    context?: any; // TODO: type this
  }
) {
  if (!options) {
    options = {};
  }

  return Component => {
    const useStore = createStoreHook(options?.context || DefaultContext);

    function Wrapper(props) {
      const [f, forceReload] = useState(true);

      const store = (useStore() as unknown) as ReduxStoreHandler;

      useEffect(() => {
        const unsubscribe = store.subscribe(() => forceReload(!f));
        return () => {
          unsubscribe();
        };
      });

      const previous = useRef({
        state: {},
        mappedState: {},
      }) as {
        current: {
          state: {};
          mappedState: {};
        };
      };

      let mappedState;
      if (options?.areStatesEqual) {
        if (options.areStatesEqual(previous.current.state, store.getState())) {
          mappedState = previous.current.mappedState;
        } else {
          mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : {};
          previous.current.mappedState = mappedState;
        }
      } else {
        mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : {};
        previous.current.mappedState = mappedState;
      }
      let mappedDispatch: { dispatch?: (action) => void } = {};
      if (mapDispatchToProps) {
        if (typeof mapDispatchToProps === 'object') {
          Object.entries(mapDispatchToProps).forEach(([key, value]) => {
            mappedDispatch[key] = (...args) => {
              store.dispatch(value(...args));
            };
          });
        } else {
          mappedDispatch = mapDispatchToProps(store.dispatch, props);
        }
      } else {
        mappedDispatch.dispatch = store.dispatch;
      }
      const mergedProps = (
        mergeProps ||
        ((state, dispatch, originalProps) => {
          return { ...state, ...dispatch, ...originalProps };
        })
      )(mappedState, mappedDispatch, props);

      previous.current.state = store.getState();

      const node = createElement(Component, mergedProps);
      return node;
    }

    return Wrapper;
  };
}
