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

export function receiveInulaToolHookMessage(payload: any, tabId: number) {
  if (payload?.type === 'openInula-framework-detected') {
    setExtensionIconAndPopup(true, tabId);
  }
}

export function setExtensionIconAndPopup(enable: boolean, tabId: number) {
  const logo = `${enable ? 'logo' : 'logo_grey'}.png`;
  const page = enable ? 'popup_active' : 'popup_disabled';
  void chrome.action.setIcon({
    tabId: tabId,
    path: {
      '32': chrome.runtime.getURL(`assets/32-${logo}`),
      '48': chrome.runtime.getURL(`assets/48-${logo}`),
      '128': chrome.runtime.getURL(`assets/128-${logo}`),
    },
  });

  void chrome.action.setPopup({
    tabId: tabId,
    popup: chrome.runtime.getURL(`popups/${page}.html`),
  });
}
