/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

// 需要委托的inula事件和原生事件对应关系
export const allDelegatedInulaEvents = new Map();

// 模拟委托事件，不冒泡事件需要利用其他事件来触发冒泡过程
export const simulatedDelegatedEvents = ['onMouseEnter', 'onMouseLeave'];
// 所有委托的原生事件集合
export const allDelegatedNativeEvents = new Set();

// Inula事件和原生事件对应关系
export const inulaEventToNativeMap = new Map([
  ['onKeyPress', ['keypress']],
  ['onTextInput', ['textInput']],
  ['onClick', ['click']],
  ['onDoubleClick', ['dblclick']],
  ['onFocus', ['focusin']],
  ['onBlur', ['focusout']],
  ['onInput', ['input']],
  ['onWheel', ['wheel']],
  ['onMouseOut', ['mouseout']],
  ['onMouseOver', ['mouseover']],
  ['onPointerOut', ['pointerout']],
  ['onPointerOver', ['pointerover']],
  ['onContextMenu', ['contextmenu']],
  ['onDragEnd', ['dragend']],
  ['onKeyDown', ['keydown']],
  ['onKeyUp', ['keyup']],
  ['onMouseDown', ['mousedown']],
  ['onMouseMove', ['mousemove']],
  ['onMouseUp', ['mouseup']],
  ['onSelectChange', ['selectionchange']],
  ['onTouchEnd', ['touchend']],
  ['onTouchMove', ['touchmove']],
  ['onTouchStart', ['touchstart']],

  ['onCompositionEnd', ['compositionend']],
  ['onCompositionStart', ['compositionstart']],
  ['onCompositionUpdate', ['compositionupdate']],
  ['onChange', ['change', 'click', 'focusout', 'input']],
  ['onSelect', ['select']],
  ['onMouseEnter', ['mouseout', 'mouseover']],
  ['onMouseLeave', ['mouseout', 'mouseover']],

  ['onAnimationEnd', ['animationend']],
  ['onAnimationIteration', ['animationiteration']],
  ['onAnimationStart', ['animationstart']],
  ['onTransitionEnd', ['transitionend']],
]);
export const NativeEventToInulaMap = {
  click: 'click',
  wheel: 'wheel',
  dblclick: 'doubleClick',
  contextmenu: 'contextMenu',
  dragend: 'dragEnd',
  focusin: 'focus',
  focusout: 'blur',
  input: 'input',
  select: 'select',
  keydown: 'keyDown',
  keypress: 'keyPress',
  keyup: 'keyUp',
  mousedown: 'mouseDown',
  mouseup: 'mouseUp',
  touchend: 'touchEnd',
  touchstart: 'touchStart',
  mousemove: 'mouseMove',
  mouseout: 'mouseOut',
  mouseover: 'mouseOver',
  pointermove: 'pointerMove',
  pointerout: 'pointerOut',
  pointerover: 'pointerOver',
  selectionchange: 'selectChange',
  textInput: 'textInput',
  touchmove: 'touchMove',
  animationend: 'animationEnd',
  animationiteration: 'animationIteration',
  animationstart: 'animationStart',
  transitionend: 'transitionEnd',
  compositionstart: 'compositionStart',
  compositionend: 'compositionEnd',
  compositionupdate: 'compositionUpdate',
};
export const CHAR_CODE_SPACE = 32;
export const EVENT_TYPE_BUBBLE = 'Bubble';
export const EVENT_TYPE_CAPTURE = 'Capture';
export const EVENT_TYPE_ALL = 'All';

inulaEventToNativeMap.forEach((dependencies, inulaEvent) => {
  allDelegatedInulaEvents.set(inulaEvent, dependencies);
  allDelegatedInulaEvents.set(inulaEvent + 'Capture', dependencies);

  dependencies.forEach(d => {
    allDelegatedNativeEvents.add(d);
  });
});

export function transformToInulaEvent(nativeEvtName: string) {
  const name = NativeEventToInulaMap[nativeEvtName];
  // 例：dragEnd -> onDragEnd
  return !name ? '' : `on${name[0].toUpperCase()}${name.slice(1)}`;
}
