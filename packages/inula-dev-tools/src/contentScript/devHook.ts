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

import { contentScriptMessageHandler, installDevToolHook } from '../injector';

// 安装 V1 DevTools Hook
if (!window.__INULA_DEV_HOOK__) {
  // 接受 contentScript 的消息
  window.addEventListener('message', contentScriptMessageHandler);
  installDevToolHook();
}

// 安装 V2 DevTools Hook
if (!window.__INULA_NEXT_DEV_HOOK__) {
  const hookV2 = {
    isInit: false,
    version: 'next',
    roots: [],
    
    listeners: {} as Record<string, ((data: any) => void)[]>,
    
    attach(event: string, fn: (data: any) => void) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(fn);
    },
    
    detach(event: string, fn: (data: any) => void) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    },
    
    subscribe(event: string, fn: (data: any) => void) {
      this.attach(event, fn);
      return () => this.detach(event, fn);
    },
    
    trigger(event: string, data: any) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(fn => fn(data));
      }
    },
    
    registerRoot(compNode: any) {
      if (!this.roots.includes(compNode)) {
        this.roots.push(compNode);
      }
      this.isInit = true;
      this.trigger('startRender', { root: compNode });
      console.log('[Inula DevTools] V2 framework detected');
    },
    
    unregisterRoot(compNode: any) {
      const index = this.roots.indexOf(compNode);
      if (index !== -1) {
        this.roots.splice(index, 1);
      }
    },
    
    getRoot() {
      return this.roots[0];
    },
    
    notifyUpdate() {
      this.trigger('treeUpdate', {});
    },
    
    $0: null,
  };

  Object.defineProperty(window, '__INULA_NEXT_DEV_HOOK__', {
    enumerable: false,
    configurable: true,
    get() {
      return hookV2;
    },
  });
}
