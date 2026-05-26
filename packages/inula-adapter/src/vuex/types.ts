/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { StoreObj } from 'openinula';

export type AnyFunction = (...args: any[]) => any;

export interface VuexStoreOptions<
  State extends Record<string, unknown> = Record<string, unknown>,
  Mutations extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Actions extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  RootState extends Record<string, unknown> = Record<string, unknown>,
  RootGetters extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
> {
  namespaced?: boolean;
  state?: State | (() => State);
  mutations?: MutationsType<Mutations, State>;
  actions?: ActionsType<Actions, State, Getters, RootState, RootGetters>;
  getters?: GettersType<State, Getters, State, Getters>;
  modules?: {
    [k in keyof Modules]: VuexStoreOptions<Modules[k]>;
  };
}

type MutationsType<Mutations, State> = {
  [K in keyof Mutations]: AddFirstArg<Mutations[K], State>;
};

type ActionsType<Actions, State, Getters, RootState, RootGetters> = {
  [K in keyof Actions]: AddFirstArg<
    Actions[K],
    {
      commit: CommitType;
      dispatch: DispatchType;
      state: State;
      getters: Getters;
      rootState: RootState;
      rootGetters: RootGetters;
    }
  >;
};

type AddFirstArg<T, S> = T extends (arg1: any, ...args: infer A) => infer R
  ? (state: S, ...args: A) => R
  : T extends () => infer R
    ? (state: S) => R
    : T;

type GettersType<State, Getters, RootState, RootGetters> = {
  [K in keyof Getters]: AddArgs<Getters[K], [State, Getters, RootState, RootGetters]>;
};

type AddArgs<T, Args extends any[]> = T extends (...args: infer A) => infer R
  ? (...args: [...Args, ...A]) => R
  : T extends () => infer R
    ? (...args: Args) => R
    : T;

export type CommitType = (
  type: string | (Record<string, unknown> & { type: string }),
  payload?: any,
  options?: Record<string, unknown>,
  moduleName?: string
) => void;

export type DispatchType = (
  type: string | (Record<string, unknown> & { type: string }),
  payload?: any,
  options?: Record<string, unknown>,
  moduleName?: string
) => any;

export type VuexStore<
  State extends Record<string, unknown> = Record<string, unknown>,
  Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>,
> = {
  state: State & {
    [K in keyof Modules]: Modules[K] extends { state: infer ModuleState } ? ModuleState : Modules[K];
  };
  getters: {
    [K in keyof Getters]: ReturnType<Getters[K]>;
  };
  commit: CommitType;
  dispatch: DispatchType;
  subscribe: AnyFunction;
  subscribeAction: AnyFunction;
  watch: (fn: (state: State, getters: Getters) => void, cb: AnyFunction) => void;
  registerModule: (moduleName: string, module: VuexStoreOptions) => void;
  unregisterModule: (moduleName: string) => void;
  hasModule: (moduleName: string) => boolean;
  getModule: (moduleName: string) => StoreObj;
  install: (app: any, injectKey?: string) => void;
};
