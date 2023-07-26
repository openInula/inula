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

import { resolveMutation } from '../../CommonUtils';
import { createProxy, getObserver, hookObserverMap } from '../ProxyHandler';
import { RAW_VALUE } from '../../Constants';

const COLLECTION_CHANGE = '_collectionChange';

export function createSetProxy<T extends object>(
  rawObj: T,
  listener: { current: (...args) => any },
  hookObserver = true
): ProxyHandler<T> {
  let listeners: ((mutation) => {})[] = [];
  let proxies = new WeakMap();

  // Set的add方法
  function add(rawObj: { add: (any) => void; has: (any) => boolean; values: () => any[] }, value: any): Object {
    if (!rawObj.has(proxies.get(value))) {
      const proxy = createProxy(value, {
          current: change => {
            if (!change.parents) change.parents = [];
            change.parents.push(rawObj);
            let mutation = resolveMutation(
              { ...rawObj, valueChange: change.mutation.from },
              { ...rawObj, valueChange: change.mutation.to }
            );
            listener.current({
              ...change,
              mutation,
            });
            listeners.forEach(lst =>
              lst({
                ...change,
                mutation,
              })
            );
          },
        },
        hookObserverMap.get(rawObj)
      );
      const oldValues = Array.from(rawObj.values());

      proxies.set(value, proxy);

      rawObj.add(proxies.get(value));

      const observer = getObserver(rawObj);
      const mutation = resolveMutation(
        {
          _type: 'Set',
          values: oldValues,
        },
        {
          _type: 'Set',
          values: Array.from(rawObj.values()),
        }
      );

      observer.setProp(value, mutation);
      observer.setProp(COLLECTION_CHANGE, mutation);
    }

    return rawObj;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function has(rawObj: { has: (string) => boolean }, value: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(value);

    return rawObj.has(proxies.get(value));
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function deleteFun(
    rawObj: { has: (key: any) => boolean; delete: (value: any) => void; values: () => any[] },
    value: any
  ) {
    const val = rawObj.has(proxies.get(value)) ? proxies.get(value) : value;
    if (rawObj.has(val)) {
      const oldValues = Array.from(rawObj.values());
      rawObj.delete(val);

      proxies.delete(value);

      const observer = getObserver(rawObj);
      const mutation = resolveMutation(
        {
          _type: 'Set',
          values: oldValues,
        },
        {
          _type: 'Set',
          values: Array.from(rawObj.values()),
        }
      );

      observer.setProp(value, mutation);
      observer.setProp(COLLECTION_CHANGE, mutation);

      return true;
    }

    return false;
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
  function size(rawObj: { size: number }) {
    const observer = getObserver(rawObj);
    observer.useProp(COLLECTION_CHANGE);
    return rawObj.size;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  function get(rawObj: { size: number }, key: any, receiver: any): any {
    if (Object.prototype.hasOwnProperty.call(handler, key)) {
      const value = Reflect.get(handler, key, receiver);
      return value.bind(null, rawObj);
    }

    if (key === 'size') {
      return size(rawObj);
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

    if (key === RAW_VALUE) {
      return rawObj;
    }

    return Reflect.get(rawObj, key, receiver);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function wrapIterator(rawObj: Object, rawIt: { next: () => { value: any; done: boolean } }) {
    const observer = getObserver(rawObj);
    const hookObserver = hookObserverMap.get(rawObj);
    observer.useProp(COLLECTION_CHANGE);

    return {
      next() {
        const currentListener = {
          current: change => {
            if (!change.parents) change.parents = [];
            change.parents.push(rawObj);
            let mutation = resolveMutation(
              { ...rawObj, valueChange: change.mutation.from },
              { ...rawObj, valueChange: change.mutation.to }
            );
            listener.current({
              ...change,
              mutation,
            });
            listeners.forEach(lst =>
              lst({
                ...change,
                mutation,
              })
            );
          },
        };
        const { value, done } = rawIt.next();
        if (done) {
          return { value: createProxy(value, currentListener, hookObserver), done };
        }

        observer.useProp(COLLECTION_CHANGE);

        let newVal;
        newVal = createProxy(value, currentListener, hookObserver);

        return { value: newVal, done };
      },
      // 判断Symbol类型，兼容IE
      [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']() {
        return this;
      },
    };
  }

  function keys(rawObj: { keys: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.keys());
  }

  function values(rawObj: { values: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.values());
  }

  function entries(rawObj: { entries: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.entries());
  }

  function forOf(rawObj: {
    entries: () => { next: () => { value: any; done: boolean } };
    values: () => { next: () => { value: any; done: boolean } };
  }) {
    const iterator = rawObj.values();
    return wrapIterator(rawObj, iterator);
  }

  function forEach(
    rawObj: { forEach: (callback: (value: any, key: any) => void) => void },
    callback: (valProxy: any, keyProxy: any, rawObj: any) => void
  ) {
    const observer = getObserver(rawObj);
    observer.useProp(COLLECTION_CHANGE);
    rawObj.forEach((value, key) => {
      const currentListener = {
        current: change => {
          if (!change.parents) change.parents = [];
          change.parents.push(rawObj);
          let mutation = resolveMutation(
            { ...rawObj, valueChange: change.mutation.from },
            { ...rawObj, valueChange: change.mutation.to }
          );
          listener.current({
            ...change,
            mutation,
          });
          listeners.forEach(lst =>
            lst({
              ...change,
              mutation,
            })
          );
        },
      };
      const valProxy = createProxy(value, currentListener, hookObserverMap.get(rawObj));
      const keyProxy = createProxy(key, currentListener, hookObserverMap.get(rawObj));
      // 最后一个参数要返回代理对象
      return callback(valProxy, keyProxy, rawObj);
    });
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
