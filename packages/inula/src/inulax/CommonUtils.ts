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

import { KeyTypes, ReactiveFlags } from './Constants';
import { Mutation } from './types/ProxyTypes';

export function isObject(obj: any): boolean {
  const type = typeof obj;
  return obj !== null && obj !== undefined && type === 'object';
}

export function isSet(obj: any): boolean {
  return obj !== null && obj !== undefined && Object.prototype.toString.call(obj) === '[object Set]';
}

export function isWeakSet(obj: any): boolean {
  return obj !== null && obj !== undefined && Object.prototype.toString.call(obj) === '[object WeakSet]';
}

export function isMap(obj: any): boolean {
  return obj !== null && obj !== undefined && Object.prototype.toString.call(obj) === '[object Map]';
}

export function isWeakMap(obj: any): boolean {
  return obj !== null && obj !== undefined && Object.prototype.toString.call(obj) === '[object WeakMap]';
}

export function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isPlainObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isCollection(obj: any): boolean {
  return isSet(obj) || isWeakSet(obj) || isMap(obj) || isWeakMap(obj);
}

const proxyObjectTypes = ['Object', 'Array', 'Map', 'Set', 'WeakMap', 'WeakSet'];
export function isCanProxyObject(obj: any): boolean {
  return proxyObjectTypes.includes(Object.prototype.toString.call(obj).slice(8, -1));
}

export function isString(obj: any): boolean {
  return typeof obj === 'string';
}

// key是有效的正整数字的字符串
export function isValidIntegerKey(key: any): boolean {
  return isString(key) && key !== 'NaN' && key[0] !== '-' && String(parseInt(key, 10)) === key;
}

export function isPromise(obj: any): boolean {
  return isObject(obj) && typeof obj.then === 'function';
}

export function isSame(obj1: unknown, obj2: unknown) {
  return Object.is(obj1, obj2);
}

export function getDetailedType(val: any) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (isPromise(val)) return 'promise';
  if (isArray(val)) return 'array';
  if (isWeakMap(val)) return 'weakMap';
  if (isMap(val)) return 'map';
  if (isWeakSet(val)) return 'weakSet';
  if (isSet(val)) return 'set';
  return typeof val;
}

export function resolveMutation<T extends { length?: number; _type?: string; entries?: any; values?: any }>(
  from: T,
  to: T
): Mutation<T> {
  return { mutation: true, from, to };
}

export function isShallow(value: unknown): boolean {
  return !!(value && value[ReactiveFlags.IS_SHALLOW]);
}

export function isReactive(value: unknown) {
  return !!(value && !!value[KeyTypes.RAW_VALUE]);
}

export function isReadonly(value: unknown): boolean {
  return !!(value && value[ReactiveFlags.IS_READONLY]);
}
