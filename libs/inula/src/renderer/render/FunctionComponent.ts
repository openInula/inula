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

import type { VNode } from '../Types';

import { mergeDefaultProps } from './LazyComponent';
import { resetDepContexts } from '../components/context/Context';
import { runFunctionWithHooks } from '../hooks/HookMain';
import { ForwardRef } from '../vnode/VNodeTags';
import { FlagUtils, Update } from '../vnode/VNodeFlags';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

// 在useState, useReducer的时候，会触发state变化
let stateChange = false;

export function bubbleRender() {}

// 判断children是否可以复用
function checkIfCanReuseChildren(processing: VNode) {
  return !processing.isCreated && processing.oldProps === processing.props && !processing.isDepContextChange;
}

export function setStateChange(isUpdate) {
  stateChange = isUpdate;
}

export function isStateChange() {
  return stateChange;
}

export function captureFunctionComponent(processing: VNode, funcComp: any, nextProps: any) {
  // 函数组件内已完成异步动作
  if (processing.isSuspended) {
    // 由于首次被打断，应仍为首次渲染
    processing.isCreated = true;
    FlagUtils.markAddition(processing);

    processing.isSuspended = false;
  }
  resetDepContexts(processing);

  const isCanReuse = checkIfCanReuseChildren(processing);
  // 在执行exeFunctionHook前先设置stateChange为false
  setStateChange(false);

  const newElements = runFunctionWithHooks(
    processing.tag === ForwardRef ? funcComp.render : funcComp,
    nextProps,
    processing.tag === ForwardRef ? processing.ref : undefined,
    processing
  );

  // 这里需要判断是否可以复用，因为函数组件比起其他组件，多了context、stateChange、或者store改变了 三个因素
  if (isCanReuse && !isStateChange() && !processing.isStoreChange) {
    FlagUtils.removeFlag(processing, Update);

    return onlyUpdateChildVNodes(processing);
  }

  processing.isStoreChange = false;

  processing.child = createChildrenByDiff(processing, processing.child, newElements, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  const Component = processing.type;
  const unresolvedProps = processing.props;
  const resolvedProps = processing.isLazyComponent ? mergeDefaultProps(Component, unresolvedProps) : unresolvedProps;

  return captureFunctionComponent(processing, Component, resolvedProps);
}
