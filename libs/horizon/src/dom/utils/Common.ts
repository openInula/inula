import {HorizonDom} from './Interface';
import {Props} from '../DOMOperator';

/**
 * 获取当前聚焦的 input 或者 textarea 元素
 * @param doc 指定 document
 */
export function getFocusedDom(doc?: Document): HorizonDom | null {
  let currentDocument;
  if (doc) {
    currentDocument = doc;
  } else {
    if (document) {
      currentDocument = document;
    }
  }
  if (!currentDocument) {
    return null;
  } else if (currentDocument.activeElement) {
    return currentDocument.activeElement;
  } else {
    return currentDocument.body;
  }
}

// 如果 input 或者 textarea 元素中有文字被选中时，activeElement 属性就会返回该元素
// 此处是为了返回深层的 iframe 中的真实元素
export function getIFrameFocusedDom() {
  const currentWindow = window;
  let focusedDom = getFocusedDom();
  // 深度优先，返回的元素如果是 iframe 对象则继续查找
  while (focusedDom instanceof currentWindow.HTMLIFrameElement) {
    try {
      // 访问 HTMLIframeElement 的 contentDocument 可能会导致浏览器抛出错误
      if (typeof focusedDom.contentWindow.location.href === 'string') { // iframe 的内容为同源
        focusedDom = getFocusedDom(focusedDom.contentWindow.document);
      } else { // 非同源 iframe 因为安全性原因无法获取其中的具体元素
        break;
      }
    } catch (e) { // 非同源 iframe 因为安全性原因无法获取其中的具体元素
      break;
    }
  }
  return focusedDom;
}

export function isElement(dom) {
  return dom.nodeType === 1;
}

export function isText(dom) {
  return dom.nodeType === 3;
}

export function isComment(dom) {
  return dom.nodeType === 8;
}

export function isDocument(dom) {
  return dom.nodeType === 9;
}

export function isDocumentFragment(dom) {
  return dom.nodeType === 11;
}

export function getDomTag(dom) {
  return dom.nodeName.toLowerCase();
}

const types = ['button', 'input', 'select', 'textarea'];

// button、input、select、textarea、如果有 autoFocus 属性需要focus
export function shouldAutoFocus(tagName: string, props: Props): boolean {
  return types.includes(tagName) ? Boolean(props.autoFocus) : false;
}
