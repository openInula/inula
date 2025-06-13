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

import { createProxy, getObserver, reduxAdapterMap } from '../ProxyHandler';
import { isSame } from '../../CommonUtils';
import { resolveMutation } from '../../CommonUtils';
import { KeyTypes } from '../../Constants';
import { getValOrProxy, registerListener } from './HandlerUtils';
import { baseDeleteFun, baseHasFun, baseForEach, baseGetFun, baseClearFun } from './BaseCollectionHandler';
import { CurrentListener, Listeners, ObjectType } from '../../types/ProxyTypes';

type IteratorTypes = 'keys' | 'values' | 'entries';

export function createMapProxy<T extends Map<any, any>>(rawObj: T, listener: CurrentListener): ProxyHandler<T> {
  const listeners: Listeners = [];
  // 场景：let obj = {}; map.set(obj, val);
  // 满足两个UT：1、map.has(Array.from(map.keys())[0])为true; 2、map.has(obj)为true;
  const keyProxies = new Map();

  function getFun(rawObj: T, key: any): any {
    const keyProxy = rawObj.has(key) ? key : keyProxies.get(key);
    if (!keyProxy) return;

    const observer = getObserver(rawObj);
    observer.useProp(key);

    const value = rawObj.get(keyProxy);

    return getValOrProxy(key, false, value, rawObj, listener, listeners);
  }

  function get(rawObj: T, key: any, receiver: any): any {
    return baseGetFun(rawObj, key, receiver, listeners, handler, 'Map', getFun);
  }

  // Map的set方法
  function set(rawObj: T, key: any, value: any): any {
    let keyProxy;
    let oldValue;
    if (baseHasFun(rawObj, key, keyProxies)) {
      keyProxy = keyProxies.has(key) ? keyProxies.get(key) : key;
      oldValue = rawObj.get(keyProxy);
      if (isSame(value, oldValue)) {
        return;
      }
    } else {
      keyProxy = getValOrProxy('keyChange', false, key, rawObj, listener, listeners);
      keyProxies.set(key, keyProxy);
    }

    const oldValues = [...Array.from(rawObj.entries())];

    rawObj.set(keyProxy, value);
    const observer = getObserver(rawObj);
    const mutation = resolveMutation(
      {
        _type: 'Map',
        entries: oldValues,
      },
      {
        _type: 'Map',
        entries: Array.from(rawObj.entries()),
      }
    );
    observer.setProp(KeyTypes.COLLECTION_CHANGE, mutation);
    observer.setProp(key, mutation, oldValue, value);

    return rawObj;
  }

  function has(rawObj: T, key: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(key);

    return baseHasFun(rawObj, key, keyProxies);
  }

  function clear(rawObj: T) {
    baseClearFun(rawObj, keyProxies, 'Map');
  }

  function deleteFun(rawObj: T, key: any) {
    return baseDeleteFun(rawObj, key, 'Map', keyProxies);
  }

  function forEach(rawObj: T, callback: (valProxy: any, keyProxy: any, rawObj: any) => void) {
    baseForEach(rawObj, callback, listener, listeners);
  }

  function wrapIterator(rawObj: T, rawIt: IterableIterator<any>, type: IteratorTypes) {
    const observer = getObserver(rawObj);
    const isReduxAdapter = reduxAdapterMap.get(rawObj);
    observer.useProp(KeyTypes.COLLECTION_CHANGE);

    return {
      next() {
        const { value, done } = rawIt.next();
        if (done) {
          return {
            value: getValOrProxy(value, false, value, rawObj, listener, listeners),
            done,
          };
        }

        observer.useProp(KeyTypes.COLLECTION_CHANGE);
        let newVal;
        if (type === 'entries') {
          //ENTRY CHANGED
          newVal = [
            createProxy(
              value[0],
              {
                current: change => {
                  if (!change.parents) change.parents = [];
                  change.parents.push(rawObj);
                  const mutation = resolveMutation(
                    { ...rawObj, ['itemChange']: { key: change.mutation.from, value: value[1] } },
                    { ...rawObj, ['itemChange']: { key: change.mutation.to, value: value[1] } }
                  );
                  listener.current({ ...change, mutation });
                  listeners.forEach(lst => lst({ ...change, mutation }));
                },
              },
              false,
              isReduxAdapter
            ),
            createProxy(
              value[1],
              {
                current: change => {
                  if (!change.parents) change.parents = [];
                  change.parents.push(rawObj);
                  const mutation = resolveMutation(
                    { ...rawObj, item: { key: value[0], value: change.mutation.from } },
                    { ...rawObj, item: { key: value[0], value: change.mutation.to } }
                  );
                  listener.current({ ...change, mutation });
                  listeners.forEach(lst => lst({ ...change, mutation }));
                },
              },
              false,
              isReduxAdapter
            ),
          ];
        } else {
          // SINGLE VALUE CHANGED
          newVal = getValOrProxy(type === 'keys' ? 'key' : 'value', false, value, rawObj, listener, listeners);
        }

        return { value: newVal, done };
      },
      // 判断Symbol类型，兼容IE
      [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']() {
        return this;
      },
    };
  }

  function keys(rawObj: T) {
    return wrapIterator(rawObj, rawObj.keys(), 'keys');
  }

  function values(rawObj: T) {
    return wrapIterator(rawObj, rawObj.values(), 'values');
  }

  function entries(rawObj: T) {
    return wrapIterator(rawObj, rawObj.entries(), 'entries');
  }

  function forOf(rawObj: T) {
    return wrapIterator(rawObj, rawObj.entries(), 'entries');
  }

  const handler = {
    get,
    set,
    delete: deleteFun,
    clear,
    has,
    entries,
    forEach,
    keys,
    values,
    // 判断Symbol类型，兼容IE
    [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']: forOf,
  };

  registerListener(rawObj, listener, listeners);

  return new Proxy(rawObj as ObjectType, handler);
}
