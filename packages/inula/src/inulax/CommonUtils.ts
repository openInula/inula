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
export function isObject(obj: any): boolean {
  const type = typeof obj;
  return (obj !== null || obj !== undefined) && (type === 'object' || type === 'function');
}

export function isSet(obj: any): boolean {
  return (
    (obj !== null || obj !== undefined) &&
    (Object.prototype.toString.call(obj) === '[object Set]' || obj.constructor === Set)
  );
}

export function isWeakSet(obj: any): boolean {
  return (
    (obj !== null || obj !== undefined) &&
    (Object.prototype.toString.call(obj) === '[object WeakSet]' || obj.constructor === WeakSet)
  );
}

export function isMap(obj: any): boolean {
  return (
    (obj !== null || obj !== undefined) &&
    (Object.prototype.toString.call(obj) === '[object Map]' || obj.constructor === Map)
  );
}

export function isWeakMap(obj: any): boolean {
  return (
    (obj !== null || obj !== undefined) &&
    (Object.prototype.toString.call(obj) === '[object WeakMap]' || obj.constructor === WeakMap)
  );
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

export function isSame(obj1: unknown, obj2: unknown) {
  // 如果两个对象是同一个引用，直接返回true
  if (obj1 === obj2) {
    return true;
  }
  if (kindOf(obj1) !== kindOf(obj2)) {
    return false;
  }
  // 此时obj1和obj2类型一致，若都为undefined或null返回true，但也有可能此时为一个对象和null，这种情况直接比较对象
  // typeof null === 'object'
  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    return obj1 === obj2;
  }
  // 如果两个对象都是基本类型，比较它们的值是否相等
  if (kindOf(obj1) !== 'object') {
    return obj1 === obj2;
  }
  // 如果两个对象都是数组，比较它们的长度是否相等，然后递归比较每个元素是否相等
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!isSame(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }
  // 如果两个对象都是普通对象，比较它们的属性数量是否相等，然后递归比较每个属性的值是否相等
  if (kindOf(obj1) === 'object') {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let i = 0; i < keys1.length; i++) {
      if (!isSame(obj1[keys1[i]], obj2[keys2[i]])) {
        return false;
      }
    }
    return true;
  }
  // 其他情况，返回false
  return false;
}

export function kindOf(object: unknown): string {
  const valType = Object.prototype.toString.call(object);
  return valType.slice(8, -1).toLowerCase();
}

export function getDetailedType(val: any): string {
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

export function resolveMutation(from, to) {
  if (getDetailedType(from) !== getDetailedType(to)) {
    return { mutation: true, from, to };
  }

  switch (getDetailedType(from)) {
    case 'array': {
      const len = Math.max(from.length, to.length);
      const res: any[] = [];
      let found = false;
      for (let i = 0; i < len; i++) {
        if (from.length <= i) {
          res[i] = { mutation: true, to: to[i] };
          found = true;
        } else if (to.length <= i) {
          res[i] = { mutation: true, from: from[i] };
          found = true;
        } else {
          res[i] = resolveMutation(from[i], to[i]);
          if (res[i].mutation) found = true;
        }
      }

      // need to resolve shifts
      return { mutation: found, items: res, from, to };
    }

    case 'object': {
      if (from._type && from._type === to._type) {
        if (from._type === 'Map') {
          const entries = resolveMutation(from.entries, to.entries);
          return {
            mutation: entries.items.some(item => item.mutation),
            from,
            to,
            entries: entries.items,
          };
        }

        if (from._type === 'Set') {
          const values = resolveMutation(from.values, to.values);
          return { mutation: values.items.some(item => item.mutation), from, to, values: values.items };
        }
      }

      const keys = Object.keys({ ...from, ...to }).filter(key => key !== '_inulaObserver');
      const res = {};
      let found = false;
      keys.forEach(key => {
        if (!(key in from)) {
          res[key] = { mutation: true, to: to[key] };
          found = true;
          return;
        }

        if (!(key in to)) {
          res[key] = { mutation: true, from: from[key] };
          found = true;
          return;
        }
        res[key] = resolveMutation(from[key], to[key]);
        if (res[key].mutation) found = true;
      });
      return { mutation: found, attributes: res, from, to };
    }

    default: {
      if (from === to) return { mutation: false };

      return { mutation: true, from, to };
    }
  }
}

export function omit(obj, ...attrs) {
  const res = { ...obj };
  attrs.forEach(attr => delete res[attr]);
  return res;
}

export function getRandomStr(): string {
  return Math.random().toString(36).substring(8);
}
