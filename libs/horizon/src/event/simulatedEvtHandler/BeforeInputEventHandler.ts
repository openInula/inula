import type {VNode} from '../../renderer/Types';
import type {AnyNativeEvent, ProcessingListenerList} from '../Types';
import {getListenersFromTree} from '../ListenerGetter';
import {createHandlerCustomEvent} from '../customEvents/EventFactory';
import {CHAR_CODE_SPACE, EVENT_TYPE_ALL} from '../const';
import {CustomBaseEvent} from '../customEvents/CustomBaseEvent';
const SPACE_CHAR = String.fromCharCode(CHAR_CODE_SPACE);

function getInputCharsByNative(
  eventName: string,
  nativeEvent: any,
): string | void {
  if (eventName === 'compositionend') {
    return (nativeEvent.detail && nativeEvent.detail.data) || null;
  }
  if (eventName === 'keypress') {
    return nativeEvent.which === CHAR_CODE_SPACE ? SPACE_CHAR : null;
  }
  if (eventName === 'textInput') {
    return nativeEvent.data === SPACE_CHAR ? null : nativeEvent.data;
  }
  return null;
}

// 自定义beforeInput的hook事件处理
export function getListeners(
  nativeEvtName: string,
  nativeEvent: AnyNativeEvent,
  vNode: null | VNode,
  target: null | EventTarget,
): ProcessingListenerList {
  const chars = getInputCharsByNative(nativeEvtName, nativeEvent);
  // 无字符将要输入，无需处理
  if (!chars) {
    return [];
  }

  const event: CustomBaseEvent = createHandlerCustomEvent(
    'onBeforeInput',
    'beforeinput',
    nativeEvent,
    null,
    target,
  );
  event.data = chars;

  return getListenersFromTree(vNode, 'onBeforeInput', event, EVENT_TYPE_ALL);
}
