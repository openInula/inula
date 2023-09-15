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

import type { Trigger } from './HookType';
import { useReducerImpl } from './UseReducerHook';

function isFunction<T extends (...args: any) => any>(object: unknown): object is T {
  return typeof object === 'function';
}

function defaultReducer<S>(state: S, action: ((S) => S) | S): S {
  return isFunction(action) ? action(state) : action;
}

export function useStateImpl<S>(initArg?: (() => S) | S): [S, Trigger<((S) => S) | S>] | void {
  return useReducerImpl(defaultReducer, initArg, undefined, true);
}
