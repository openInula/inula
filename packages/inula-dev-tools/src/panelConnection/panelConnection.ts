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

import { packagePayload } from '../utils/transferUtils';
import { DevToolPanel, InitDevToolPageConnection } from '../utils/constants';

let connection;
const callbacks = [];

export function addBackgroundMessageListener(func: (message) => void) {
  callbacks.push(func);
}

export function removeBackgroundMessageListener(func: (message) => void) {
  const index = callbacks.indexOf(func);
  if (index !== -1) {
    callbacks.splice(index, 1);
  }
}

export function initBackgroundConnection(type) {
  if (!isDev) {
    try {
      connection = chrome.runtime.connect({ name: type });
      const notice = message => {
        callbacks.forEach(func => {
          func(message);
        });
      };
      // 监听 background 消息
      connection.onMessage.addListener(notice);
      // 页面打开后发送初始化请求
      postMessageToBackground(InitDevToolPageConnection);
    } catch (e) {
      console.error('create connection failer');
      console.error(e);
    }
  }
}

let reconnectionTimes = 0;
export function postMessageToBackground(type: string, data?: any, inulaX?: boolean) {
  try {
    const payload = data
      ? { type, tabId: chrome.devtools.inspectedWindow.tabId, data }
      : { type, tabId: chrome.devtools.inspectedWindow.tabId };
    connection.postMessage(packagePayload(payload, DevToolPanel));
  } catch (e) {
    // 可能出现 port 关闭的场景，需要重新建立连接，增加可靠性
    if (reconnectionTimes === 20) {
      reconnectionTimes = 0;
      console.error('reconnect failed');
      return;
    }
    console.error(e);
    reconnectionTimes++;
    // 重新连接
    initBackgroundConnection(inulaX ? 'panelX' : 'panel');
    // 初始化成功后才会重新发送消息
    postMessageToBackground(type, data);
  }
}
