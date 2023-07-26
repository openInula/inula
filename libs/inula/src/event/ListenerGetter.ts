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

import { VNode } from '../renderer/Types';
import { DomComponent } from '../renderer/vnode/VNodeTags';
import { WrappedEvent } from './EventWrapper';
import { ListenerUnitList } from './Types';
import { EVENT_TYPE_ALL, EVENT_TYPE_BUBBLE, EVENT_TYPE_CAPTURE } from './EventHub';

// 从vnode属性中获取事件listener
function getListenerFromVNode(vNode: VNode, eventName: string): Function | null {
  const props = vNode.props;
  const mouseEvents = ['onClick', 'onDoubleClick', 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onMouseEnter'];
  const formElements = ['button', 'input', 'select', 'textarea'];

  // 是否应该阻止禁用的表单元素触发鼠标事件
  const shouldPreventMouseEvent =
    mouseEvents.includes(eventName) && props.disabled && formElements.includes(vNode.type);

  const listener = props[eventName];
  if (shouldPreventMouseEvent) {
    return null;
  } else {
    return listener;
  }
}

// 获取监听事件
export function getListenersFromTree(
  targetVNode: VNode | null,
  inulaEvtName: string | null,
  nativeEvent: WrappedEvent,
  eventType: string
): ListenerUnitList {
  if (!inulaEvtName) {
    return [];
  }

  const listeners: ListenerUnitList = [];

  let vNode = targetVNode;

  // 从目标节点到根节点遍历获取listener
  while (vNode !== null) {
    const { realNode, tag } = vNode;
    if (tag === DomComponent && realNode !== null) {
      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_CAPTURE) {
        const captureName = inulaEvtName + EVENT_TYPE_CAPTURE;
        const captureListener = getListenerFromVNode(vNode, captureName);
        if (captureListener) {
          listeners.unshift({
            vNode,
            listener: captureListener,
            currentTarget: realNode,
            event: nativeEvent,
          });
        }
      }

      if (eventType === EVENT_TYPE_ALL || eventType === EVENT_TYPE_BUBBLE) {
        const bubbleListener = getListenerFromVNode(vNode, inulaEvtName);
        if (bubbleListener) {
          listeners.push({
            vNode,
            listener: bubbleListener,
            currentTarget: realNode,
            event: nativeEvent,
          });
        }
      }
    }
    vNode = vNode.parent;
  }

  return listeners;
}


// 获取父节点
function getParent(inst: VNode | null): VNode | null {
  if (inst === null) {
    return null;
  }
  do {
    inst = inst.parent;
  } while (inst && inst.tag !== DomComponent);
  return inst || null;
}

// 寻找两个节点的共同最近祖先，如果没有则返回null
function getCommonAncestor(instA: VNode, instB: VNode): VNode | null {
  const parentsSet = new Set<VNode>();
  for (let tempA: VNode | null = instA; tempA; tempA = getParent(tempA)) {
    parentsSet.add(tempA);
  }
  for (let tempB: VNode | null = instB; tempB; tempB = getParent(tempB)) {
    if (parentsSet.has(tempB)) {
      return tempB;
    }
  }
  return null;
}

function getMouseListenersFromTree(
  event: WrappedEvent,
  target: VNode,
  commonParent: VNode | null,
): ListenerUnitList {
  const registrationName = event.customEventName;
  const listeners: ListenerUnitList = [];

  let vNode = target;
  while (vNode !== null) {
    // commonParent作为终点
    if (vNode === commonParent) {
      break;
    }
    const {realNode, tag} = vNode;
    if (tag === DomComponent && realNode !== null) {
      const currentTarget = realNode;
      const listener = getListenerFromVNode(vNode, registrationName);
      if (listener) {
        listeners.push({
          vNode,
          listener,
          currentTarget,
          event,
        });
      }
    }
    vNode = vNode.parent;
  }
  return listeners;
}

// 获取enter和leave事件队列
export function collectMouseListeners(
  leaveEvent: null | WrappedEvent,
  enterEvent: null | WrappedEvent,
  from: VNode | null,
  to: VNode | null,
): ListenerUnitList {
  // 确定公共父节点，作为在树上遍历的终点
  const commonParent = from && to ? getCommonAncestor(from, to) : null;
  let leaveEventList: ListenerUnitList = [];
  if (from && leaveEvent) {
    // 遍历树，获取绑定的leave事件
    leaveEventList = getMouseListenersFromTree(
      leaveEvent,
      from,
      commonParent,
    );
  }
  let enterEventList: ListenerUnitList = [];
  if (to && enterEvent) {
    // 先触发父节点enter事件，所以需要逆序
    enterEventList = getMouseListenersFromTree(
      enterEvent,
      to,
      commonParent,
    ).reverse();
  }
  return [...leaveEventList, ...enterEventList];
}
