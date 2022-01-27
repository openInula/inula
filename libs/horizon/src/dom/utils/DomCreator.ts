
export const NSS = {
  html: 'http://www.w3.org/1999/xhtml',
  math: 'http://www.w3.org/1998/Math/MathML',
  svg: 'http://www.w3.org/2000/svg',
};

const div = document.createElement('div');
const span = document.createElement('span');
const tr = document.createElement('tr');
const td = document.createElement('td');
const a = document.createElement('a');
const p = document.createElement('p');

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
  } else if (tagName === 'div') {
    dom = div.cloneNode(false);
  } else if (tagName === 'span') {
    dom = span.cloneNode(false);
  } else if (tagName === 'tr') {
    dom = tr.cloneNode(false);
  } else if (tagName === 'td') {
    dom = td.cloneNode(false);
  } else if (tagName === 'a') {
    dom = a.cloneNode(false);
  } else if (tagName === 'p') {
    dom = p.cloneNode(false);
  } else {
    dom = document.createElement(tagName);
  }
  return dom;
}
