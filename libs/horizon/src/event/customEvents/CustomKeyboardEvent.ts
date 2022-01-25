/**
 * 自定义键盘事件
 */

import type {VNode} from '../../renderer/Types';
import {uniqueCharCode} from '../utils';
import {CustomBaseEvent} from './CustomBaseEvent';
import {CHAR_CODE_ENTER} from '../const';

const uniqueKeyMap = new Map([
  ['Esc', 'Escape'],
  ['Spacebar', ' '],
  ['Left', 'ArrowLeft'],
  ['Up', 'ArrowUp'],
  ['Right', 'ArrowRight'],
  ['Down', 'ArrowDown'],
  ['Del', 'Delete'],
]);

const charCodeToKeyMap = new Map([
  [8, 'Backspace'],
  [9, 'Tab'],
  [13, 'Enter'],
  [16, 'Shift'],
  [17, 'Control'],
  [18, 'Alt'],
  [19, 'Pause'],
  [27, 'Escape'],
  [32, ' '],
  [33, 'PageUp'],
  [34, 'PageDown'],
  [35, 'End'],
  [36, 'Home'],
  [37, 'ArrowLeft'],
  [38, 'ArrowUp'],
  [39, 'ArrowRight'],
  [40, 'ArrowDown'],
  [46, 'Delete']
]);

function getKey(event) {
  if (event.key) {
    return uniqueKeyMap.get(event.key) || event.key;
  }

  if (event.type === 'keypress') {
    const charCode = uniqueCharCode(event);
    return charCode === CHAR_CODE_ENTER ? 'Enter' : String.fromCharCode(charCode);
  }

  if (event.type === 'keydown' || event.type === 'keyup') {
    return charCodeToKeyMap.get(event.keyCode);
  }

  return '';
}

export class CustomKeyboardEvent extends CustomBaseEvent {

  key: string;
  charCode: number;
  keyCode: number;
  which: number;

  constructor(
    customEvtName: string | null,
    nativeEvtName: string,
    nativeEvt: { [propName: string]: any },
    vNode: VNode,
    target: null | EventTarget
  ) {
    super(customEvtName, nativeEvtName, nativeEvt, vNode, target);
    this.key = getKey(nativeEvt);
    this.charCode = nativeEvtName === 'keypress' ? uniqueCharCode(nativeEvt) : 0;
    this.keyCode = nativeEvtName === 'keydown' || nativeEvtName === 'keyup' ? nativeEvt.keyCode : 0;
    this.which = this.charCode || this.keyCode;
  }
}
