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

export const NSS = {
  html: 'http://www.w3.org/1999/xhtml',
  math: 'http://www.w3.org/1998/Math/MathML',
  svg: 'http://www.w3.org/2000/svg',
};

// 创建DOM元素
export function createDom(tagName: string, parentNamespace: string, doc: Document): Element {
  let dom: Element;
  const selfNamespace = NSS[tagName] || NSS.html;
  const ns = parentNamespace !== NSS.html ? parentNamespace : selfNamespace;

  if (ns !== NSS.html) {
    dom = doc.createElementNS(ns, tagName);
  } else {
    dom = doc.createElement(tagName);
  }
  return dom;
}
