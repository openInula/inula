/**
 * 事件绑定实现
 */
import {allDelegatedNativeEvents} from './EventCollection';
import {isDocument} from '../dom/utils/Common';
import {
  getEventListeners,
  getEventToListenerMap,
} from '../dom/DOMInternalKeys';
import {createCustomEventListener} from './WrapperListener';
import {CustomBaseEvent} from './customEvents/CustomBaseEvent';

const listeningMarker =
  '_horizonListening' +
  Math.random()
    .toString(36)
    .slice(4);

// 获取节点上已经委托事件名称
function getListenerSetKey(nativeEvtName: string, isCapture: boolean): string {
  const sufix = isCapture ? 'capture' : 'bubble';
  return `${nativeEvtName}__${sufix}`;
}

function listenToNativeEvent(
  nativeEvtName: string,
  delegatedElement: Element,
  isCapture: boolean,
): void {
  let target: Element | Document = delegatedElement;
  // document层次可能触发selectionchange事件，为了捕获这类事件，selectionchange事件绑定在document节点上
  if (nativeEvtName === 'selectionchange' && !isDocument(delegatedElement)) {
    target = delegatedElement.ownerDocument;
  }

  const listenerSet = getEventListeners(target);
  const listenerSetKey = getListenerSetKey(nativeEvtName, isCapture);

  if (!listenerSet.has(listenerSetKey)) {
    const listener = createCustomEventListener(
      target,
      nativeEvtName,
      isCapture,
    );
    target.addEventListener(nativeEvtName, listener, !!isCapture);
    listenerSet.add(listenerSetKey);
  }
}

// 监听所有委托事件
export function listenDelegatedEvents(dom: Element) {
  if (dom[listeningMarker]) {
    // 不需要重复注册事件
    return;
  }
  dom[listeningMarker] = true;
  allDelegatedNativeEvents.forEach((eventName: string) => {
    // 委托冒泡事件
    listenToNativeEvent(eventName, dom, false);
    // 委托捕获事件
    listenToNativeEvent(eventName, dom, true);
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

// 是否捕获事件
function getIsCapture(horizonEventName) {
  if (horizonEventName === 'onLostPointerCapture' || horizonEventName === 'onGotPointerCapture') {
    return false;
  }
  return horizonEventName.slice(-7) === 'Capture';
}

// 封装监听函数
function getWrapperListener(horizonEventName, nativeEvtName, targetElement, listener) {
  return (event) => {
    const customEvent = new CustomBaseEvent(horizonEventName, nativeEvtName, event, null, targetElement);
    listener(customEvent);
  };
}

// 非委托事件单独监听到各自dom节点
export function listenNonDelegatedEvent(
  horizonEventName: string,
  domElement: Element,
  listener,
): void {
  const isCapture = getIsCapture(horizonEventName);
  const nativeEvtName = getNativeEvtName(horizonEventName, isCapture);

  // 先判断是否存在老的监听事件，若存在则移除
  const eventToListenerMap = getEventToListenerMap(domElement);
  if (eventToListenerMap.get(horizonEventName)) {
    domElement.removeEventListener(nativeEvtName, eventToListenerMap.get(horizonEventName));
  }

  if (typeof listener !== 'function') {
    eventToListenerMap.delete(nativeEvtName);
    return;
  }

  // 为了和委托事件对外行为一致，将事件对象封装成CustomBaseEvent
  const wrapperListener = getWrapperListener(horizonEventName, nativeEvtName, domElement, listener);
  // 添加新的监听
  eventToListenerMap.set(horizonEventName, wrapperListener);
  domElement.addEventListener(nativeEvtName, wrapperListener, isCapture);
}
