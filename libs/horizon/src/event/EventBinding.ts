/**
 * 事件绑定实现，分为绑定委托事件和非委托事件
 */
import {allDelegatedNativeEvents} from './EventCollection';
import {isDocument} from '../dom/utils/Common';
import {
  getNearestVNode,
  getNonDelegatedListenerMap,
} from '../dom/DOMInternalKeys';
import {CustomBaseEvent} from './customEvents/CustomBaseEvent';
import {runDiscreteUpdates} from '../renderer/TreeBuilder';
import {isMounted} from '../renderer/vnode/VNodeUtils';
import {SuspenseComponent} from '../renderer/vnode/VNodeTags';
import {handleEventMain} from './HorizonEventMain';

const listeningMarker = '_horizonListening' + Math.random().toString(36).slice(4);

// 触发委托事件
function triggerDelegatedEvent(
  nativeEvtName: string,
  isCapture: boolean,
  targetDom: EventTarget,
  nativeEvent, // 事件对象event
) {
  // 执行之前的调度事件
  runDiscreteUpdates();

  const nativeEventTarget = nativeEvent.target || nativeEvent.srcElement;
  let targetVNode = getNearestVNode(nativeEventTarget);

  if (targetVNode !== null) {
    if (isMounted(targetVNode)) {
      if (targetVNode.tag === SuspenseComponent) {
        targetVNode = null;
      }
    } else {
      // vNode已销毁
      targetVNode = null;
    }
  }
  handleEventMain(nativeEvtName, isCapture, nativeEvent, targetVNode, targetDom);
}

// 监听委托事件
function listenToNativeEvent(
  nativeEvtName: string,
  delegatedElement: Element,
  isCapture: boolean,
): void {
  let dom: Element | Document = delegatedElement;
  // document层次可能触发selectionchange事件，为了捕获这类事件，selectionchange事件绑定在document节点上
  if (nativeEvtName === 'selectionchange' && !isDocument(delegatedElement)) {
    dom = delegatedElement.ownerDocument;
  }

  const listener = triggerDelegatedEvent.bind(null, nativeEvtName, isCapture, dom);
  dom.addEventListener(nativeEvtName, listener, isCapture);
}

// 监听所有委托事件
export function listenDelegatedEvents(dom: Element) {
  if (dom[listeningMarker]) {
    // 不需要重复注册事件
    return;
  }
  dom[listeningMarker] = true;

  allDelegatedNativeEvents.forEach((nativeEvtName: string) => {
    // 委托冒泡事件
    listenToNativeEvent(nativeEvtName, dom, false);
    // 委托捕获事件
    listenToNativeEvent(nativeEvtName, dom, true);
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
function isCaptureEvent(horizonEventName) {
  if (horizonEventName === 'onLostPointerCapture' || horizonEventName === 'onGotPointerCapture') {
    return false;
  }
  return horizonEventName.slice(-7) === 'Capture';
}

// 封装监听函数
function getWrapperListener(horizonEventName, nativeEvtName, targetElement, listener) {
  return event => {
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
