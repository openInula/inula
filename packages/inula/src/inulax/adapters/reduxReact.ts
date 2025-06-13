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

import { useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from '../../renderer/hooks/HookExternal';
import { createContext } from '../../renderer/components/context/CreateContext';
import { createElement } from '../../external/JSXElement';
import type { BoundActionCreator, ReduxAction, ReduxStoreHandler } from './redux';
import { forwardRef } from '../../renderer/components/ForwardRef';
import createSubscription from './subscription';
import type { Subscription } from './subscription';
import { isContextConsumer } from '../../external/InulaIs';
import { getSelector } from './reduxSelector';
import { ForwardRef } from '../../types';

const DefaultContext = createContext<{ store: ReduxStoreHandler; subscription: Subscription }>(null as any);
type Context = typeof DefaultContext;
type Selector = (state: unknown) => unknown;

type ConnectProps = {
  store: ReduxStoreHandler;
  context?: Context;
};

type WrapperInnerProps = {
  reduxAdapterRef?: ForwardRef<any>;
};

export function Provider({
  store,
  context = DefaultContext,
  children,
}: {
  store: ReduxStoreHandler;
  context?: Context;
  children?: any[];
}) {
  const ctxValue = useMemo(() => {
    const subscription = createSubscription(store);
    return {
      store,
      subscription,
    };
  }, [store]);

  const prevStoreValue = useMemo(() => store.getState(), [store]);

  useLayoutEffect(() => {
    const subscription = ctxValue.subscription;
    subscription.stateChange = subscription.triggerNestedSubs;
    subscription.trySubscribe();
    if (prevStoreValue !== store.getState()) {
      subscription.triggerNestedSubs();
    }
    return () => {
      subscription.tryUnsubscribe();
      subscription.stateChange = undefined;
    };
  }, [ctxValue, prevStoreValue]);

  const Context = context; // NOTE: bind redux API to inula API requires this renaming;
  return createElement(Context.Provider, { value: ctxValue }, children);
}

export function createStoreHook(context: Context): () => ReduxStoreHandler {
  return () => {
    return useContext(context).store;
  };
}

export function createSelectorHook(context: Context) {
  const store = createStoreHook(context)();
  return function useSelector(selector: Selector = state => state) {
    return useSelectorWithStore(store, selector);
  };
}

export function createDispatchHook(context: Context): () => BoundActionCreator {
  const store = createStoreHook(context)();
  return function useDispatch() {
    return store.dispatch;
  };
}

export const useSelector = (selector?: Selector) => {
  return createSelectorHook(DefaultContext)(selector);
};

export const useDispatch = () => {
  return createDispatchHook(DefaultContext)();
};

export const useStore = () => {
  return createStoreHook(DefaultContext)();
};

export type MapStateToPropsP<StateProps, OwnProps> = (state: any, ownProps: OwnProps) => StateProps;
export type MapDispatchToPropsP<DispatchProps, OwnProps> =
  | { [key: string]: (...args: any[]) => ReduxAction }
  | ((dispatch: (action: ReduxAction) => any, ownProps: OwnProps) => DispatchProps);
export type MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps> = (
  stateProps: StateProps,
  dispatchProps: DispatchProps,
  ownProps: OwnProps
) => MergedProps;

type WrappedComponent<OwnProps> = (props: OwnProps & WrapperInnerProps) => ReturnType<typeof createElement>;
type OriginalComponent<MergedProps> = (props: MergedProps) => ReturnType<typeof createElement>;
type Connector<OwnProps, MergedProps> = (Component: OriginalComponent<MergedProps>) => WrappedComponent<OwnProps>;
export type ConnectOption<State, StateProps, OwnProps> = {
  /** @deprecated */
  prue?: boolean;
  forwardRef?: boolean;
  context?: Context;
  areOwnPropsEqual?: (newOwnProps: OwnProps, oldOwnProps: OwnProps) => any;
  areStatePropsEqual?: (newStateProps: StateProps, oldStateProps: StateProps) => any;
  areStatesEqual?: (newState: State, oldState: State) => boolean;
};

export function connect<StateProps, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps: MapStateToPropsP<StateProps, OwnProps> = () => ({}) as StateProps,
  mapDispatchToProps?: MapDispatchToPropsP<DispatchProps, OwnProps>,
  mergeProps?: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps>,
  options: ConnectOption<any, StateProps, OwnProps> = {}
): Connector<OwnProps, MergedProps> {
  // this component should bear the type returned from mapping functions

  const selectorOptions = {
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    options,
  };

  const { context: storeContext = DefaultContext } = options;

  return (Component: OriginalComponent<MergedProps>): WrappedComponent<OwnProps> => {
    // this component should mimic original type of component used
    const Wrapper: WrappedComponent<OwnProps> = (props: OwnProps & ConnectProps & WrapperInnerProps) => {
      const [, forceUpdate] = useReducer(s => s + 1, 0);

      const propsFromContext = props.context;
      const { reduxAdapterRef, ...wrappedProps } = props;
      const usedContext = useMemo(() => {
        return propsFromContext &&
          propsFromContext.Consumer &&
          isContextConsumer(createElement(propsFromContext.Consumer, {}))
          ? propsFromContext
          : storeContext;
      }, [propsFromContext, storeContext]);

      const context = useContext(usedContext);
      // 判断store是来自context还是props
      const isStoreFromProps = !!props.store && !!props.store.getState && !!props.store.dispatch;

      const store = isStoreFromProps ? props.store : context.store;

      const [subscription, triggerNestedSubs] = useMemo(() => {
        const subscription = createSubscription(store, isStoreFromProps ? null : context.subscription);
        const triggerNestedSubs = subscription.triggerNestedSubs.bind(subscription);
        return [subscription, triggerNestedSubs];
      }, [store, isStoreFromProps, context]);
      // 如果在调用listener中间组件被卸载subscription会变为空，
      // 在一开始就复制一份triggerNestedSubs保证即使组件卸载也可以正常使用

      const overrideContext = useMemo(
        () => (isStoreFromProps ? context : { ...context, subscription }),
        [isStoreFromProps, context, subscription]
      );

      // 使用Ref存储最新的子组件Props，再更新时进行比较，防止多余的渲染
      const latestChildProps = useRef<any>();
      const latestWrappedProps = useRef(wrappedProps);
      const childPropsFromStore = useRef<any>();
      const isRendering = useRef<boolean>(false);

      const selector = useMemo(() => getSelector(store, selectorOptions), [store]);

      const childProps = useMemo(() => {
        return childPropsFromStore.current && wrappedProps === latestWrappedProps.current
          ? childPropsFromStore.current
          : selector(store.getState(), wrappedProps as OwnProps);
      }, [store, wrappedProps, latestWrappedProps]);

      useEffect(() => {
        latestChildProps.current = childProps;
        latestWrappedProps.current = wrappedProps;
        isRendering.current = false;
        if (childPropsFromStore.current) {
          childPropsFromStore.current = null;
          triggerNestedSubs();
        }
      });

      useEffect(() => {
        let isUnsubscribe = false;

        const update = () => {
          if (isUnsubscribe) {
            return;
          }
          const latestStoreState = store.getState();
          const newChildProps = selector(latestStoreState, latestWrappedProps.current as OwnProps);
          // 如果新的子组件的 props 和之前的不同，就更新 ref 对象的值，并强制更新组件
          if (newChildProps === latestChildProps.current) {
            if (!isRendering.current) {
              triggerNestedSubs();
            }
          } else {
            latestChildProps.current = newChildProps;
            childPropsFromStore.current = newChildProps;
            isRendering.current = true;
            forceUpdate();
          }
        };
        // 订阅store的变化
        subscription.stateChange = update;
        subscription.trySubscribe();
        update();
        return () => {
          isUnsubscribe = true;
          subscription.tryUnsubscribe();
          subscription.stateChange = undefined;
        };
      }, [store, subscription, selector]);

      const renderComponent = useMemo(() => {
        return createElement(Component, { ...childProps, ref: reduxAdapterRef });
      }, [Component, childProps, reduxAdapterRef]);

      return createElement(usedContext.Provider, { value: overrideContext }, renderComponent);
    };

    if (options.forwardRef) {
      const forwarded = forwardRef(function (props, ref) {
        return Wrapper({ ...props, reduxAdapterRef: ref });
      });
      return forwarded as WrappedComponent<OwnProps>;
    }

    return Wrapper;
  };
}

