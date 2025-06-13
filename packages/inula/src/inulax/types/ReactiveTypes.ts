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

import { ShallowRef } from '../reactive/Ref';
import { FnType, ObjectType } from './ProxyTypes';

export interface RefType<T = any> {
  value: T;
}

export type MaybeRef<T = any> = T | RefType<T>;

export type UnwrapRef<T> =
  T extends ShallowRef<infer V> ? V : T extends RefType<infer V> ? ReactiveRet<V> : ReactiveRet<T>;

type BaseTypes = string | number | boolean;

export type ReactiveRet<T> = T extends FnType | BaseTypes | RefType
  ? T
  : T extends Map<infer K, infer V>
    ? Map<K, ReactiveRet<V>> & UnwrapRef<Omit<T, keyof Map<any, any>>>
    : T extends WeakMap<infer K, infer V>
      ? WeakMap<K, ReactiveRet<V>> & UnwrapRef<Omit<T, keyof WeakMap<any, any>>>
      : T extends Set<infer V>
        ? Set<ReactiveRet<V>> & UnwrapRef<Omit<T, keyof Set<any>>>
        : T extends WeakSet<infer V>
          ? WeakSet<ReactiveRet<V>> & UnwrapRef<Omit<T, keyof WeakSet<any>>>
          : T extends ReadonlyArray<any>
            ? { [K in keyof T]: ReactiveRet<T[K]> }
            : T extends ObjectType
              ? {
                  [P in keyof T]: P extends symbol ? T[P] : UnwrapRef<T[P]>;
                }
              : T;

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;

export type ToRef<T> = IfAny<T, RefType<T>, [T] extends [RefType] ? T : RefType<T>>;
export type ToRefs<T = any> = {
  [K in keyof T]: ToRef<T[K]>;
};

export declare const RawSymbol: unique symbol;
export type Raw<T> = T & { [RawSymbol]?: true };
