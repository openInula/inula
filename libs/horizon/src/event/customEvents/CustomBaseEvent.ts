/**
 * 自定义的基本事件类型
 */

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

// 从原生事件中复制属性到自定义事件中
function extendAttribute(target, source) {
  let val;
  let attr;
  for (attr in source) {
    val = source[attr];
    if (val !== undefined) {
      if (typeof val === 'function') {
        let fun = source[attr];
        target[attr] = function() {
          return fun.apply(source, arguments);
        };
      } else {
        target[attr] = val;
      }
    }
  }
}

export class CustomBaseEvent {

  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  target: EventTarget | null;

  // 键盘事件属性
  key: string;

  // custom事件自定义属性
  customEventName: string;
  type: string;
  nativeEvent: any;

  constructor(
    customEvtName: string,
    nativeEvtName: string,
    nativeEvt: { [propName: string]: any },
    target: EventTarget | null
  ) {
    // 复制原生属性到自定义事件
    extendAttribute(this, nativeEvt);

    this.isDefaultPrevented = () => nativeEvt.defaultPrevented;
    this.isPropagationStopped = () => nativeEvt.cancelBubble;
    this.target = target;

    // 键盘事件属性
    this.key = uniqueKeyMap.get(nativeEvt.key) || nativeEvt.key;

    // custom事件自定义属性
    this.customEventName = customEvtName;
    this.type = nativeEvtName;
    this.nativeEvent = nativeEvt;
  }
}
