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

export interface IObserver {
  useProp: (key: string | symbol) => void;

  addListener: (listener: (mutation: any) => void) => void;

  removeListener: (listener: (mutation: any) => void) => void;

  setProp: (key: string | symbol, mutation: any) => void;

  triggerChangeListeners: (mutation: any) => void;

  triggerUpdate: (vNode: any) => void;

  allChange: () => void;

  clearByVNode: (vNode: any) => void;
}

export type StoreConfig<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  id?: string;
  state?: S;
  actions?: A;
  computed?: C;
  options?: {
    isReduxAdapter?: boolean;
  };
};

export type UserActions<S extends object> = {
  [K: string]: ActionFunction<S>;
};

type ActionFunction<S extends object> = (this: StoreObj<S, any, any>, state: S, ...args: any[]) => any;

export type StoreActions<S extends object, A extends UserActions<S>> = {
  [K in keyof A]: Action<A[K], S>;
};

type Action<T extends ActionFunction<any>, S extends object> = (
  this: StoreObj<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => ReturnType<T>;

export type StoreObj<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  $s: S;
  $a: StoreActions<S, A>;
  $c: UserComputedValues<S>;
  $queue: QueuedStoreActions<S, A>;
  $listeners;
  $subscribe: (listener: (mutation) => void) => void;
  $unsubscribe: (listener: (mutation) => void) => void;
} & { [K in keyof S]: S[K] } & { [K in keyof A]: Action<A[K], S> } & { [K in keyof C]: ReturnType<C[K]> };

export type PlannedAction<S extends object, F extends ActionFunction<S>> = {
  action: string;
  payload: any[];
  resolve: ReturnType<F>;
};

type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0
  ? []
  : ((...b: T) => void) extends (a, ...b: infer I) => void
  ? I
  : [];

export type UserComputedValues<S extends object> = {
  [K: string]: ComputedFunction<S>;
};

type ComputedFunction<S extends object> = (state: S) => any;

export type AsyncAction<T extends ActionFunction<any>, S extends object> = (
  this: StoreObj<S, any, any>,
  ...args: RemoveFirstFromTuple<Parameters<T>>
) => Promise<ReturnType<T>>;

export type QueuedStoreActions<S extends object, A extends UserActions<S>> = {
  [K in keyof A]: AsyncAction<A[K], S>;
};

export type ComputedValues<S extends object, C extends UserComputedValues<S>> = {
  [K in keyof C]: ReturnType<C[K]>;
};
