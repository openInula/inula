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

import utils from '../commonUtils/utils';

// 获取当前上下文对象
function getContextObject(): any {
  if (typeof globalThis !== 'undefined') return globalThis;
  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : global;
}

// 合并多个对象为一个新对象：1.如果有多个对象的属性名相同，则后面的对象的属性值会覆盖前面的对象的属性值；2.如果一个对象的属性值是另一个对象，则会递归合并两个对象的属性值；3.如果一个对象的属性值是数组，则会拷贝一个新的数组，防止修改原数组
function deepMerge(...objects: Record<string, any>[]): Record<string, any> {
  const context = getContextObject();
  const { caseless } = context || {};
  const result: any = {};

  const assignValue = (val: any, key: any) => {
    const targetKey = caseless ? utils.getObjectKey(result, key) || key : key;
    if (utils.checkPlainObject(result[targetKey]) && utils.checkPlainObject(val)) {
      result[targetKey] = deepMerge(result[targetKey], val);
    } else if (utils.checkPlainObject(val)) {
      result[targetKey] = deepMerge({}, val);
    } else if (Array.isArray(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };

  for (const obj of objects) {
    obj && utils.forEach(obj, assignValue);
  }
  return result;
}

export default deepMerge;
