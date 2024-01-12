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

import { getHookStage, HookStage } from '../HookStage';
import { createHook, getCurrentHook, throwNotInFuncError } from '../BaseHook';
import { disposeReactive } from '../../../reactive/RContext';
import { useCallbackImpl } from '../UseCallbackHook';
import { useEffectImpl } from '../UseEffectHook';
import { Atom } from '../../../reactive/Atom';
import { AtomNode, PrimitiveType } from '../../../reactive/types';

export function useAtomImpl<T extends PrimitiveType>(initialValue: T): [AtomNode<T>, (value: T) => void] {
  const stage = getHookStage();
  let atom: Atom<T>;

  switch (stage) {
    case HookStage.Init:
      atom = new Atom(initialValue);
      createHook(atom);
      break;
    case HookStage.Update:
      atom = getCurrentHook().state as unknown as Atom;
      break;
    default:
      throwNotInFuncError();
  }

  const setAtom = useCallbackImpl((value: T) => {
    atom.set(value);
  }, []);

  // 组件销毁时，清除effect
  useEffectImpl(
    () => () => {
      disposeReactive(atom);
    },
    []
  );

  return [atom, setAtom];
}
