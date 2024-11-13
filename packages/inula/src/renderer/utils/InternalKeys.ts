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

/**
 * 文件整体功能：给dom节点赋 VNode 的结构体和事件初始化标记
 */

import type { ElementType, VNode } from '../Types';
import { Container } from '../Types';

import { Component as Component, Text as Text, TreeRoot } from '../vnode/VNodeTags';
import { findDomVNode as findRealVNode } from '../vnode/VNodeUtils';

const randomKey = Math.random().toString(16).slice(2);
const INTERNAL_VNODE = `_inula_VNode_${randomKey}`;
const INTERNAL_PROPS = `_inula_Props_${randomKey}`;
const INTERNAL_NONDELEGATEEVENTS = `_inula_nonDelegatedEvents_${randomKey}`;
export const HANDLER_KEY = `_inula_valueChangeHandler_${randomKey}`;
export const EVENT_KEY = `_inula_ev_${randomKey}`;

export type Props = Record<string, any> & {
  autoFocus?: boolean;
  children?: any;
  disabled?: boolean;
  hidden?: boolean;
  style?: { display?: string };
};

// 通过 VNode 实例获取 Element 节点
export function getElement(vNode: VNode): ElementType | null {
  const { tag } = vNode;
  if (tag === Component || tag === Text) {
    return vNode.realNode;
  }
  return null;
}

// 将 VNode 属性相关信息挂到对象的特定属性上
export function saveVNode(vNode: VNode, element: ElementType | Text | Container): void {
  element[INTERNAL_VNODE] = vNode;
}

// 用 Element 节点，来找其对应的 VNode 实例
export function getVNode(element: ElementType | Container): VNode | null {
  const vNode = element[INTERNAL_VNODE] || (element as Container)._treeRoot;
  if (vNode) {
    const { tag } = vNode;
    if (tag === Component || tag === Text || tag === TreeRoot) {
      return vNode;
    }
  }
  return null;
}

// 用 element 对象，来寻找其对应或者说是最近父级的 vNode
export function getNearestVNode(element: ElementType): null | VNode {
  let elementNode: ElementType | null = element;
  // 寻找当前节点及其所有祖先节点是否有标记VNODE
  while (elementNode) {
    const vNode = elementNode[INTERNAL_VNODE];
    if (vNode) {
      return vNode;
    }
    elementNode = element.parentNode ?? null;
  }

  return null;
}
export function findElementByClassInst(inst) {
  const vNode = inst._vNode;
  if (vNode === undefined) {
    throw new Error('Unable to find the vNode by class instance.');
  }

  const elementVNode = findRealVNode(vNode);

  return elementVNode !== null ? elementVNode.realNode : null;
}
// 获取 vNode 上的属性相关信息
export function getVNodeProps(element: ElementType | Text): Props | null {
  return element[INTERNAL_PROPS] || null;
}

// 将 Element 属性相关信息挂到 Element 对象的特定属性上
export function updateVNodeProps(element: ElementType | Text, props: Props): void {
  element[INTERNAL_PROPS] = props;
}

export function getNonDelegatedListenerMap(element: ElementType | Text): Map<string, EventListener> {
  let eventsMap = element[INTERNAL_NONDELEGATEEVENTS];
  if (!eventsMap) {
    eventsMap = new Map();
    element[INTERNAL_NONDELEGATEEVENTS] = eventsMap;
  }
  return eventsMap;
}
