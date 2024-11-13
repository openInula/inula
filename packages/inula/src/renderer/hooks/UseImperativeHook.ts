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

import { useLayoutEffectImpl } from './UseEffectHook';
import { getHookStage } from './HookStage';
import { throwNotInFuncError } from './BaseHook';
import type { MutableRef } from './HookType';
import { isNotNull } from '../../renderer/utils/common';

function effectFunc<R>(func: () => R, ref: MutableRef<R> | ((any) => any) | null): (() => void) | void {
  if (typeof ref === 'function') {
    const value = func();
    ref(value);
    return () => {
      ref(null);
    };
  }

  if (isNotNull(ref)) {
    ref!.current = func();
    return () => {
      ref!.current = null as unknown as R;
    };
  }
}

export function useImperativeHandleImpl<R>(
  ref: { current: R | null } | ((any) => any) | null | void,
  func: () => R,
  dependencies?: Array<any> | null
): void {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  const params = isNotNull(dependencies) ? dependencies?.concat([ref]) : null;
  useLayoutEffectImpl(effectFunc.bind(null, func, ref), params);
}
