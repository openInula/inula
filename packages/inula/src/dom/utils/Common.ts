/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { InulaDom } from './Interface';

/**
 * 获取当前聚焦的 input 或者 textarea 元素
 * @param doc 指定 document
 */
export function getFocusedDom(doc?: Document): InulaDom | null {
  const currentDocument = doc ?? document;

  return currentDocument.activeElement ?? currentDocument.body;
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
      if (typeof focusedDom.contentWindow?.location.href === 'string') {
        // iframe 的内容为同源
        focusedDom = getFocusedDom(focusedDom.contentWindow.document);
      } else {
        // 非同源 iframe 因为安全性原因无法获取其中的具体元素
        break;
      }
    } catch (e) {
      // 非同源 iframe 因为安全性原因无法获取其中的具体元素
      break;
    }
  }
  return focusedDom;
}
