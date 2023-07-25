/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import type { Hook } from './HookType';
import { getProcessingVNode } from '../GlobalVar';

// lastTimeHook是上一次执行func时产生的hooks中，与currentHook对应的hook
let lastTimeHook: Hook<any, any> | null = null;

// 当前hook函数对应的hook对象
let currentHook: Hook<any, any> | null = null;

export function getLastTimeHook() {
  return lastTimeHook;
}

export function setLastTimeHook(hook: Hook<any, any> | null) {
  lastTimeHook = hook;
}

export function setCurrentHook(hook: Hook<any, any> | null) {
  currentHook = hook;
}

export function throwNotInFuncError(): never {
  throw Error('Hooks should be used inside function component.');
}

// 新建一个hook，并放到vNode.hooks中
export function createHook(state: any = null): Hook<any, any> {
  const processingVNode = getProcessingVNode();
  const newHook: Hook<any, any> = {
    state: state,
    hIndex: processingVNode.hooks.length,
  };

  currentHook = newHook;
  processingVNode.hooks.push(newHook);

  return currentHook;
}

export function getNextHook(hook: Hook<any, any>, hooks: Array<Hook<any, any>>): Hook<any, any> | null {
  return hooks[hook.hIndex + 1] || null;
}

// 获取当前hook函数对应的hook对象。
// processing中的hook和上一次执行中的hook，需要同时往前走，
// 原因：1.比对hook的数量有没有变化（非必要）；2.从上一次执行中的hook获取removeEffect
export function getCurrentHook(): Hook<any, any> {
  const processingVNode = getProcessingVNode();
  currentHook =
    currentHook !== null ? getNextHook(currentHook, processingVNode.hooks) : processingVNode.hooks[0] || null;

  if (lastTimeHook !== null) {
    lastTimeHook = getNextHook(lastTimeHook, processingVNode.oldHooks);
  } else {
    if (processingVNode.oldHooks && processingVNode.oldHooks.length) {
      lastTimeHook = processingVNode.oldHooks[0];
    } else {
      lastTimeHook = null;
    }
  }

  if (currentHook === null) {
    if (lastTimeHook === null) {
      throw Error('Hooks are more than expected, please check whether the hook is written in the condition.');
    }

    createHook(lastTimeHook.state);
  }

  return currentHook;
}
