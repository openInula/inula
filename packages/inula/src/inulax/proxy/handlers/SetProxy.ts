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

import { getObserver } from '../ProxyHandler';
import { KeyTypes } from '../../Constants';
import { getValOrProxy, registerListener } from './HandlerUtils';
import {
  baseGetFun,
  baseForEach,
  baseAddFunOfSet,
  baseHasFun,
  baseDeleteFun,
  baseClearFun,
} from './BaseCollectionHandler';
import { CurrentListener, Listeners } from '../../types/ProxyTypes';

export function createSetProxy<T extends Set<any>>(rawObj: T, listener: CurrentListener): ProxyHandler<T> {
  const listeners: Listeners = [];
  // 因为rawObj是Set类型，里面存放的是proxy对象，所以需要一个map来存放真实的对象和proxy对象的映射关系
  const valProxies = new Map();

  function add(rawObj: T, value: any): Record<string, any> {
    return baseAddFunOfSet(rawObj, value, listener, listeners, 'Set', valProxies);
  }

  function has(rawObj: T, value: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(value);

    return baseHasFun(rawObj, value, valProxies);
  }

  function deleteFun(rawObj: T, value: any) {
    return baseDeleteFun(rawObj, value, 'Set', valProxies);
  }

  function clear(rawObj: T) {
    baseClearFun(rawObj, valProxies, 'Set');
  }

  const handler = {
    get,
    add,
    delete: deleteFun,
    has,
    clear,
    forEach,
    forOf,
    entries,
    keys,
    values,
    [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']: forOf,
  };

  function get(rawObj: T, key: any, receiver: any): any {
    return baseGetFun(rawObj, key, receiver, listeners, handler, 'Set');
  }

  function wrapIterator(rawObj: T, rawIt: IterableIterator<any>) {
    const observer = getObserver(rawObj);
    observer.useProp(KeyTypes.COLLECTION_CHANGE);

    return {
      next() {
        const { value, done } = rawIt.next();
        if (!done) {
          observer.useProp(KeyTypes.COLLECTION_CHANGE);
        }
        return { value: getValOrProxy('valueChange', false, value, rawObj, listener, listeners), done };
      },
      // 判断Symbol类型，兼容IE
      [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']() {
        return this;
      },
    };
  }

  function keys(rawObj: T) {
    return wrapIterator(rawObj, rawObj.keys());
  }

  function values(rawObj: T) {
    return wrapIterator(rawObj, rawObj.values());
  }

  function entries(rawObj: T) {
    return wrapIterator(rawObj, rawObj.entries());
  }

  function forOf(rawObj: T) {
    return wrapIterator(rawObj, rawObj.values());
  }

  function forEach(rawObj: T, callback: (valProxy: any, keyProxy: any, rawObj: any) => void) {
    baseForEach(rawObj, callback, listener, listeners);
  }

  registerListener(rawObj, listener, listeners);

  return new Proxy(rawObj, handler);
}
