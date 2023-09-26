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

import { isArray } from '../../inulax/CommonUtils';
import { getOrCreateChildProxy, getRNodeVal, setRNodeVal, trackReactiveData } from '../RNode';
import { RNode, ProxyRNode } from '../types';

const GET = 'get';
const SET = 'set';
const READ = 'read';
const DELETE = 'delete';
const ONCHANGE = 'onChange';
export const GET_R_NODE = '$$getRNode';
const PROTOTYPE = 'prototype';

// 数组的修改方法
const MODIFY_ARR_FNS = new Set<string | symbol>([
  'push',
  'pop',
  'splice',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'fill',
  'from',
  'copyWithin',
]);

// 数组的遍历方法
const LOOP_ARR_FNS = new Set<string | symbol>(['forEach', 'map', 'every', 'some', 'filter', 'join']);

export function createProxy<T extends any>(proxyNode: RNode): ProxyRNode<T> {
  return new Proxy(proxyNode, {
    get,
    set,
  });
}

const GetFns: Record<string | symbol, (args: RNode) => any> = {
  [GET]: getFn,
  [READ]: readFn,
  [DELETE]: deleteFn,
  [ONCHANGE]: onChangeFn,
};

function get(rNode: RNode, key: string | symbol): any {
  // 处理get,read,delete,onchange方法
  const fn = GetFns[key];
  if (fn && typeof fn === 'function') {
    return () => fn(rNode);
  }

  // 调用set()方法
  if (key === SET) {
    return function (val: any) {
      setRNodeVal(rNode, val, true, false);
    };
  }

  if (key === GET_R_NODE) {
    return rNode;
  }

  const rawObj = getRNodeVal(rNode);

  // const value = rawObj !== undefined ? Reflect.get(rawObj, key) : rawObj;
  const value = rawObj !== undefined ? rawObj[key] : rawObj;

  // 对于prototype不做代理
  if (key === PROTOTYPE) {
    return value;
  }

  if (isArray(rawObj) && key === 'length') {
    // 标记依赖
    trackReactiveData(rNode);
    return value;
  }

  // 处理数组的方法
  if (typeof value === 'function') {
    if (isArray(rawObj)) {
      // 处理数组的修改方法
      if (MODIFY_ARR_FNS.has(key)) {
        return (...args: any[]) => {
          // 调用数组方法的时候，前后是相同的引用，所以需要先浅拷贝数组,并在浅拷贝的数组上进行操作
          const value = rawObj.slice();
          const ret = value[key](...args);
          // 调用了数组的修改方法，默认值有变化
          setRNodeVal(rNode, value, true, true);

          return ret;
        };
      } else if (LOOP_ARR_FNS.has(key)) { // 处理数组的遍历方法
        // 标记被使用了
        trackReactiveData(rNode);

        return function (callBackFn: any, thisArg?: any) {
          function cb(_: any, index: number, array: any[]) {
            const idx = String(index);
            const itemProxy = getOrCreateChildProxy(array[idx], rNode, idx);
            return callBackFn(itemProxy, index, array);
          }

          return rawObj[key](cb, thisArg);
        };
      }
    }
    return value.bind(rawObj);
  }

  return getOrCreateChildProxy(value, rNode, key);
}

function set(proxyNode: any, key: string, value: any, receiver: any): boolean {
  return true;
}

// get()调用的处理
function getFn(node: RNode) {
  trackReactiveData(node);
  return readFn(node);
}

function readFn(node: RNode) {
  return getRNodeVal(node);
}

// delete()调用的处理
function deleteFn() {}

// onChange()调用的处理
function onChangeFn() {}
