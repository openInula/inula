/**
 * 自定义的基本事件类型
 */

import {VNode} from '../../renderer/Types';

// 从原生事件中复制属性到自定义事件中
function extendAttribute(target, source) {
  let val;
  let attr;
  for (attr in source) {
    // 这两个方法需要override
    if (attr === 'preventDefault' || attr === 'stopPropagation') {
      continue;
    }

    val = source[attr];
    if (val !== undefined) {
      if (typeof val === 'function') {
        target[attr] = function() {
          return source[attr].apply(source, arguments);
        };
      } else {
        target[attr] = source[attr];
      }
    }
  }
}

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

export class CustomBaseEvent {

  defaultPrevented: boolean;
  target: EventTarget;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  currentTarget: EventTarget;
  relatedTarget: EventTarget;

  // custom事件自定义属性
  customEventName: string;
  targetVNode: VNode;
  type: string;
  timeStamp: number;
  nativeEvent: any;

  // 键盘事件属性
  key: string;
  charCode: number;
  keyCode: number;
  which: number;

  constructor(
    customEvtName: string | null,
    nativeEvtName: string,
    nativeEvt: { [propName: string]: any },
    vNode: VNode | null,
    target: null | EventTarget
  ) {
    // 复制原生属性到自定义事件
    extendAttribute(this, nativeEvt);

    const defaultPrevented = nativeEvt.defaultPrevented != null ?
                             nativeEvt.defaultPrevented :
                             nativeEvt.returnValue === false;
    this.defaultPrevented = defaultPrevented;
    this.preventDefault = this.preventDefault.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
    this.isDefaultPrevented = () => defaultPrevented;
    this.isPropagationStopped = () => false;
    this.relatedTarget = nativeEvt.relatedTarget;
    this.target = target;

    // 键盘事件属性
    this.key = uniqueKeyMap.get(nativeEvt.key) || nativeEvt.key;

    // custom事件自定义属性
    this.customEventName = customEvtName;
    this.targetVNode = vNode;
    this.type = nativeEvtName;
    this.nativeEvent = nativeEvt;
  }

  // 阻止默认行为
  preventDefault() {
    this.defaultPrevented = true;
    if (!this.nativeEvent) {
      return;
    }

    if (typeof this.nativeEvent.preventDefault === 'function') {
      this.nativeEvent.preventDefault();
    }
    this.nativeEvent.returnValue = false;
    this.isDefaultPrevented = () => true;
  }

  // 停止冒泡
  stopPropagation() {
    if (!this.nativeEvent) {
      return;
    }

    if (typeof this.nativeEvent.stopPropagation === 'function') {
      this.nativeEvent.stopPropagation();
    }
    this.nativeEvent.cancelBubble = true;
    this.isPropagationStopped = () => true;
  }
}
