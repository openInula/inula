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

import type { VNode } from '../Types';

import { getLastTimeHook, setLastTimeHook, setCurrentHook, getNextHook } from './BaseHook';
import { HookStage, setHookStage } from './HookStage';

const NESTED_UPDATE_LIMIT = 50;
// state updated in render phrase
let hasUpdatedInRender = false;
function resetGlobalVariable() {
  setHookStage(null);
  setLastTimeHook(null);
  setCurrentHook(null);
}

export function markUpdatedInRender() {
  hasUpdatedInRender = true;
}

// hook对外入口
export function runFunctionWithHooks<Props extends Record<string, any>, Arg>(
  funcComp: (props: Props, arg: Arg) => any,
  props: Props,
  arg: Arg,
  processing: VNode
) {
  // 重置全局变量
  resetGlobalVariable();

  processing.oldHooks = processing.hooks;
  processing.hooks = [];
  processing.effectList = [];

  // 设置hook阶段
  if (processing.isCreated || !processing.oldHooks!.length) {
    setHookStage(HookStage.Init);
  } else {
    setHookStage(HookStage.Update);
  }

  let comp = funcComp(props, arg);

  if (hasUpdatedInRender) {
    resetGlobalVariable();
    processing.oldHooks = processing.hooks;
    setHookStage(HookStage.Update);
    comp = runFunctionAgain(funcComp, props, arg);
  }
  // 设置hook阶段为null，用于判断hook是否在函数组件中调用
  setHookStage(null);

  // 判断hook是否写在了if条件中，如果在if中会出现数量不对等的情况
  const lastTimeHook = getLastTimeHook();
  if (lastTimeHook !== null) {
    if (getNextHook(getLastTimeHook()!, processing.oldHooks!) !== null) {
      throw Error('Hooks are less than expected, please check whether the hook is written in the condition.');
    }
  }

  // 重置全局变量
  resetGlobalVariable();

  return comp;
}

function runFunctionAgain<Props extends Record<string, any>, Arg>(
  funcComp: (props: Props, arg: Arg) => any,
  props: Props,
  arg: Arg
) {
  let reRenderTimes = 0;
  let childElements;
  while (hasUpdatedInRender) {
    reRenderTimes++;
    if (reRenderTimes > NESTED_UPDATE_LIMIT) {
      throw new Error('Too many setState called in function component');
    }
    hasUpdatedInRender = false;
    childElements = funcComp(props, arg);
  }

  return childElements;
}
