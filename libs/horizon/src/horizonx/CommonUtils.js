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

export function isObject(obj) {
  const type = typeof obj;
  return obj != null && (type === 'object' || type === 'function');
}

export function isSet(obj) {
  return obj != null && (Object.prototype.toString.call(obj) === '[object Set]' || obj.constructor === Set);
}

export function isWeakSet(obj) {
  return obj != null && (Object.prototype.toString.call(obj) === '[object WeakSet]' || obj.constructor === WeakSet);
}

export function isMap(obj) {
  return obj != null && (Object.prototype.toString.call(obj) === '[object Map]' || obj.constructor === Map);
}

export function isWeakMap(obj) {
  return obj != null && (Object.prototype.toString.call(obj) === '[object WeakMap]' || obj.constructor === WeakMap);
}

export function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isCollection(obj) {
  return isSet(obj) || isWeakSet(obj) || isMap(obj) || isWeakMap(obj);
}

export function isString(obj) {
  return typeof obj === 'string';
}

export function isValidIntegerKey(key) {
  return isString(key) && key !== 'NaN' && key[0] !== '-' && String(parseInt(key, 10)) === key;
}

export const noop = () => {};

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
