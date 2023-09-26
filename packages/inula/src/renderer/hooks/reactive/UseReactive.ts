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

import { reactive } from '../../../reactive/Reactive';
import { getHookStage, HookStage } from '../HookStage';
import { createHook, getCurrentHook, throwNotInFuncError } from '../BaseHook';
import { useEffectImpl } from '../UseEffectHook';
import { disposeReactive } from '../../../reactive/RContext';
import { Reactive, ReactiveProxy } from '../../../reactive/types';

export function useReactiveImpl<T>(obj) {
  const stage = getHookStage();
  let reactiveObj: any;

  switch (stage) {
    case HookStage.Init:
      reactiveObj = reactive<T>(obj);

      createHook(reactiveObj);
      break;
    case HookStage.Update:
      reactiveObj = getCurrentHook().state as unknown as Reactive<T>;
      break;
    default:
      throwNotInFuncError();
  }

  // 组件销毁时，清除effect
  useEffectImpl(
    () => () => {
      disposeReactive(reactiveObj);
    },
    []
  );

  return reactiveObj as ReactiveProxy<T>;
}
