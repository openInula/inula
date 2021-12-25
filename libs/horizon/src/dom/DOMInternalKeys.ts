/**
 * 文件整体功能：给dom节点赋 VNode 的结构体和事件初始化标记
 */

import type {VNode} from '../renderer/Types';
import type {
  Container,
  Props,
} from './DOMOperator';

import {
  DomComponent,
  DomText,
  TreeRoot,
} from '../renderer/vnode/VNodeTags';

const suffixKey = new Date().getTime().toString();
const prefix = '_horizon';

const internalKeys = {
  VNode: `${prefix}VNode@${suffixKey}`,
  props: `${prefix}Props@${suffixKey}`,
  events: `${prefix}Events@${suffixKey}`,
  nonDelegatedEvents: `${prefix}NonDelegatedEvents@${suffixKey}`,
};

// 通过 VNode 实例获取 DOM 节点
export function getDom(vNode: VNode): Element | Text | void {
  const {tag} = vNode;
  if (tag === DomComponent || tag === DomText) {
    return vNode.realNode;
  }
}

// 将 VNode 属性相关信息挂到 DOM 对象的特定属性上
export function saveVNode(
  vNode: VNode,
  dom: Element | Text | Container,
): void {
  dom[internalKeys.VNode] = vNode;
}

// 用 DOM 节点，来找其对应的 VNode 实例
export function getVNode(dom: Node|Container): VNode | null {
  const vNode = dom[internalKeys.VNode] || (dom as Container)._treeRoot;
  if (vNode) {
    const {tag} = vNode;
    if (tag === DomComponent || tag === DomText || tag === TreeRoot) {
      return vNode;
    }
  }
  return null;
}

// 用 DOM 对象，来寻找其对应或者说是最近父级的 vNode
export function getNearestVNode(dom: Node): null | VNode {
  let vNode = dom[internalKeys.VNode];
  if (vNode) { // 如果是已经被框架标记过的 DOM 节点，那么直接返回其 VNode 实例
    return vNode;
  }
  // 下面处理的是为被框架标记过的 DOM 节点，向上找其父节点是否被框架标记过
  let parentDom = dom.parentNode;
  let nearVNode = null;
  while (parentDom) {
    vNode = parentDom[internalKeys.VNode];
    if (vNode) {
      nearVNode = vNode;
      break;
    }
    parentDom = parentDom.parentNode;
  }
  return nearVNode;
}

// 获取 vNode 上的属性相关信息
export function getVNodeProps(dom: Element | Text): Props {
  return dom[internalKeys.props] || null;
}

// 将 DOM 属性相关信息挂到 DOM 对象的特定属性上
export function updateVNodeProps(dom: Element | Text, props: Props): void {
  dom[internalKeys.props] = props;
}

export function getEventListeners(dom: EventTarget): Set<string> {
  let elementListeners = dom[internalKeys.events];
  if (!elementListeners) {
    elementListeners = new Set();
    dom[internalKeys.events] = elementListeners;
  }
  return elementListeners;
}

export function getEventToListenerMap(target: EventTarget): Map<string, EventListener> {
  let eventsMap = target[internalKeys.nonDelegatedEvents];
  if (!eventsMap) {
    eventsMap = target[internalKeys.nonDelegatedEvents] = new Map();
  }
  return eventsMap;
}