function useSelectorWithStore(store: ReduxStoreHandler, selector: Selector) {
  const [, forceUpdate] = useReducer(s => s + 1, 0);

  const latestSelector = useRef<(state: any) => unknown>();
  const latestState = useRef<any>();
  const latestSelectedState = useRef<any>();

  const state = store.getState();
  let selectedState: any;

  // 检查选择器或状态是否自上次渲染以来发生了更改
  if (selector !== latestSelector.current || state !== latestState.current) {
    const newSelectedState = selector(state);
    // 如果选择的状态发生了更改，请更新它
    if (latestSelectedState.current === undefined || newSelectedState !== latestSelectedState.current) {
      selectedState = newSelectedState;
    } else {
      selectedState = latestSelectedState.current;
    }
  } else {
    selectedState = latestSelectedState.current;
  }

  // 更新最新的选择器、状态和选择的状态
  useLayoutEffect(() => {
    latestSelector.current = selector;
    latestState.current = state;
    latestSelectedState.current = selectedState;
  });

  // 订阅存储并在状态更改时更新组件
  useLayoutEffect(() => {
    const update = () => {
      const newState = store.getState();
      if (newState === latestState.current) {
        return;
      }
      const newSelectedState = latestSelector.current!(newState);
      if (newSelectedState === latestSelectedState.current) {
        return;
      }
      latestSelectedState.current = newSelectedState;
      latestState.current = newState;

      forceUpdate();
    };

    update();

    const unsubscribe = store.subscribe(() => update());
    return () => unsubscribe();
  }, [store]);

  return selectedState;
}
