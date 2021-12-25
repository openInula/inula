import {CustomKeyboardEvent} from './CustomKeyboardEvent';
import {CustomMouseEvent} from './CustomMouseEvent';
import {CustomBaseEvent} from './CustomBaseEvent';

const CommonEventToCustom = {
  keypress: CustomKeyboardEvent,
  keydown: CustomKeyboardEvent,
  keyup: CustomKeyboardEvent,
  click: CustomMouseEvent,
  dblclick: CustomMouseEvent,
  mousedown: CustomMouseEvent,
  mousemove: CustomMouseEvent,
  mouseup: CustomMouseEvent,
  mouseout: CustomMouseEvent,
  mouseover: CustomMouseEvent,
  contextmenu: CustomMouseEvent,
  pointercancel: CustomMouseEvent,
  pointerdown: CustomMouseEvent,
  pointermove: CustomMouseEvent,
  pointerout: CustomMouseEvent,
  pointerover: CustomMouseEvent,
  pointerup: CustomMouseEvent,
}

// 创建普通自定义事件对象实例，和原生事件对应
export function createCommonCustomEvent(customEventName, nativeEvtName, nativeEvent, vNode, currentTarget) {
  const EventConstructor = CommonEventToCustom[nativeEvtName] || CustomBaseEvent;
  return new EventConstructor(
    customEventName,
    nativeEvtName,
    nativeEvent,
    vNode,
    currentTarget,
  );
}

// 创建模拟事件实例对象,需要handler特殊处理
export function createHandlerCustomEvent(customEventName, nativeEvtName, nativeEvent, vNode, currentTarget) {
  return new CustomMouseEvent(
    customEventName,
    nativeEvtName,
    nativeEvent,
    vNode,
    currentTarget,
  );
}
