import type { AnyNativeEvent } from './Types';
import type { VNode } from '../renderer/Types';

import {
  CommonEventToHorizonMap,
  horizonEventToNativeMap,
  EVENT_TYPE_BUBBLE,
  EVENT_TYPE_CAPTURE,
} from './const';
import { getListeners as getChangeListeners } from './simulatedEvtHandler/ChangeEventHandler';
import { getListeners as getSelectionListeners } from './simulatedEvtHandler/SelectionEventHandler';
import {
  addOnPrefix, setPropertyWritable,
} from './utils';
import { decorateNativeEvent } from './customEvents/EventFactory';
import { getListenersFromTree } from './ListenerGetter';
import { shouldUpdateValue, updateControlledValue } from './ControlledValueUpdater';
import { asyncUpdates, runDiscreteUpdates } from '../renderer/Renderer';
import { getExactNode } from '../renderer/vnode/VNodeUtils';
import {ListenerUnitList} from './Types';

// 获取事件触发的普通事件监听方法队列
function getCommonListeners(
  nativeEvtName: string,
  vNode: null | VNode,
  nativeEvent: AnyNativeEvent,
  target: null | EventTarget,
  isCapture: boolean,
): ListenerUnitList {
  const horizonEvtName = addOnPrefix(CommonEventToHorizonMap[nativeEvtName]);
  if (!horizonEvtName) {
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

  const horizonEvent = decorateNativeEvent(horizonEvtName, nativeEvtName, nativeEvent);
  return getListenersFromTree(
    vNode,
    horizonEvtName,
    horizonEvent,
    isCapture ? EVENT_TYPE_CAPTURE : EVENT_TYPE_BUBBLE,
  );
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

function getProcessListeners(
  nativeEvtName: string,
  vNode: VNode | null,
  nativeEvent: AnyNativeEvent,
  target,
  isCapture: boolean
): ListenerUnitList {
  // 触发普通委托事件
  let listenerList: ListenerUnitList = getCommonListeners(
    nativeEvtName,
    vNode,
    nativeEvent,
    target,
    isCapture,
  );

  // 触发特殊handler委托事件
  if (!isCapture) {
    if (horizonEventToNativeMap.get('onChange').includes(nativeEvtName)) {
      listenerList = listenerList.concat(getChangeListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }

    if (horizonEventToNativeMap.get('onSelect').includes(nativeEvtName)) {
      listenerList = listenerList.concat(getSelectionListeners(
        nativeEvtName,
        nativeEvent,
        vNode,
        target,
      ));
    }
  }
  return listenerList;
}

// 触发可以被执行的horizon事件监听
function triggerHorizonEvents(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: VNode | null,
): void {
  const nativeEventTarget = nativeEvent.target || nativeEvent.srcElement;

  // 获取委托事件队列
  const listenerList = getProcessListeners(nativeEvtName, vNode, nativeEvent, nativeEventTarget, isCapture);

  // 处理触发的事件队列
  processListeners(listenerList);
}


// 其他事件正在执行中标记
let isInEventsExecution = false;

// 处理委托事件入口
export function handleEventMain(
  nativeEvtName: string,
  isCapture: boolean,
  nativeEvent: AnyNativeEvent,
  vNode: null | VNode,
  targetContainer: EventTarget,
): void {
  let startVNode = vNode;
  if (startVNode !== null) {
    startVNode = getExactNode(startVNode, targetContainer);
    if (!startVNode) {
      return;
    }
  }

  // 有事件正在执行，同步执行事件
  if (isInEventsExecution) {
    triggerHorizonEvents(nativeEvtName, isCapture, nativeEvent, startVNode);
    return;
  }

  // 没有事件在执行，经过调度再执行事件
  isInEventsExecution = true;
  try {
    asyncUpdates(() => triggerHorizonEvents(nativeEvtName, isCapture, nativeEvent, startVNode));
  } finally {
    isInEventsExecution = false;
    if (shouldUpdateValue()) {
      runDiscreteUpdates();
      updateControlledValue();
    }
  }
}
