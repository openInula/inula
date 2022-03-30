import type { VNode } from '../Types';

import { mergeDefaultProps } from './LazyComponent';
import { resetDepContexts } from '../components/context/Context';
import { exeFunctionHook } from '../hooks/HookMain';
import { ForwardRef } from '../vnode/VNodeTags';
import { FlagUtils, Update } from '../vnode/VNodeFlags';
import { getContextChangeCtx } from '../ContextSaver';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

// 在useState, useReducer的时候，会触发state变化
let stateChange = false;

export function bubbleRender() {
}

// 判断children是否可以复用
function checkIfCanReuseChildren(processing: VNode, shouldUpdate?: boolean) {
  let isCanReuse = true;

  if (!processing.isCreated) {
    const oldProps = processing.oldProps;
    const newProps = processing.props;

    // 如果props或者context改变了
    if (oldProps !== newProps || getContextChangeCtx() || processing.isDepContextChange) {
      isCanReuse = false;
    } else {
      if (shouldUpdate && processing.suspenseChildThrow) {
        // 使用完后恢复
        processing.suspenseChildThrow = false;
        isCanReuse = false;
      }
    }
  } else {
    isCanReuse = false;
  }

  return isCanReuse;
}

export function setStateChange(isUpdate) {
  stateChange = isUpdate;
}

export function isStateChange() {
  return stateChange;
}

export function captureFunctionComponent(
  processing: VNode,
  funcComp: any,
  nextProps: any,
  shouldUpdate?: boolean,
) {
  // 函数组件内已完成异步动作
  if (processing.isSuspended) {
    // 由于首次被打断，应仍为首次渲染
    processing.isCreated = true;
    FlagUtils.markAddition(processing);

    processing.isSuspended = false;
  }
  resetDepContexts(processing);

  const isCanReuse = checkIfCanReuseChildren(processing, shouldUpdate);
  // 在执行exeFunctionHook前先设置stateChange为false
  setStateChange(false);

  const newElements = exeFunctionHook(
    processing.tag === ForwardRef ? funcComp.render : funcComp,
    nextProps,
    processing.tag === ForwardRef ? processing.ref : undefined,
    processing,
  );

  // 这里需要判断是否可以复用，因为函数组件比起其他组价，多了context和stateChange两个因素
  if (isCanReuse && !isStateChange()) {
    FlagUtils.removeFlag(processing, Update);

    return onlyUpdateChildVNodes(processing);
  }

  processing.child = createChildrenByDiff(processing, processing.child, newElements, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode, shouldUpdate?: boolean): VNode | null {
  const Component = processing.type;
  const unresolvedProps = processing.props;
  const resolvedProps =
    processing.isLazyComponent
      ? mergeDefaultProps(Component, unresolvedProps)
      : unresolvedProps;

  return captureFunctionComponent(
    processing,
    Component,
    resolvedProps,
    shouldUpdate,
  );
}

