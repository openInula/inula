
// 兼容IE的event key
const uniqueKeyMap = new Map([
  ['Esc', 'Escape'],
  ['Spacebar', ' '],
  ['Left', 'ArrowLeft'],
  ['Up', 'ArrowUp'],
  ['Right', 'ArrowRight'],
  ['Down', 'ArrowDown'],
  ['Del', 'Delete'],
]);

// 创建普通自定义事件对象实例，和原生事件对应
export function decorateNativeEvent(customEventName, nativeEvtName, nativeEvent) {

  nativeEvent.isDefaultPrevented = () => nativeEvent.defaultPrevented;
  nativeEvent.isPropagationStopped = () => nativeEvent.cancelBubble;

  // custom事件自定义属性
  nativeEvent.customEventName = customEventName;
  nativeEvent.nativeEvent = nativeEvent;
  // 保存原生的事件类型，因为下面会修改
  nativeEvent.nativeEventType = nativeEvent.type;

  Object.defineProperty(nativeEvent, 'type', { writable: true });
  nativeEvent.type = nativeEvtName;

  const orgKey = nativeEvent.key;
  Object.defineProperty(nativeEvent, 'key', { writable: true });
  nativeEvent.key = uniqueKeyMap.get(orgKey) || orgKey;

  return nativeEvent;
}
