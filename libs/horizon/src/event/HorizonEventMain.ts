import type { AnyNativeEvent, ProcessingListenerList } from './types';
import type { VNode } from '../renderer/Types';

import {
  CommonEventToHorizonMap,
  horizonEventToNativeMap,
  EVENT_TYPE_BUBBLE,
  EVENT_TYPE_CAPTURE,
} from './const';
import {
  throwCaughtEventError,
  runListenerAndCatchFirstError,
} from './EventError';
import { getListeners as getBeforeInputListeners } from './simulatedEvtHandler/BeforeInputEventHandler';
import { getListeners as getCompositionListeners } from './simulatedEvtHandler/CompositionEventHandler';
import { getListeners as getChangeListeners } from './simulatedEvtHandler/ChangeEventHandler';
import { getListeners as getSelectionListeners } from './simulatedEvtHandler/SelectionEventHandler';
import {
  getCustomEventNameWithOn,
  uniqueCharCode,
  getEventTarget
} from './utils';
import { createCommonCustomEvent } from './customEvents/EventFactory';
import { getListenersFromTree } from './ListenerGetter';
import { shouldUpdateValue, updateControlledValue } from './ControlledValueUpdater';
import { asyncUpdates, runDiscreteUpdates } from '../renderer/Renderer';
import { getExactNode } from '../renderer/vnode/VNodeUtils';

// 获取事件触发的普通事件监听方法队列
function getCommonListeners(
  nativeEvtName: string,
  vNode: null | VNode,
  nativeEvent: AnyNativeEvent,
  target: null | EventTarget,
  isCapture: boolean,
): ProcessingListenerList {
  const customEventName = getCustomEventNameWithOn(CommonEventToHorizonMap[nativeEvtName]);
  if (!customEventName) {
    return [];
  }

  // 火狐浏览器兼容。火狐浏览器下功能键将触发keypress事件 火狐下keypress的charcode有值，keycode为0
  if (nativeEvtName === 'keypress' && uniqueCharCode(nativeEvent) === 0) {
    return [];
  }

  // 鼠标点击右键
  if (nativeEvent instanceof MouseEvent && nativeEvtName === 'click' && nativeEvent.button === 2) {
    return [];
  }

  if (nativeEvtName === 'focusin') {
    nativeEvtName = 'focus';
  }
  if (nativeEvtName === 'focusout') {
    nativeEvtName = 'blur';
  }

  const customEvent = createCommonCustomEvent(customEventName, nativeEvtName, nativeEvent, null, target);
  return getListenersFromTree(
    vNode,
    customEventName,
    customEvent,
    isCapture ? EVENT_TYPE_CAPTURE : EVENT_TYPE_BUBBLE,
  );
}

// 按顺序执行事件队列
export function processListeners(
  processingEventsList: ProcessingListenerList
): void {
  processingEventsList.forEach(eventUnitList => {
    let lastVNode;
    eventUnitList.forEach(eventUnit => {
      const { vNode, currentTarget, listener, event } = eventUnit;
      if (vNode !== lastVNode && event.isPropagationStopped()) {
        return;
      }
      event.currentTarget = currentTarget;
      runListenerAndCatchFirstError(listener, event);
      event.currentTarget = null;
      lastVNode = vNode;
    });
  });
  // 执行所有事件后，重新throw遇到的第一个错误
  throwCaughtEventError();
}

function getProcessListenersFacade(
  nativeEvtName: string,
  vNode: VNode,
  nativeEvent: AnyNativeEvent,
  target,
  isCapture: boolean
): ProcessingListenerList {
  // 触发普通委托事件
  let processingListenerList: ProcessingListenerList = getCommonListeners(
    nativeEvtName,
    vNode,
    nativeEvent,
    target,
    isCapture,
  );

  // 触发特殊handler委托事件
  if (!isCapture) {
    if (horizonEventToNativeMap.get('onChange').includes(nativeEvtName)) {
      processingListenerList = processingListenerList.concat(getChangeListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }

    if (horizonEventToNativeMap.get('onSelect').includes(nativeEvtName)) {
      processingListenerList = processingListenerList.concat(getSelectionListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }

    if (nativeEvtName === 'compositionend' ||
        nativeEvtName === 'compositionstart' ||
        nativeEvtName === 'compositionupdate') {
      processingListenerList = processingListenerList.concat(getCompositionListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }

    if (horizonEventToNativeMap.get('onBeforeInput').includes(nativeEvtName)) {
      processingListenerList = processingListenerList.concat(getBeforeInputListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }
  }
  return processingListenerList;
}

// 触发可以被执行的horizon事件监听
function triggerHorizonEvents(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: null | VNode,
): void {
  const nativeEventTarget = getEventTarget(nativeEvent);
  const processingListenerList = getProcessListenersFacade(
    nativeEvtName,
    vNode,
    nativeEvent,
    nativeEventTarget,
    isCapture);

  // 处理触发的事件队列
  processListeners(processingListenerList);
}


// 其他事件正在执行中标记
let isInEventsExecution = false;

export function handleEventMain(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: null | VNode,
  target: EventTarget,
): void {
  let rootVNode = vNode;
  if (vNode !== null) {
    rootVNode = getExactNode(vNode, target);
    if (!rootVNode) {
      return;
    }
  }

  // 有事件正在执行，同步执行事件
  if (isInEventsExecution) {
    triggerHorizonEvents(nativeEvtName, isCapture, nativeEvent, rootVNode);
    return;
  }

  // 没有事件在执行，经过调度再执行事件
  isInEventsExecution = true;
  try {
    asyncUpdates(() =>
      triggerHorizonEvents(
        nativeEvtName,
        isCapture,
        nativeEvent,
        rootVNode,
      ));
  } finally {
    isInEventsExecution = false;
    if (shouldUpdateValue()) {
      runDiscreteUpdates();
      updateControlledValue();
    }
  }
}
