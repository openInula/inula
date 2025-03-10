/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { isSame, shallowCompare } from '../../renderer/utils/compare';
import type { Dispatch, ReduxAction, ReduxStoreHandler } from './redux';
import type { MapStateToPropsP, MapDispatchToPropsP, MergePropsP, ConnectOption } from './reduxReact';

type StateOrDispatch<S extends ReduxAction = ReduxAction> = S | Dispatch;

const defaultMerge = (...args: any[]) => {
  return Object.assign({}, ...args);
};

interface ReduxSelector<OwnProps = unknown> {
  dependsOnOwnProps: boolean;

  (stateOrDispatch?: StateOrDispatch, ownProps?: OwnProps): any;
}

const isDependsOnOwnProps = (propsMapping: any) => {
  return propsMapping.dependsOnOwnProps ? Boolean(propsMapping.dependsOnOwnProps) : propsMapping.length !== 1;
};

function handleMapToProps<StateProps, OwnProps>(
  mapStateToProps?: MapStateToPropsP<StateProps, OwnProps>
): ReduxSelector {
  if (typeof mapStateToProps === 'function') {
    const proxy = <
      ReduxSelector & {
        mapToProps: any;
      }
    >function mapToPropsProxy(stateOrDispatch: StateOrDispatch, ownProps?: any) {
      return proxy.dependsOnOwnProps
        ? proxy.mapToProps(stateOrDispatch, ownProps)
        : proxy.mapToProps(stateOrDispatch, undefined);
    };

    proxy.dependsOnOwnProps = true;

    proxy.mapToProps = function (stateOrDispatch: StateOrDispatch, ownProps: any) {
      proxy.mapToProps = mapStateToProps;
      proxy.dependsOnOwnProps = isDependsOnOwnProps(mapStateToProps);
      let props = proxy(stateOrDispatch, ownProps);

      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = isDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }
      return props;
    };
    return proxy;
  } else {
    const selector = () => {
      return {};
    };
    selector.dependsOnOwnProps = false;
    return selector;
  }
}

function handleMapDispatchToProps<DispatchProps, OwnProps>(
  dispatch: Dispatch,
  mapDispatchToProps?: MapDispatchToPropsP<DispatchProps, OwnProps>
): ReduxSelector {
  if (!mapDispatchToProps) {
    const selector = () => {
      return { dispatch: dispatch };
    };

    selector.dependsOnOwnProps = false;
    return selector;
  } else if (typeof mapDispatchToProps === 'function') {
    return handleMapToProps(mapDispatchToProps);
  } else {
    const selector = () => {
      const mappedDispatch = {};
      Object.entries(mapDispatchToProps).forEach(([key, value]) => {
        mappedDispatch[key] = (...args: ReduxAction[]) => {
          return dispatch(value(...args));
        };
      });
      return mappedDispatch;
    };
    selector.dependsOnOwnProps = false;
    return selector;
  }
}

function getSelector<StateProps, DispatchProps, OwnProps, MergedProps>(
  store: ReduxStoreHandler,
  {
    mapStateToProps,
    mapDispatchToProps,
    mergeProps,
    options,
  }: {
    mapStateToProps: MapStateToPropsP<StateProps, OwnProps>;
    mapDispatchToProps?: MapDispatchToPropsP<DispatchProps, OwnProps>;
    mergeProps?: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps>;
    options: ConnectOption<unknown, StateProps, OwnProps>;
  }
) {
  const { dispatch } = store;
  const mappedStateToProps = handleMapToProps<StateProps, OwnProps>(mapStateToProps);
  const mappedDispatchToProps = handleMapDispatchToProps<DispatchProps, OwnProps>(dispatch, mapDispatchToProps);
  const mergeMethod = mergeProps || defaultMerge;

  return pureSelectorCreator(mappedStateToProps, mappedDispatchToProps, mergeMethod, dispatch, options);
}

function pureSelectorCreator<StateProps, DispatchProps, OwnProps, MergedProps>(
  mapStateToProps: ReduxSelector,
  mapDispatchToProps: ReduxSelector,
  mergeProps: MergePropsP<StateProps, DispatchProps, OwnProps, MergedProps>,
  dispatch: Dispatch,
  options: ConnectOption<unknown, StateProps, OwnProps>
) {
  let hasRun = false;
  let state: any;
  let ownProps: OwnProps;
  let stateProps: StateProps;
  let dispatchProps: DispatchProps;
  let mergedProps: MergedProps;

  const { areStatesEqual = isSame, areOwnPropsEqual = shallowCompare, areStatePropsEqual = shallowCompare } = options;

  // 首次运行调用该函数
  function firstRun(initState: any, initOwnProps: OwnProps) {
    state = initState;
    ownProps = initOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRun = true;
    return mergedProps;
  }

  // 第二次及以后调用该函数
  function duplicateRun(newState: any, newOwnProps: OwnProps) {
    const isStateChange = !areStatesEqual(newState, state);
    const isPropsChange = !areOwnPropsEqual(newOwnProps, ownProps);
    state = newState;
    ownProps = newOwnProps;
    if (isPropsChange && isStateChange) {
      stateProps = mapStateToProps(state, ownProps);

      if (mapDispatchToProps.dependsOnOwnProps) {
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
      }

      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }
    if (isPropsChange) {
      if (mapStateToProps.dependsOnOwnProps) {
        stateProps = mapStateToProps(state, ownProps);
      }
      if (mapDispatchToProps.dependsOnOwnProps) {
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
      }
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }
    if (isStateChange) {
      const latestStateProps = mapStateToProps(state, ownProps);
      const isStatePropsChange = !areStatePropsEqual(latestStateProps, stateProps);
      stateProps = latestStateProps;
      if (isStatePropsChange) {
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      }
      return mergedProps;
    }
    return mergedProps;
  }

  return function (newState: any, newOwnProps: OwnProps) {
    return hasRun ? duplicateRun(newState, newOwnProps) : firstRun(newState, newOwnProps);
  };
}

export { getSelector };
