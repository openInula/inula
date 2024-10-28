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

import type { ElementType, VNode } from '../Types';
import { Props } from '../Types';
import { getNamespaceCtx, setNamespaceCtx, resetNamespaceCtx } from '../ContextSaver';
import { saveVNode, updateVNodeProps } from '../../renderer/utils/InternalKeys';
import { FlagUtils } from '../vnode/VNodeFlags';
import { markRef } from './BaseComponent';
import { Component, Portal, Text } from '../vnode/VNodeTags';
import { travelVNodeTree } from '../vnode/VNodeUtils';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';
import { InulaReconciler } from '..';
import { getCurrentRoot } from '../RootStack';
import { compareProps } from '../props/PropHandler';
import { validateProps } from '../props/ValidateProps';
import { initElementProps } from '../props/PropHandler';
// 准备更新之前进行一系列校验，寻找属性差异等准备工作
export function getPropChangeList(
  element: ElementType,
  type: string,
  lastRawProps: Props,
  nextRawProps: Props
): Record<string, any> {
  // 校验两个对象的不同
  validateProps(type, nextRawProps);

  // 重新定义的属性不需要参与对比，被代理的组件需要把这些属性覆盖到props中
  const oldProps = InulaReconciler.hostConfig.getProps(type, element, lastRawProps);
  const newProps = InulaReconciler.hostConfig.getProps(type, element, nextRawProps);
  return compareProps(oldProps, newProps);
}
function updateElement(processing: VNode, type: any, newProps: Props) {
  // 如果oldProps !== newProps，意味着存在更新，并且需要处理其相关的副作用
  const oldProps = processing.oldProps;
  if (oldProps === newProps) {
    // 如果props没有发生变化，即使它的children发生了变化，我们也不会改变它
    return;
  }

  const element: ElementType = processing.realNode;

  const changeList = getPropChangeList(element, type, oldProps, newProps);

  // 输入类型的直接标记更新
  if (type === 'input' || type === 'textarea' || type === 'select' || type === 'option') {
    FlagUtils.markUpdate(processing);
    processing.changeList = changeList;
  } else {
    // 其它的类型，数据有变化才标记更新
    if (Object.keys(changeList).length) {
      processing.changeList = changeList;
      FlagUtils.markUpdate(processing);
    }
  }
}

export function bubbleRender(processing: VNode) {
  resetNamespaceCtx(processing);
  const {createElement} = InulaReconciler.hostConfig;
  const type = processing.type;
  const newProps = processing.props;
  if (!processing.isCreated && processing.realNode !== null) {
    // 更新dom属性
    updateElement(processing, type, newProps);

    if (processing.oldRef !== processing.ref) {
      FlagUtils.markRef(processing);
    }
  } else {
    const parentNamespace = getNamespaceCtx();

    // 创建dom
    const rootElement = getCurrentRoot()?.realNode;
    const {element, props} = createElement(type, newProps, parentNamespace, rootElement);
    // 将 vNode 节点挂到 element 对象上
    saveVNode(processing, element);
    // 将属性挂到 element 对象上
    updateVNodeProps(element, props);
    // 把dom类型的子节点append到parent element中
    const vNode = processing.child;
    if (vNode !== null) {
      // 向下递归它的子节点，查找所有终端节点。
      travelVNodeTree(
        vNode,
        node => {
          if (node.tag === Component || node.tag === Text) {
            InulaReconciler.hostConfig.appendChildElement(element, node.realNode);
          }
        },
        node =>
          // 已经append到父节点，或者是Portal都不需要处理child了
          node.tag === Component || node.tag === Text || node.tag === Portal,
        processing,
        null
      );
    }

    processing.realNode = element;

    if (initElementProps(element, type, newProps)) {
      FlagUtils.markUpdate(processing);
    }

    // 处理ref导致的更新
    if (processing.ref !== null) {
      FlagUtils.markRef(processing);
    }
  }
}

export function captureRender(processing: VNode): VNode | null {
  setNamespaceCtx(processing);

  const type = processing.type;
  const newProps = processing.props;
  const oldProps = !processing.isCreated ? processing.oldProps : null;

  let nextChildren = newProps.children;
  const isDirectTextChild = InulaReconciler.hostConfig.isTextChild(type, newProps);

  if (isDirectTextChild) {
    // 如果为文本节点，则认为没有子节点
    nextChildren = null;
  } else if (oldProps !== null && InulaReconciler.hostConfig.isTextChild(type, oldProps)) {
    // 将纯文本的子节点改为vNode节点
    FlagUtils.markContentReset(processing);
  }

  markRef(processing);
  processing.child = createChildrenByDiff(processing, processing.child, nextChildren, !processing.isCreated);
  return processing.child;
}
