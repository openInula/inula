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

const scripts: chrome.scripting.RegisteredContentScript[] = [
  {
    id: 'openInula/devtoolHook',
    js: ['devHook.js'],
    matches: ['<all_urls>'],
    persistAcrossSessions: true,
    runAt: 'document_start',
    world: 'MAIN',
  },
];

async function injectContentScript() {
  try {
    await chrome.scripting.unregisterContentScripts();
    await chrome.scripting.registerContentScripts(scripts);
  } catch (err) {
    console.error(err);
  }
}

void injectContentScript();
