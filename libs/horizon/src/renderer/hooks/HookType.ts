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

import { EffectConstant } from './EffectConstant';
type ValueOf<T> = T[keyof T];
export interface Hook<S, A> {
  state: Reducer<S, A> | Effect | Memo<S> | CallBack<S> | Ref<S>;
  hIndex: number;
}

export interface Reducer<S, A> {
  stateValue: S | null;
  trigger: Trigger<A> | null;
  reducer: ((S, A) => S) | null;
  updates: Array<Update<S, A>> | null;
  isUseState: boolean;
}

export type Update<S, A> = {
  action: A;
  didCalculated: boolean;
  state: S | null;
};

export type EffectList = Array<Effect> | null;

export type Effect = {
  effect: () => (() => void) | void;
  removeEffect: (() => void) | void;
  dependencies: Array<any> | null;
  effectConstant: ValueOf<typeof EffectConstant>;
};

export type Memo<V> = {
  result: V | null;
  dependencies: Array<any> | null;
};

export type CallBack<F> = {
  func: F | null;
  dependencies: Array<any> | null;
};

export type Ref<V> = {
  current: V;
};

export type Trigger<A> = (state: A) => void;
