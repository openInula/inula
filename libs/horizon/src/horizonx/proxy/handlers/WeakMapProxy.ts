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

import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { isSame } from '../../CommonUtils';
import { resolveMutation } from '../../CommonUtils';
import { isPanelActive } from '../../devtools';
import { RAW_VALUE } from '../../Constants';

const COLLECTION_CHANGE = '_collectionChange';

export function createWeakMapProxy(
  rawObj: Object,
  listener: { current: (...args) => any },
  hookObserver = true
): Object {
  let listeners: ((mutation) => {})[] = [];

  const handler = {
    get,
    set,
    add,
    delete: deleteFun,
    clear,
    has,
  };

  function getFun(rawObj: { get: (key: any) => any }, key: any) {
    const observer = getObserver(rawObj);
    observer.useProp(key);

    const value = rawObj.get(key);
    // 对于value也需要进一步代理
    const valProxy = createProxy(value, {
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

  function get(rawObj: { size: number }, key: any, receiver: any): any {
    if (key === 'get') {
      return getFun.bind(null, rawObj);
    }

    if (Object.prototype.hasOwnProperty.call(handler, key)) {
      const value = Reflect.get(handler, key, receiver);
      return value.bind(null, rawObj);
    }

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

    return Reflect.get(rawObj, key, receiver);
  }

  // Map的set方法
  function set(
    rawObj: { get: (key: any) => any; set: (key: any, value: any) => any; has: (key: any) => boolean },
    key: any,
    value: any
  ) {
    const oldValue = rawObj.get(key);
    const newValue = value;
    rawObj.set(key, newValue);
    const valChange = !isSame(newValue, oldValue);
    const observer = getObserver(rawObj);

    const mutation = isPanelActive() ? resolveMutation(oldValue, rawObj) : resolveMutation(null, rawObj);

    if (valChange || !rawObj.has(key)) {
      observer.setProp(COLLECTION_CHANGE, mutation);
    }

    if (valChange) {
      if (observer.watchers?.[key]) {
        observer.watchers[key].forEach(cb => {
          cb(key, oldValue, newValue, mutation);
        });
      }

      observer.setProp(key, mutation);
    }

    return rawObj;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Set的add方法
  function add(rawObj: { add: (any) => void; set: (string, any) => any; has: (any) => boolean }, value: any): Object {
    const oldCollection = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;
    if (!rawObj.has(value)) {
      rawObj.add(value);

      const observer = getObserver(rawObj);
      const mutation = isPanelActive()
        ? resolveMutation(oldCollection, rawObj)
        : { mutation: true, from: null, to: rawObj };
      observer.setProp(value, mutation);
      observer.setProp(COLLECTION_CHANGE, mutation);
    }

    return rawObj;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function has(rawObj: { has: (string) => boolean }, key: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(key);

    return rawObj.has(key);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function clear(rawObj: { size: number; clear: () => void }) {
    const oldSize = rawObj.size;
    rawObj.clear();

    if (oldSize > 0) {
      const observer = getObserver(rawObj);
      observer.allChange();
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function deleteFun(rawObj: { has: (key: any) => boolean; delete: (key: any) => void }, key: any) {
    const oldCollection = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;
    if (rawObj.has(key)) {
      rawObj.delete(key);

      const observer = getObserver(rawObj);
      const mutation = isPanelActive()
        ? resolveMutation(oldCollection, rawObj)
        : { mutation: true, from: null, to: rawObj };
      observer.setProp(key, mutation);
      observer.setProp(COLLECTION_CHANGE, mutation);

      return true;
    }

    return false;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  getObserver(rawObj).addListener(change => {
    if (!change.parents) change.parents = [];
    change.parents.push(rawObj);
    listener.current(change);
    listeners.forEach(lst => lst(change));
  });
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const boundHandler = {};
  Object.entries(handler).forEach(([id, val]) => {
    boundHandler[id] = (...args: any[]) => {
      return (val as any)(...args, hookObserver);
    };
  });
  return new Proxy(rawObj, { ...boundHandler });
}
