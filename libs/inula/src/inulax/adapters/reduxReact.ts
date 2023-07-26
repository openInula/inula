/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { useState, useContext, useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { createContext } from '../../renderer/components/context/CreateContext';
import { createElement } from '../../external/JSXElement';
import type { ReduxStoreHandler, ReduxAction, BoundActionCreator } from './redux';

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
  const Context = context; // NOTE: bind redux API to inula API requires this renaming;
  return createElement(Context.Provider, { value: store }, children);
}

export function createStoreHook(context: Context): () => ReduxStoreHandler {
  return () => {
    return useContext(context) as unknown as ReduxStoreHandler;
  };
}

export function createSelectorHook(context: Context): (selector?: (any) => any) => any {
  const store = createStoreHook(context)() as unknown as ReduxStoreHandler;
  return function (selector = state => state) {
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

export function createDispatchHook(context: Context): () => BoundActionCreator {
  const store = createStoreHook(context)() as unknown as ReduxStoreHandler;
  return function () {
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

export function connect(
  mapStateToProps?: (state: any, ownProps: { [key: string]: any }) => object,
  mapDispatchToProps?:
    | { [key: string]: (...args: any[]) => ReduxAction }
    | ((dispatch: (action: ReduxAction) => any, ownProps?: object) => object),
  mergeProps?: (stateProps: object, dispatchProps: object, ownProps: object) => object,
  options?: {
    areStatesEqual?: (oldState: any, newState: any) => boolean;
    context?: Context;
  }
): Connector<OwnProps, MergedProps> {
  if (!options) {
    options = {};
  }

  //this component should bear the type returned from mapping functions
  return (Component: OriginalComponent<MergedProps>): WrappedComponent<OwnProps> => {
    const useStore = createStoreHook(options?.context || DefaultContext);

    //this component should mimic original type of component used
    const Wrapper: WrappedComponent<OwnProps> = (props: OwnProps) => {
      const [f, forceReload] = useState(true);

      const store = useStore() as unknown as ReduxStoreHandler;

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
          state: { [key: string]: any };
          mappedState: StateProps;
        };
      };

      let mappedState: StateProps;
      if (options?.areStatesEqual) {
        if (options.areStatesEqual(previous.current.state, store.getState())) {
          mappedState = previous.current.mappedState as StateProps;
        } else {
          mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : ({} as StateProps);
          previous.current.mappedState = mappedState;
        }
      } else {
        mappedState = mapStateToProps ? mapStateToProps(store.getState(), props) : ({} as StateProps);
        previous.current.mappedState = mappedState;
      }
      let mappedDispatch: DispatchProps = {} as DispatchProps;
      if (mapDispatchToProps) {
        if (typeof mapDispatchToProps === 'object') {
          Object.entries(mapDispatchToProps).forEach(([key, value]) => {
            mappedDispatch[key] = (...args: ReduxAction[]) => {
              store.dispatch(value(...args));
            };
          });
        } else {
          mappedDispatch = mapDispatchToProps(store.dispatch, props);
        }
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
    };

    return Wrapper;
  };
}
