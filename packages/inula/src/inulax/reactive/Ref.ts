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

import { isArray, isObject, isSame, isShallow } from '../CommonUtils';
import { toRaw } from './Reactive';
import { Observer, ObserverType } from '../proxy/Observer';
import { OBSERVER_KEY, ReactiveFlags } from '../Constants';
import { IfAny, MaybeRef, RefType, ToRef, ToRefs, UnwrapRef } from '../types/ReactiveTypes';
import { useRef } from '../../renderer/hooks/HookExternal';
import { createProxy } from '../proxy/ProxyHandler';

export function ref<T = any>(): RefType<T | undefined>;
export function ref<T>(value: T): RefType<UnwrapRef<T>>;
export function ref(value?: unknown) {
  return createRef(value, false);
}

export function useReference<T = any>(): RefType<T | undefined>;
export function useReference<T>(value: T): RefType<UnwrapRef<T>>;
export function useReference(value?: unknown) {
  const objRef = useRef<null | RefType>(null);
  if (objRef.current === null) {
    objRef.current = createRef(value, false);
  }

  return objRef.current;
}

function createRef(rawValue: unknown, isShallow: boolean): RefType {
  if (isRef(rawValue)) {
    return rawValue;
  }

  return new RefImpl(rawValue, isShallow);
}

class RefImpl<T> {
  private _value: T;
  private _rawValue: T;

  observer: Observer = new Observer(ObserverType.REF);
  readonly _isRef = true;
  _isShallow = false;

  constructor(value: T, isShallow: boolean) {
    this._isShallow = isShallow;
    this._rawValue = isShallow ? value : toRaw(value);
    this._value = isShallow ? value : toReactive(value);
  }

  get value() {
    this.observer.useProp('value');
    return this._value;
  }

  set value(newVal) {
    const useDirectValue = this._isShallow || isShallow(newVal);
    newVal = useDirectValue ? newVal : toRaw(newVal);
    if (!isSame(newVal, this._rawValue)) {
      const mutation = { mutation: true, from: this._rawValue, to: newVal };
      this._rawValue = newVal;
      this._value = useDirectValue ? newVal : toReactive(newVal);
      this.observer.setProp('value', mutation);
    }
  }

  get [OBSERVER_KEY]() {
    return this.observer;
  }
}

export function isRef<T>(ref: MaybeRef<T>): ref is RefType<T>;
export function isRef(ref: any): ref is RefType {
  return Boolean(ref && ref[ReactiveFlags.IS_REF]);
}

export function toReactive<T extends unknown>(value: T): T {
  return isObject(value) ? createProxy(value) : value;
}

export function unref<T>(ref: MaybeRef<T>): T {
  return isRef(ref) ? ref.value : ref;
}

declare const ShallowRefMarker: unique symbol;
export type ShallowRef<T = any> = RefType<T> & { [ShallowRefMarker]?: true };

export function shallowRef<T>(
  value: T
): RefType extends T ? (T extends RefType ? IfAny<T, ShallowRef<T>, T> : ShallowRef<T>) : ShallowRef<T>;
export function shallowRef<T = any>(): ShallowRef<T | undefined>;
export function shallowRef(value?: unknown) {
  return createRef(value, true);
}

export function toRef<T>(
  value: T
): T extends () => infer R ? Readonly<RefType<R>> : T extends RefType ? T : RefType<UnwrapRef<T>>;
export function toRef<T extends Record<string, any>, K extends keyof T>(object: T, key: K): ToRef<T[K]>;
export function toRef<T extends Record<string, any>, K extends keyof T>(
  object: T,
  key: K,
  defaultValue: T[K]
): ToRef<Exclude<T[K], undefined>>;
export function toRef(source: Record<string, any> | MaybeRef, key?: string, defaultValue?: unknown): RefType {
  if (isRef(source)) {
    return source;
  } else if (typeof source === 'function') {
    return new GetterRefImpl(source) as any;
  } else if (isObject(source) && arguments.length > 1) {
    return propertyToRef(source, key!, defaultValue);
  } else {
    return ref(source);
  }
}

class GetterRefImpl<T> {
  public readonly _isRef = true;
  public readonly _isReadonly = true;
  private readonly _getter: () => T;

  constructor(getter: () => T) {
    this._getter = getter;
  }

  get value() {
    return this._getter();
  }
}

function propertyToRef(source: Record<string, any>, key: string, defaultValue?: unknown) {
  const val = source[key];
  return isRef(val) ? val : (new ObjectRefImpl(source, key, defaultValue) as any);
}

class ObjectRefImpl<T extends Record<string, any>, K extends keyof T> {
  public readonly _isRef = true;
  private readonly _object: T;
  private readonly _key: K;
  private readonly _defaultValue?: T[K];

  constructor(object: T, key: K, defaultValue?: T[K]) {
    this._object = object;
    this._key = key;
    this._defaultValue = defaultValue;
  }

  get value() {
    const val = this._object[this._key];
    return val === undefined ? this._defaultValue! : val;
  }

  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

export function toRefs<T extends Record<string, any>>(object: T): ToRefs<T> {
  const ret: any = isArray(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}
