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

import { isSame, resolveMutation } from '../../CommonUtils';
import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { OBSERVER_KEY, RAW_VALUE } from '../../Constants';
import { isPanelActive } from '../../devtools';

function set(rawObj: object, key: string, value: any, receiver: any): boolean {
  const oldObject = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;
  const observer = getObserver(rawObj);

  const oldValue = rawObj[key];
  const newValue = value;

  const ret = Reflect.set(rawObj, key, newValue, receiver);
  const mutation = isPanelActive() ? resolveMutation(oldObject, rawObj) : resolveMutation(null, rawObj);

  if (!isSame(newValue, oldValue)) {
    if (observer.watchers?.[key]) {
      observer.watchers[key].forEach(cb => {
        cb(key, oldValue, newValue, mutation);
      });
    }
    observer.setProp(key, mutation);
  }
  return ret;
}

export function createObjectProxy<T extends object>(
  rawObj: T,
  listener: { current: (...args) => any },
  singleLevel = false
): ProxyHandler<T> {
  let listeners = [] as ((...args) => void)[];

  function get(rawObj: object, key: string | symbol, receiver: any): any {
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

    if (key === RAW_VALUE) {
      return rawObj;
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
              listener.current({ ...change, mutation });
              listeners.forEach(lst => lst({ ...change, mutation }));
            },
          },
          hookObserverMap.get(rawObj)
        );

      return valProxy;
    }

    return value;
  }

  const proxy = new Proxy(rawObj, {
    get,
    set,
  });

  getObserver(rawObj).addListener(change => {
    if (!change.parents) change.parents = [];
    change.parents.push(rawObj);
    listener.current(change);
    listeners.forEach(lst => lst(change));
  });

  return proxy;
}
