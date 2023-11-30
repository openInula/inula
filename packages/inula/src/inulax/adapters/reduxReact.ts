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

import { useState, useContext, useEffect, useRef } from '../../renderer/hooks/HookExternal';
import { createContext } from '../../renderer/components/context/CreateContext';
import { createElement } from '../../external/JSXElement';
import type { ReduxStoreHandler, ReduxAction, BoundActionCreator } from './redux';
import { forwardRef } from '../../renderer/components/ForwardRef';

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

export function createSelectorHook(context: Context): (selector?: ((state: unknown) => any) | undefined) => any {
  const store = createStoreHook(context)();
  return function useSelector(selector = state => state) {
    const [state, setState] = useState(() => store.getState());

    useEffect(() => {
      const unsubscribe = store.subscribe(() => {
        setState(store.getState());
      });
      return () => unsubscribe();
    }, []);

    return selector(state);
  };
}

export function createDispatchHook(context: Context): () => BoundActionCreator {
  const store = createStoreHook(context)();
  return function useDispatch() {
    return store.dispatch;
  };
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

type MapStateToPropsP<StateProps, OwnProps> = (state: any, ownProps: OwnProps) => StateProps;
type MapDispatchToPropsP<DispatchProps, OwnProps> =
  | { [key: string]: (...args: any[]) => ReduxAction }
  | ((dispatch: (action: ReduxAction) => any, ownProps: OwnProps) => DispatchProps);
type MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => MergedProps;

type WrappedComponent<OwnProps> = (props: OwnProps) => ReturnType<typeof createElement>;
type OriginalComponent<MergedProps> = (props: MergedProps) => ReturnType<typeof createElement>;
type Connector<OwnProps, MergedProps> = (Component: OriginalComponent<MergedProps>) => WrappedComponent<OwnProps>;
type ConnectOption<State = any> = {
  areStatesEqual?: (oldState: State, newState: State) => boolean;
  context?: Context;
  forwardRef?: boolean
}

export function connect<StateProps, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps: MapStateToPropsP<StateProps, OwnProps> = () => ({} as StateProps),
  mapDispatchToProps: MapDispatchToPropsP<DispatchProps, OwnProps> = () => ({} as DispatchProps),
  mergeProps: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
    stateProps,
    dispatchProps,
    ownProps
  ): MergedProps => ({ ...stateProps, ...dispatchProps, ...ownProps } as unknown as MergedProps),
  options: ConnectOption,
): Connector<OwnProps, MergedProps> {
  if (!options) {
    options = {};
  }

  //this component should bear the type returned from mapping functions
  return (Component: OriginalComponent<MergedProps>): WrappedComponent<OwnProps> => {
    const useStore = createStoreHook(options.context || DefaultContext);

    //this component should mimic original type of component used
    const Wrapper: WrappedComponent<OwnProps> = (props: OwnProps) => {
      const store = useStore() as ReduxStoreHandler;
      const [state, setState] = useState(() => store.getState());


      useEffect(() => {
        const unsubscribe = store.subscribe(() => {
          setState(store.getState());
        });
        return () => unsubscribe();
      }, []);

      const previous = useRef<{ state: { [key: string]: any }, mappedState: StateProps }>({
        state: {},
        mappedState: {} as StateProps,
      });

      let mappedState: StateProps;
      if (options.areStatesEqual) {
        if (options.areStatesEqual(previous.current.state, state)) {
          mappedState = previous.current.mappedState as StateProps;
        } else {
          mappedState = mapStateToProps ? mapStateToProps(state, props) : ({} as StateProps);
          previous.current.mappedState = mappedState;
        }
      } else {
        mappedState = mapStateToProps ? mapStateToProps(state, props) : ({} as StateProps);
        previous.current.mappedState = mappedState;
      }
      let mappedDispatch: DispatchProps = {} as DispatchProps;
      if (mapDispatchToProps) {
        if (typeof mapDispatchToProps === 'object') {
          Object.entries(mapDispatchToProps).forEach(([key, value]) => {
            mappedDispatch[key] = (...args: ReduxAction[]) => {
              store.dispatch(value(...args));
              setState(store.getState());
            };
          });
        } else {
          mappedDispatch = mapDispatchToProps(store.dispatch, props);
        }
      }
      mappedDispatch = Object.assign({}, mappedDispatch, { dispatch: store.dispatch });
      const mergedProps = (
        mergeProps ||
        ((state, dispatch, originalProps) => {
          return { ...state, ...dispatch, ...originalProps };
        })
      )(mappedState, mappedDispatch, props);

      previous.current.state = state;

      return createElement(Component, mergedProps);
    };

    if (options.forwardRef) {
      const forwarded = forwardRef((props, ref) => {
        return Wrapper({ ...props, ref: ref });
      });
      return forwarded as WrappedComponent<OwnProps>;
    }

    return Wrapper;
  };
}
