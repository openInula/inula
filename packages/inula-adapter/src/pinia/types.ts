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

import type { RefType, UnwrapRef, ComputedImpl } from 'openinula';

export type StoreSetup<R = Record<string, unknown>> = () => R;

export type AnyFunction = (...args: any[]) => any;

// defineStore init type
export interface StoreDefinition<
  Id extends string = string,
  S extends Record<string, unknown> = Record<string, unknown>,
  A extends Record<string, AnyFunction> = Record<string, AnyFunction>,
  C extends Record<string, AnyFunction> = Record<string, AnyFunction>,
> {
  id?: Id;
  state?: () => S;
  actions?: ActionType<A, S, C>;
  getters?: ComputedType<C, S>;
}

// defineStore return type
export type Store<
  S extends Record<string, unknown>,
  A extends Record<string, AnyFunction>,
  C extends Record<string, AnyFunction>,
> = {
  $s: S;
  $state: S;
  $a: ActionType<A, S, C>;
  $c: ComputedType<C, S>;
  $subscribe: (listener: Listener) => void;
  $unsubscribe: (listener: Listener) => void;
} & { [K in keyof S]: S[K] } & { [K in keyof ActionType<A, S, C>]: ActionType<A, S, C>[K] } & {
  [K in keyof ComputedType<C, S>]: ReturnType<ComputedType<C, S>[K]>;
};

export type ActionType<A, S, C> = A & ThisType<A & UnwrapRef<S> & WithGetters<C>>;

type ComputedType<C, S> = {
  [K in keyof C]: AddFirstArg<C[K], S>;
} & ThisType<UnwrapRef<S> & WithGetters<C>>;
type AddFirstArg<T, S> = T extends (...args: infer A) => infer R
  ? (state: S, ...args: A) => R
  : T extends () => infer R
    ? (state: S) => R
    : T;

// In Getter function, make this.xx can refer to other getters
export type WithGetters<G> = {
  readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R ? R : UnwrapRef<G[k]>;
};

type Listener = (change: any) => void;

// Filter state properties
export type FilterState<T extends Record<string, unknown>> = {
  [K in FilterStateProperties<T>]: UnwrapRef<T[K]>;
};
type FilterStateProperties<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends ComputedImpl
    ? never
    : T[K] extends RefType
      ? K
      : T[K] extends Record<any, unknown> // Reactive类型
        ? K
        : never;
}[keyof T];

// Filter action properties
export type FilterAction<T extends Record<string, unknown>> = {
  [K in FilterFunctionProperties<T>]: T[K] extends AnyFunction ? T[K] : never;
};
type FilterFunctionProperties<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends AnyFunction ? K : never;
}[keyof T];

// Filter computed properties
export type FilterComputed<T extends Record<string, unknown>> = {
  [K in FilterComputedProperties<T>]: T[K] extends ComputedImpl<infer T> ? (T extends AnyFunction ? T : never) : never;
};
type FilterComputedProperties<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends ComputedImpl ? K : never;
}[keyof T];

export type StoreToRefsReturn<S extends Record<string, unknown>, C extends Record<string, AnyFunction>> = {
  [K in keyof S]: RefType<S[K]>;
} & {
  [K in keyof ComputedType<C, S>]: Readonly<RefType<ReturnType<ComputedType<C, S>[K]>>>;
};
