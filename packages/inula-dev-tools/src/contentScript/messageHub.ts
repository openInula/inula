/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

// 监听来自页面的信息
import { checkMessageSource, modifyMessageSource } from '../utils/transferUtils';
import { DevToolBackground, DevToolContentScript, DevToolHook } from '../utils/constants';

function forwardMsgFromContentScriptToBackground({ data, source }: MessageEvent) {
  if (source !== window || !data) {
    return;
  }
  if (checkMessageSource(data, DevToolHook)) {
    try {
      void chrome.runtime.sendMessage(modifyMessageSource(data, DevToolContentScript));
    } catch {
      /* empty */
    }
  }
}

function forwardMsgFromBackgroundToContentScript(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  // 没有 tab 信息说明消息来自插件
  if (!sender.tab && checkMessageSource(message, DevToolBackground)) {
    window.postMessage(modifyMessageSource(message, DevToolContentScript), '*');
  }
  sendResponse({ status: 'ok' });
}

// 转发Hook的消息给background
window.addEventListener('message', forwardMsgFromContentScriptToBackground, false);

// 转发background的消息给hook
chrome.runtime.onMessage.addListener(forwardMsgFromBackgroundToContentScript);
