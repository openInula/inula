/**
 * 自定义的基本事件类型
 */

import {VNode} from '../../renderer/Types';

export class CustomBaseEvent {

  data: string;
  defaultPrevented: boolean;
  customEventName: string;
  targetVNode: VNode;
  type: string;
  nativeEvent: any;
  target: EventTarget;
  timeStamp: number;
  isDefaultPrevented: () => boolean;
  isPropagationStopped: () => boolean;
  currentTarget: EventTarget;

  constructor(
    customEvtName: string | null,
    nativeEvtName: string,
    nativeEvt: { [propName: string]: any },
    vNode: VNode,
    target: null | EventTarget
  ) {
    // 复制原生属性到自定义事件
    extendAttribute(this, nativeEvt);

    // custom事件自定义属性
    this.customEventName = customEvtName;
    this.targetVNode = vNode;
    this.type = nativeEvtName;
    this.nativeEvent = nativeEvt;
    this.target = target;
    this.timeStamp = nativeEvt.timeStamp || Date.now();

    const defaultPrevented = nativeEvt.defaultPrevented != null ?
                             nativeEvt.defaultPrevented :
                             nativeEvt.returnValue === false;
    this.defaultPrevented = defaultPrevented;

    this.preventDefault = this.preventDefault.bind(this);
    this.stopPropagation = this.stopPropagation.bind(this);
    this.isDefaultPrevented = () => defaultPrevented;
    this.isPropagationStopped = () => false;
  }

  // 兼容性方法
  persist() {

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

// 从原生事件中复制属性到自定义事件中
function extendAttribute(target, source) {
  const attributes = [
    // AnimationEvent
    'animationName', 'elapsedTime', 'pseudoElement',
    // CompositionEvent、InputEvent
    'data',
    // DragEvent
    'dataTransfer',
    // FocusEvent
    'relatedTarget',
    // KeyboardEvent
    'key', 'keyCode', 'charCode', 'code', 'location', 'ctrlKey', 'shiftKey',
    'altKey', 'metaKey', 'repeat', 'locale', 'getModifierState', 'clipboardData',
    // MouseEvent
    'button', 'buttons', 'clientX', 'clientY', 'movementX', 'movementY',
    'pageX', 'pageY', 'screenX', 'screenY', 'currentTarget',
    // PointerEvent
    'pointerId', 'width', 'height', 'pressure', 'tangentialPressure',
    'tiltX', 'tiltY', 'twist', 'pointerType', 'isPrimary',
    // TouchEvent
    'touches', 'targetTouches', 'changedTouches',
    // TransitionEvent
    'propertyName',
    // UIEvent
    'view', 'detail',
    // WheelEvent
    'deltaX', 'deltaY', 'deltaZ', 'deltaMode',
  ];

  const length = attributes.length;
  for (let i = 0; i < length; i++) {
    const attr = attributes[i];
    const type = source[attr];
    if (type !== 'undefined') {
      if (type === 'function') {
        target[attr] = function() {
          return source[attr].apply(source, arguments);
        };
      } else {
        target[attr] = source[attr];
      }
    }
  }
}
