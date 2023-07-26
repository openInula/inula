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

import { AnyNativeEvent, ListenerUnitList } from './Types';
import type { VNode } from '../renderer/Types';
import { isInputElement, setPropertyWritable } from './utils';
import { decorateNativeEvent } from './EventWrapper';
import { getListenersFromTree } from './ListenerGetter';
import { asyncUpdates, runDiscreteUpdates } from '../renderer/Renderer';
import { findRoot } from '../renderer/vnode/VNodeUtils';
import {
  EVENT_TYPE_ALL,
  EVENT_TYPE_BUBBLE,
  EVENT_TYPE_CAPTURE,
  inulaEventToNativeMap,
  transformToInulaEvent,
} from './EventHub';
import { getDomTag } from '../dom/utils/Common';
import { updateInputHandlerIfChanged } from '../dom/valueHandler/ValueChangeHandler';
import { getDom } from '../dom/DOMInternalKeys';
import { recordChangeEventTargets, shouldControlValue, tryControlValue } from './FormValueController';
import { getMouseEnterListeners } from './MouseEvent';

// web规范，鼠标右键key值
const RIGHT_MOUSE_BUTTON = 2;

// 返回是否需要触发change事件标记
// | 元素 | 事件 |  需要值变更 |
// | --- | ---  | ---------------  |
// | <select/> / <input type="file/> | change | NO |
// | <input type="checkbox" /> <input type="radio" /> | click | YES |
// | <input type="input /> / <input type="text" /> | input / change | YES |
function shouldTriggerChangeEvent(targetDom, evtName) {
  const { type } = targetDom;
  const domTag = getDomTag(targetDom);

  if (domTag === 'select' || (domTag === 'input' && type === 'file')) {
    return evtName === 'change';
  } else if (domTag === 'input' && (type === 'checkbox' || type === 'radio')) {
    if (evtName === 'click') {
      return updateInputHandlerIfChanged(targetDom);
    }
  } else if (isInputElement(targetDom)) {
    if (evtName === 'input' || evtName === 'change') {
      return updateInputHandlerIfChanged(targetDom);
    }
  }
  return false;
}

/**
 *
 * 支持input/textarea/select的onChange事件
 */
function getChangeListeners(
  nativeEvtName: string,
  nativeEvt: AnyNativeEvent,
  vNode: null | VNode,
  target: EventTarget
): ListenerUnitList {
  if (!vNode) {
    return [];
  }
  const targetDom = getDom(vNode);

  // 判断是否需要触发change事件
  if (shouldTriggerChangeEvent(targetDom, nativeEvtName)) {
    recordChangeEventTargets(target);

    const event = decorateNativeEvent('onChange', 'change', nativeEvt);
    return getListenersFromTree(vNode, 'onChange', event, EVENT_TYPE_ALL);
  }

  return [];
}

// 获取事件触发的普通事件监听方法队列
function getCommonListeners(
  nativeEvtName: string,
  vNode: null | VNode,
  nativeEvent: AnyNativeEvent,
  target: null | EventTarget,
  isCapture: boolean
): ListenerUnitList {
  const inulaEvtName = transformToInulaEvent(nativeEvtName);

  if (!inulaEvtName) {
    return [];
  }

  // 鼠标点击右键
  if (nativeEvent instanceof MouseEvent && nativeEvtName === 'click' && nativeEvent.button === RIGHT_MOUSE_BUTTON) {
    return [];
  }

  if (nativeEvtName === 'focusin') {
    nativeEvtName = 'focus';
  }

  if (nativeEvtName === 'focusout') {
    nativeEvtName = 'blur';
  }

  const inulaEvent = decorateNativeEvent(inulaEvtName, nativeEvtName, nativeEvent);
  return getListenersFromTree(vNode, inulaEvtName, inulaEvent, isCapture ? EVENT_TYPE_CAPTURE : EVENT_TYPE_BUBBLE);
}

// 按顺序执行事件队列
function processListeners(listenerList: ListenerUnitList): void {
  listenerList.forEach(eventUnit => {
    const { currentTarget, listener, event } = eventUnit;
    if (event.isPropagationStopped()) {
      return;
    }

    setPropertyWritable(event, 'currentTarget');
    event.currentTarget = currentTarget;
    listener(event);
    event.currentTarget = null;
  });
}

// 触发可以被执行的inula事件监听
function triggerInulaEvents(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: VNode | null
) {
  const target = nativeEvent.target || nativeEvent.srcElement!;

  // 触发普通委托事件
  const listenerList: ListenerUnitList = getCommonListeners(nativeEvtName, vNode, nativeEvent, target, isCapture);

  let mouseEnterListeners: ListenerUnitList = [];
  if (inulaEventToNativeMap.get('onMouseEnter')!.includes(nativeEvtName)) {
    mouseEnterListeners = getMouseEnterListeners(
      nativeEvtName,
      vNode,
      nativeEvent,
      target,
    );
  }

  let changeEvents: ListenerUnitList = [];
  // 触发特殊handler委托事件
  if (!isCapture && inulaEventToNativeMap.get('onChange')!.includes(nativeEvtName)) {
    changeEvents = getChangeListeners(nativeEvtName, nativeEvent, vNode, target);
  }

  // 处理触发的事件队列
  processListeners([...listenerList, ...mouseEnterListeners, ...changeEvents]);
}

// 其他事件正在执行中标记
let isInEventsExecution = false;

// 处理委托事件入口
export function handleEventMain(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: null | VNode,
  targetDom: EventTarget
): void {
  let startVNode = vNode;
  if (startVNode !== null) {
    startVNode = findRoot(startVNode, targetDom);
    if (!startVNode) {
      return;
    }
  }

  // 有事件正在执行，同步执行事件
  if (isInEventsExecution) {
    triggerInulaEvents(nativeEvtName, isCapture, nativeEvent, startVNode);
    return;
  }

  // 没有事件在执行，经过调度再执行事件
  isInEventsExecution = true;
  try {
    asyncUpdates(() => triggerInulaEvents(nativeEvtName, isCapture, nativeEvent, startVNode));
  } finally {
    isInEventsExecution = false;
    if (shouldControlValue()) {
      runDiscreteUpdates();
      tryControlValue();
    }
  }
}
