import {isText} from '../dom/utils/Common';
import { CHAR_CODE_ENTER, CHAR_CODE_SPACE } from './const';

export function uniqueCharCode(nativeEvent): number {
  let charCode = nativeEvent.charCode;

  // 火狐浏览器没有设置enter键的charCode，用keyCode
  if (charCode === 0 && nativeEvent.keyCode === CHAR_CODE_ENTER) {
    charCode = CHAR_CODE_ENTER;
  }

  // 当ctrl按下时10表示enter键按下
  if (charCode === 10) {
    charCode = CHAR_CODE_ENTER;
  }

  // 忽略非打印的Enter键
  if (charCode >= CHAR_CODE_SPACE || charCode === CHAR_CODE_ENTER) {
    return charCode;
  }

  return 0;
}

// 获取事件的target对象
export function getEventTarget(nativeEvent) {
  const target = nativeEvent.target || nativeEvent.srcElement || window;
  if (isText(target)) {
    return target.parentNode;
  }
  return target;
}

// 支持的输入框类型
const supportedInputTypes = ['color', 'date', 'datetime', 'datetime-local', 'email', 'month',
  'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];

export function isTextInputElement(dom?: HTMLElement): boolean {
  if (dom instanceof HTMLInputElement) {
    return supportedInputTypes.includes(dom.type);
  }

  const nodeName = dom && dom.nodeName && dom.nodeName.toLowerCase();
  return nodeName === 'textarea';
}


// 例：dragEnd -> onDragEnd
export function getCustomEventNameWithOn(name) {
  if (!name) {
    return '';
  }
  return 'on' + name[0].toUpperCase() + name.slice(1);
}
