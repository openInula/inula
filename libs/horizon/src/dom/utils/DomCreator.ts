
export const NSS = {
  html: 'http://www.w3.org/1999/xhtml',
  math: 'http://www.w3.org/1998/Math/MathML',
  svg: 'http://www.w3.org/2000/svg',
};

// 创建DOM元素
export function createDom(
  tagName: string,
  parentNamespace: string,
): Element {
  let dom: Element;
  const selfNamespace = NSS[tagName] || NSS.html;
  const ns = parentNamespace !== NSS.html ? parentNamespace : selfNamespace;

  if (ns !== NSS.html) {
    dom = document.createElementNS(ns, tagName);
  } else {
    dom = document.createElement(tagName);
  }
  return dom;
}
