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

import { CompNode } from './Nodes/CompNode/node';

declare global {
  interface Window {
    __INULA_NEXT_DEV_HOOK__?: any;
  }
}

/**
 * 注册根组件到 DevTools
 * 这个函数会在 render 时被调用
 */
export function registerRootToDevTools(compNode: CompNode): void {
  if (typeof window === 'undefined') {
    return;
  }

  const hook = window.__INULA_NEXT_DEV_HOOK__;
  if (hook && typeof hook.registerRoot === 'function') {
    hook.registerRoot(compNode);
  }
}

/**
 * 取消注册根组件
 */
export function unregisterRootFromDevTools(compNode: CompNode): void {
  if (typeof window === 'undefined') {
    return;
  }

  const hook = window.__INULA_NEXT_DEV_HOOK__;
  if (hook && typeof hook.unregisterRoot === 'function') {
    hook.unregisterRoot(compNode);
  }
}

/**
 * 通知 DevTools 组件树已更新
 */
export function notifyDevToolsUpdate(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const hook = window.__INULA_NEXT_DEV_HOOK__;
  if (hook && typeof hook.notifyUpdate === 'function') {
    hook.notifyUpdate();
  }
}

