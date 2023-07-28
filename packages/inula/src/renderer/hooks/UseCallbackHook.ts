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

import { createHook, getCurrentHook, throwNotInFuncError } from './BaseHook';
import { getHookStage, HookStage } from './HookStage';
import { isArrayEqual } from '../utils/compare';

export function useCallbackImpl<F>(func: F, dependencies?: Array<any> | null): F {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  let hook;
  const deps = dependencies !== undefined ? dependencies : null;
  if (stage === HookStage.Init) {
    hook = createHook();
    hook.state = { func, dependencies: deps };
  } else if (stage === HookStage.Update) {
    hook = getCurrentHook();

    const lastState = hook.state;
    // 判断dependencies是否相同，不同就不更新state
    if (lastState !== null && deps !== null && isArrayEqual(deps, lastState.dependencies)) {
      return lastState.func;
    }
    hook.state = { func, dependencies: deps };
  }

  return func;
}
