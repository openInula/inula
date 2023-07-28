/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { isSame, isValidIntegerKey } from '../../CommonUtils';
import { resolveMutation } from '../../CommonUtils';
import { isPanelActive } from '../../devtools';
import { OBSERVER_KEY, RAW_VALUE } from '../../Constants';

function set(rawObj: any[], key: string, value: any, receiver: any) {
  const oldValue = rawObj[key];
  const oldLength = rawObj.length;
  const newValue = value;

  const oldArray = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  const newLength = rawObj.length;
  const observer = getObserver(rawObj);

  const mutation = isPanelActive() ? resolveMutation(oldArray, rawObj) : resolveMutation(null, rawObj);

  if (!isSame(newValue, oldValue)) {
    // 值不一样，触发监听器
    if (observer.watchers?.[key]) {
      observer.watchers[key].forEach(cb => {
        cb(key, oldValue, newValue, mutation);
      });
    }

    // 触发属性变化
    observer.setProp(key, mutation);
  }

  if (oldLength !== newLength) {
    // 触发数组的大小变化
    observer.setProp('length', mutation);
  }

  return ret;
}

export function createArrayProxy(rawObj: any[], listener: { current: (...args) => any }): any[] {
  let listeners = [] as ((...args) => void)[];

  function objectGet(rawObj: object, key: string | symbol, receiver: any, singleLevel = false): any {
    // The observer object of symbol ('_inulaObserver') cannot be accessed from Proxy to prevent errors caused by clonedeep.
    if (key === OBSERVER_KEY) {
      return undefined;
    }

    const observer = getObserver(rawObj);

    if (key === 'watch') {
      return (prop, handler: (key: string, oldValue: any, newValue: any) => void) => {
        if (!observer.watchers[prop]) {
          observer.watchers[prop] = [] as ((key: string, oldValue: any, newValue: any) => void)[];
        }
        observer.watchers[prop].push(handler);
        return () => {
          observer.watchers[prop] = observer.watchers[prop].filter(cb => cb !== handler);
        };
      };
    }

    if (key === 'addListener') {
      return listener => {
        listeners.push(listener);
      };
    }

    if (key === 'removeListener') {
      return listener => {
        listeners = listeners.filter(item => item != listener);
      };
    }

    observer.useProp(key);

    const value = Reflect.get(rawObj, key, receiver);

    // 对于prototype不做代理
    if (key !== 'prototype') {
      // 对于value也需要进一步代理
      const valProxy = singleLevel
        ? value
        : createProxy(value, {
            current: change => {
              if (!change.parents) change.parents = [];
              change.parents.push(rawObj);
              let mutation = resolveMutation(
                { ...rawObj, [key]: change.mutation.from },
                { ...rawObj, [key]: change.mutation.to }
              );
              listener.current(mutation);
              listeners.forEach(lst => lst(mutation));
            },
          },
          hookObserverMap.get(rawObj)
        );

      return valProxy;
    }

    return value;
  }

  function get(rawObj: any[], key: string, receiver: any) {
    if (key === 'watch') {
      const observer = getObserver(rawObj);

      return (prop: any, handler: (key: string, oldValue: any, newValue: any) => void) => {
        if (!observer.watchers[prop]) {
          observer.watchers[prop] = [] as ((key: string, oldValue: any, newValue: any) => void)[];
        }
        observer.watchers[prop].push(handler);
        return () => {
          observer.watchers[prop] = observer.watchers[prop].filter(cb => cb !== handler);
        };
      };
    }

    if (isValidIntegerKey(key) || key === 'length') {
      return objectGet(rawObj, key, receiver);
    }

    if (key === RAW_VALUE) {
      return rawObj;
    }

    return Reflect.get(rawObj, key, receiver);
  }

  const handle = {
    get,
    set,
  };

  getObserver(rawObj).addListener(change => {
    if (!change.parents) change.parents = [];
    change.parents.push(rawObj);
    listener.current(change);
    listeners.forEach(lst => lst(change));
  });

  return new Proxy(rawObj, handle);
}
