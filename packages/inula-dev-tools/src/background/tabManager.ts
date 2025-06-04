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

import { setExtensionIconAndPopup } from './messageHandler';

function isRestrictedBrowserPage(url: string) {
  if (!url) {
    return true;
  }

  const urlProtocol = new URL(url).protocol;
  return urlProtocol === 'chrome:' || urlProtocol === 'about:';
}

function insureIconAndPopupRight(tab: chrome.tabs.Tab) {
  if (tab && isRestrictedBrowserPage(tab.url)) {
    setExtensionIconAndPopup(false, tab.id);
  }
}

chrome.tabs.query({ active: true }, result => result.forEach(insureIconAndPopupRight));
chrome.tabs.onCreated.addListener(tab => insureIconAndPopupRight(tab));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && isRestrictedBrowserPage(changeInfo.url)) {
    setExtensionIconAndPopup(false, tabId);
  }
});
