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

import type { VNode } from '../renderer/Types';
import type { Container, Props } from './DOMOperator';

import { DomComponent, DomText, TreeRoot } from '../renderer/vnode/VNodeTags';

const randomKey = Math.random().toString(16).slice(2);
export const ROOT_CONTAINER = `_inula_treeRoot_${randomKey}`;
const INTERNAL_VNODE = `_inula_vNode_${randomKey}`;
const INTERNAL_PROPS = `_inula_props_${randomKey}`;
const INTERNAL_NONDELEGATEDEVENTS = `_inula_nonDelegatedEvents_${randomKey}`;
export const HANDLER_KEY = `_inula_valueChangeHandler_${randomKey}`;
export const EVENT_KEY = `_inula_ev_${randomKey}`;

// 通过 VNode 实例获取 DOM 节点
export function getDom(vNode: VNode): Element | Text | null {
  const { tag } = vNode;
  if (tag === DomComponent || tag === DomText) {
    return vNode.realNode;
  }
  return null;
}

// 将 VNode 属性相关信息挂到 DOM 对象的特定属性上
export function saveVNode(vNode: VNode, dom: Element | Text | Container): void {
  dom[INTERNAL_VNODE] = vNode;
}

// 用 DOM 节点，来找其对应的 VNode 实例
export function getVNode(dom: Node | Container): VNode | null {
  const vNode = dom[INTERNAL_VNODE] || (dom as Container)[ROOT_CONTAINER];
  if (vNode) {
    const { tag } = vNode;
    if (tag === DomComponent || tag === DomText || tag === TreeRoot) {
      return vNode;
    }
  }
  return null;
}

// 用 DOM 对象，来寻找其对应或者说是最近父级的 vNode
export function getNearestVNode(dom: Node): null | VNode {
  let domNode: Node | null = dom;
  // 寻找当前节点及其所有祖先节点是否有标记VNODE
  while (domNode) {
    const vNode = domNode[INTERNAL_VNODE];
    if (vNode) {
      return vNode;
    }
    domNode = domNode.parentNode;
  }

  return null;
}

// 获取 vNode 上的属性相关信息
export function getVNodeProps(dom: Element | Text): Props | null {
  return dom[INTERNAL_PROPS] || null;
}

// 将 DOM 属性相关信息挂到 DOM 对象的特定属性上
export function updateVNodeProps(dom: Element | Text, props: Props): void {
  dom[INTERNAL_PROPS] = props;
}

export function getNonDelegatedListenerMap(dom: Element | Text): Map<string, EventListener> {
  let eventsMap = dom[INTERNAL_NONDELEGATEDEVENTS];
  if (!eventsMap) {
    eventsMap = new Map();
    dom[INTERNAL_NONDELEGATEDEVENTS] = eventsMap;
  }
  return eventsMap;
}

export function detachUnmountDom(element: Element | Text) {
  delete element[INTERNAL_VNODE];
  delete element[INTERNAL_PROPS];
  delete element[INTERNAL_NONDELEGATEDEVENTS];
  delete element[HANDLER_KEY];
  delete element[EVENT_KEY];
}
