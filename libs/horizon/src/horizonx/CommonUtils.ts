/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

export function isObject(obj: any): boolean {
  const type = typeof obj;
  return (obj !== null || obj !== undefined) && (type === 'object' || type === 'function');
}

export function isSet(obj: any): boolean {
  return (obj !== null || obj !== undefined) && (Object.prototype.toString.call(obj) === '[object Set]' || obj.constructor === Set);
}

export function isWeakSet(obj: any): boolean {
  return (obj !== null || obj !== undefined) && (Object.prototype.toString.call(obj) === '[object WeakSet]' || obj.constructor === WeakSet);
}

export function isMap(obj: any): boolean {
  return (obj !== null || obj !== undefined) && (Object.prototype.toString.call(obj) === '[object Map]' || obj.constructor === Map);
}

export function isWeakMap(obj: any): boolean {
  return (obj !== null || obj !== undefined) && (Object.prototype.toString.call(obj) === '[object WeakMap]' || obj.constructor === WeakMap);
}

export function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isCollection(obj: any): boolean {
  return isSet(obj) || isWeakSet(obj) || isMap(obj) || isWeakMap(obj);
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

export function isSame(x, y) {
  if (!(typeof Object.is === 'function')) {
    if (x === y) {
      // +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // NaN == NaN
      return x !== x && y !== y;
    }
  } else {
    return Object.is(x, y);
  }
}
