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

import { checkMessage, packagePayload, changeSource } from "../utils/transferUtils";
import { RequestAllVNodeTreeInfos, InitDevToolPageConnection, DevToolBackground } from "../utils/constants";
import { DevToolPanel, DevToolContentScript } from "../utils/constants";

// 多个页面 tab 页共享一个 background，需要建立连接池，给每个 tab 建立连接
export const connections = {};

// panel 代码中调用 let backgroundPageConnection = chrome.runtime.connect({...}) 会触发回调函数
chrome.runtime.onConnect.addListener(function (port) {
  function extensionListener(message) {
    const isInulaMessage = checkMessage(message, DevToolPanel);
    if (isInulaMessage) {
      const { payload } = message;
      // tabId 值指当前浏览器分配给 web_page 的 id 值。是 panel 页面查询得到，指定向页面发送消息
      const { type, data, tabId } = payload;
      let passMessage;
      if (type === InitDevToolPageConnection) {
        // 记录 panel 所在 tab 页的 tabId，如果已经记录了，覆盖原有 port，因为原有 port 可能关闭了
        // 可能这次是 panel 发起的重新建立请求
        connections[tabId] = port;
        passMessage = packagePayload({ type: RequestAllVNodeTreeInfos }, DevToolBackground);
      } else {
        passMessage = packagePayload({ type, data }, DevToolBackground);
      }
      chrome.tabs.sendMessage(tabId, passMessage);
    }
  }

  // 监听 dev tools 页面发送的消息
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(function (port) {
    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// 监听来自 content script 的消息，并将消息发送给对应的 dev tools 页面
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // 来自 content script 的消息需要预先设置 sender.tab
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (message.payload.type.startsWith('inulax')) {
      return;
    }
    if (tabId && tabId in connections && checkMessage(message, DevToolContentScript)) {
      changeSource(message, DevToolBackground);
      connections[tabId].postMessage(message);
    } else {
      // TODO: 如果查询失败，发送 chrome message ，请求 panel 主动建立连接
      console.log('Tab is not found in connection');
    }
  } else {
    console.log('sender.tab is not defined');
  }
  // 需要返回消息告知完成通知，否则会出现报错 message port closed before a response was received
  sendResponse({ status: 'ok' });
});
