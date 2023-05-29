/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import { getNearestVNode } from '../dom/DOMInternalKeys';
import { WrappedEvent } from './EventWrapper';
import { VNode } from '../renderer/vnode/VNode';
import { AnyNativeEvent, ListenerUnitList } from './Types';
import { DomComponent, DomText } from '../renderer/vnode/VNodeTags';
import { collectMouseListeners } from './ListenerGetter';
import { getNearestMountedVNode } from './utils';

/**
 * 背景： mouseEnter和mouseLeave事件不冒泡，所以无法直接委托给根节点进行代理
 * 实现方案：利用mouseout、mouseover事件的，找到事件触发的起点和终点，判断出鼠标移动轨迹，在轨迹中的节点触发mouseEnter和mouseLeave事件
 * 步骤：
 *  1. 根节点绑定mouseout和mouseover事件
 *  2. 事件触发后找到事件的起点和终点
 *  3. 封装装enter和leave事件
 *  4. 根据起止点找到公共父节点，作为事件冒泡的终点
 *  5. 遍历treeNode，找到每个节点绑定的mouseEnter和mouseLeave监听方法
 *  例如： mouseOut事件由D->C, A节点作为公共父节点，将触发 D、B的mouseLeave事件和C节点的mouseEnter事件
 *       A
 *     /  \
 *    B    C
 *   / \
 * D    E
 *
 */

function getWrapperEvents(nativeEventTarget, fromInst, toInst, nativeEvent, targetInst): (WrappedEvent | null)[] {
  const vWindow = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : nativeEventTarget.ownerDocument.defaultView;

  // 起点或者终点为空的话默认值为所在window
  const fromNode = fromInst?.realNode || vWindow;
  const toNode = toInst?.realNode || vWindow;
  let leave: WrappedEvent | null = null;
  let enter: WrappedEvent | null = null;
  const nativeTargetInst = getNearestVNode(nativeEventTarget);

  // 在Mounted的dom节点上render一个子组件，系统中存在两个根节点，子节点的mouseout事件触发两次，取离target近的根节点生效
  if (nativeTargetInst === targetInst) {
    leave = new WrappedEvent('onMouseLeave', 'mouseleave', nativeEvent);
    leave.target = fromNode;
    leave.relatedTarget = toNode;

    enter = new WrappedEvent('onMouseEnter', 'mouseenter', nativeEvent);
    enter.target = toNode;
    enter.relatedTarget = fromNode;
  }
  return [leave, enter];
}

function getEndpointVNode(
  domEventName: string,
  targetInst: null | VNode,
  nativeEvent: AnyNativeEvent,
): (VNode | null)[] {
  let fromVNode;
  let toVNode;
  if (domEventName === 'mouseover') {
    fromVNode = null;
    toVNode = targetInst;
  } else {
    const related = nativeEvent.relatedTarget || nativeEvent.toElement;
    fromVNode = targetInst;
    toVNode = related ? getNearestVNode(related) : null;
    if (toVNode !== null) {
      const nearestMounted = getNearestMountedVNode(toVNode);
      if (toVNode !== nearestMounted || (toVNode.tag !== DomComponent && toVNode.tag !== DomText)) {
        toVNode = null;
      }
    }
  }
  return [fromVNode, toVNode];
}

export function getMouseEnterListeners(
  domEventName: string,
  targetInst: null | VNode,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
): ListenerUnitList {

  // 获取起点和终点的VNode
  const [fromVNode, toVNode] = getEndpointVNode(domEventName, targetInst, nativeEvent);
  if (fromVNode === toVNode) {
    return [];
  }

  // 获取包装后的leave和enter事件
  const [leave, enter] = getWrapperEvents(nativeEventTarget, fromVNode, toVNode, nativeEvent, targetInst);

  // 收集事件的监听方法
  return collectMouseListeners(leave, enter, fromVNode, toVNode);
}


