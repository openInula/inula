
// Horizon事件和原生事件对应关系
export const horizonEventToNativeMap = new Map([
  ['onKeyPress', ['keypress']],
  ['onTextInput', ['textInput']],
  ['onClick', ['click']],
  ['onDoubleClick', ['dblclick']],
  ['onFocus', ['focusin']],
  ['onBlur', ['focusout']],
  ['onInput', ['input']],
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
  ['onBeforeInput', ['compositionend', 'keypress', 'textInput']],
  ['onChange', ['change', 'click', 'focusout', 'input']],
  ['onSelect', ['focusout', 'contextmenu', 'dragend', 'focusin',
                'keydown', 'keyup', 'mousedown', 'mouseup', 'selectionchange']],

  ['onAnimationEnd', ['animationend']],
  ['onAnimationIteration', ['animationiteration']],
  ['onAnimationStart', ['animationstart']],
  ['onTransitionEnd', ['transitionend']]
]);

export const CommonEventToHorizonMap = {
  click: 'click',
  dblclick: 'doubleClick',
  contextmenu: 'contextMenu',
  dragend: 'dragEnd',
  focusin: 'focus',
  focusout: 'blur',
  input: 'input',
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

export const CHAR_CODE_ENTER = 13;
export const CHAR_CODE_SPACE = 32;


export const EVENT_TYPE_BUBBLE = 'Bubble';
export const EVENT_TYPE_CAPTURE = 'Capture';
export const EVENT_TYPE_ALL = 'All';

