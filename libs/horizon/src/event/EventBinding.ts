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

/**
 * 事件绑定实现，分为绑定委托事件和非委托事件
 */
import {allDelegatedHorizonEvents, simulatedDelegatedEvents} from './EventHub';
import {isDocument} from '../dom/utils/Common';
import { getNearestVNode, getNonDelegatedListenerMap } from '../dom/DOMInternalKeys';
import { asyncUpdates, runDiscreteUpdates } from '../renderer/TreeBuilder';
import { handleEventMain } from './HorizonEventMain';
import { decorateNativeEvent } from './EventWrapper';
import { VNode } from '../renderer/vnode/VNode';

// 触发委托事件
function triggerDelegatedEvent(
  nativeEvtName: string,
  isCapture: boolean,
  targetDom: EventTarget,
  nativeEvent // 事件对象event
) {
  // 执行之前的调度事件
  runDiscreteUpdates();

  const nativeEventTarget = nativeEvent.target || nativeEvent.srcElement;
  const targetVNode = getNearestVNode(nativeEventTarget);

  handleEventMain(nativeEvtName, isCapture, nativeEvent, targetVNode, targetDom);
}

// 监听委托事件
function listenToNativeEvent(nativeEvtName: string, delegatedElement: Element, isCapture: boolean) {
  let dom: Element | Document = delegatedElement;
  // document层次可能触发selectionchange事件，为了捕获这类事件，selectionchange事件绑定在document节点上
  if (nativeEvtName === 'selectionchange' && !isDocument(delegatedElement)) {
    dom = delegatedElement.ownerDocument;
  }

  const listener = triggerDelegatedEvent.bind(null, nativeEvtName, isCapture, dom);
  dom.addEventListener(nativeEvtName, listener, isCapture);

  return listener;
}

// 是否捕获事件
function isCaptureEvent(horizonEventName) {
  if (horizonEventName === 'onLostPointerCapture' || horizonEventName === 'onGotPointerCapture') {
    return false;
  }
  return horizonEventName.slice(-7) === 'Capture';
}

// 利用冒泡事件模拟不冒泡事件，需要直接在根节点绑定
export function listenSimulatedDelegatedEvents(root: VNode) {
  for (let i = 0; i < simulatedDelegatedEvents.length; i++) {
    lazyDelegateOnRoot(root, simulatedDelegatedEvents[i]);
  }
}

// 事件懒委托，当用户定义事件后，再进行委托到根节点
export function lazyDelegateOnRoot(currentRoot: VNode, eventName: string) {
  currentRoot.delegatedEvents.add(eventName);

  const isCapture = isCaptureEvent(eventName);
  const nativeEvents = allDelegatedHorizonEvents.get(eventName);

  nativeEvents.forEach(nativeEvent => {
    const nativeFullName = isCapture ? nativeEvent + 'capture' : nativeEvent;

    // 事件存储在DOM节点属性，避免多个VNode(root和portal)对应同一个DOM, 造成事件重复监听
    let events = currentRoot.realNode.$EV;

    if (!events) {
      events = (currentRoot.realNode as any).$EV = {};
    }

    if (!events[nativeFullName]) {
      events[nativeFullName] = listenToNativeEvent(nativeEvent, currentRoot.realNode, isCapture);
    }
  });
}

// 通过horizon事件名获取到native事件名
function getNativeEvtName(horizonEventName, capture) {
  let nativeName;
  if (capture) {
    nativeName = horizonEventName.slice(2, -7);
  } else {
    nativeName = horizonEventName.slice(2);
  }
  if (!nativeName) {
    return '';
  }
  return nativeName.toLowerCase();
}

// 封装监听函数
function getWrapperListener(horizonEventName, nativeEvtName, targetElement, listener) {
  return event => {
    const customEvent = decorateNativeEvent(horizonEventName, nativeEvtName, event);
    asyncUpdates(() => {
      listener(customEvent);
    });
  };
}

// 非委托事件单独监听到各自dom节点
export function listenNonDelegatedEvent(horizonEventName: string, domElement: Element, listener): void {
  const isCapture = isCaptureEvent(horizonEventName);
  const nativeEvtName = getNativeEvtName(horizonEventName, isCapture);

  // 先判断是否存在老的监听事件，若存在则移除
  const nonDelegatedListenerMap = getNonDelegatedListenerMap(domElement);
  const currentListener = nonDelegatedListenerMap.get(horizonEventName);
  if (currentListener) {
    domElement.removeEventListener(nativeEvtName, currentListener);
    nonDelegatedListenerMap.delete(horizonEventName);
  }

  if (typeof listener !== 'function') {
    return;
  }

  // 为了和委托事件对外行为一致，将事件对象封装成CustomBaseEvent
  const wrapperListener = getWrapperListener(horizonEventName, nativeEvtName, domElement, listener);
  // 添加新的监听
  nonDelegatedListenerMap.set(horizonEventName, wrapperListener);
  domElement.addEventListener(nativeEvtName, wrapperListener, isCapture);
}
