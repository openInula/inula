import {CustomBaseEvent} from './CustomBaseEvent';

// 创建普通自定义事件对象实例，和原生事件对应
export function createCustomEvent(customEventName, nativeEvtName, nativeEvent, currentTarget) {
  return new CustomBaseEvent(
    customEventName,
    nativeEvtName,
    nativeEvent,
    currentTarget,
  );
}
