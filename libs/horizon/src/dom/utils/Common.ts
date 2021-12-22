import {HorizonDom} from './Interface';

/**
 * 获取当前聚焦的 input 或者 textarea 元素
 * @param currentDoc 指定 document
 */
export function getFocusedDom(currentDoc?: Document): HorizonDom | void {
  let currentDocument;
  if (currentDoc) {
    currentDocument = currentDoc;
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

export function getRootElement(dom: HorizonDom): HorizonDom {
  let rootElement = dom;

  while (rootElement.parentNode) {
    // @ts-ignore
    rootElement = rootElement.parentNode;
  }

  return rootElement;
}
