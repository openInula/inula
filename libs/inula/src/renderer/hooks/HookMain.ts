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

import type { VNode } from '../Types';

import { getLastTimeHook, setLastTimeHook, setCurrentHook, getNextHook } from './BaseHook';
import { HookStage, setHookStage } from './HookStage';

function resetGlobalVariable() {
  setHookStage(null);
  setLastTimeHook(null);
  setCurrentHook(null);
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

  const comp = funcComp(props, arg);

  // 设置hook阶段为null，用于判断hook是否在函数组件中调用
  setHookStage(null);

  // 判断hook是否写在了if条件中，如果在if中会出现数量不对等的情况
  const lastTimeHook = getLastTimeHook();
  if (lastTimeHook !== null) {
    if (getNextHook(getLastTimeHook(), processing.oldHooks) !== null) {
      throw Error('Hooks are less than expected, please check whether the hook is written in the condition.');
    }
  }

  // 重置全局变量
  resetGlobalVariable();

  return comp;
}
