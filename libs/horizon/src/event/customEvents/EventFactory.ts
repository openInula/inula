import {CustomKeyboardEvent} from './CustomKeyboardEvent';
import {CustomBaseEvent} from './CustomBaseEvent';

const keyboardEvents = {
  keypress: CustomKeyboardEvent,
  keydown: CustomKeyboardEvent,
  keyup: CustomKeyboardEvent,
}

// 创建普通自定义事件对象实例，和原生事件对应
export function createCustomEvent(customEventName, nativeEvtName, nativeEvent, vNode, currentTarget) {
  const EventConstructor = keyboardEvents[nativeEvtName] || CustomBaseEvent;
  return new EventConstructor(
    customEventName,
    nativeEvtName,
    nativeEvent,
    vNode,
    currentTarget,
  );
}
