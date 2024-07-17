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

import { injectSrc, injectCode } from '../utils/injectUtils';
import { checkMessage } from '../utils/transferUtils';
import { DevToolContentScript, DevToolHook, DevToolBackground } from '../utils/constants';
import { changeSource } from '../utils/transferUtils';

// 页面的 window 对象不能直接通过 contentScript 代码修改，只能通过添加 js 代码往页面 window 注入 hook
const rendererURL = chrome.runtime.getURL('/injector.js');
if (window.performance.getEntriesByType('navigation')) {
  const entryType = (window.performance.getEntriesByType('navigation')[0] as any).type;
  if (entryType === 'navigate') {
    injectSrc(rendererURL);
  } else if (entryType === 'reload' && !(window as any).__INULA_DEV_HOOK__) {
    let rendererCode;
    const request = new XMLHttpRequest();
    request.addEventListener('load', function () {
      rendererCode = this.responseText;
    });
    request.open('GET', rendererURL, false);
    request.send();
    injectCode(rendererCode);
  }
}

// 监听来自页面的信息
window.addEventListener(
  'message',
  event => {
    // 只监听来自本页面的消息
    if (event.source !== window) {
      return;
    }

    const data = event.data;
    if (checkMessage(data, DevToolHook)) {
      changeSource(data, DevToolContentScript);
      // 传递给 background
      chrome.runtime.sendMessage(data);
    }
  },
  false
);

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // 该方法可以监听页面 contentScript 和插件的消息
  // 没有 tab 信息说明消息来自插件
  if (!sender.tab && checkMessage(message, DevToolBackground)) {
    changeSource(message, DevToolContentScript);
    // 传递消息给页面
    window.postMessage(message, '*');
  }
  sendResponse({ status: 'ok' });
});
