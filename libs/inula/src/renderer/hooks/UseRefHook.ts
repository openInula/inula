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
import type { Ref } from './HookType';

export function useRefImpl<V>(value?: V): Ref<V> {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  let hook;
  if (stage === HookStage.Init) {
    hook = createHook();
    hook.state = { current: value };
  } else if (stage === HookStage.Update) {
    hook = getCurrentHook();
  }

  return hook.state;
}
