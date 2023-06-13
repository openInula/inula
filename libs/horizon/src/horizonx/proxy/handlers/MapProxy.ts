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

export function createMapProxy(
  rawObj: Object,
  listener: { current: (...args) => any },
  hookObserver = true
): Object {
  let listeners: ((mutation) => {})[] = [];
  let oldData: [any, any][] = [];
  let proxies = new Map();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function getFun(rawObj: { get: (key: any) => any; has: (key: any) => boolean }, key: any): any {
    const keyProxy = rawObj.has(key) ? key : proxies.get(key);
    if (!keyProxy) return;
    const observer = getObserver(rawObj);
    observer.useProp(key);
    const value = rawObj.get(keyProxy);

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
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Map的set方法
  function set(
    rawObj: {
      get: (key: any) => any;
      set: (key: any, value: any) => any;
      has: (key: any) => boolean;
      entries: () => [any, any][];
    },
    key: any,
    value: any
  ): any {
    if (rawObj.has(key) || rawObj.has(proxies.get(key))) {
      // VALUE CHANGE (whole value for selected key is changed)
      const oldValue = rawObj.get(proxies.get(key));
      if (isSame(value, oldValue)) return;
      rawObj.set(proxies.get(key), value);
      const mutation = isPanelActive() ? resolveMutation(oldValue, rawObj) : resolveMutation(null, rawObj);
      const observer = getObserver(rawObj);
      observer.setProp(COLLECTION_CHANGE, mutation);

      if (observer.watchers[key]) {
        observer.watchers[key].forEach(cb => {
          cb(key, oldValue, value, mutation);
        });
      }

      observer.setProp(key, mutation);
      oldData = [...Array.from(rawObj.entries())];
    } else {
      // NEW VALUE
      const keyProxy = createProxy(key, {
          current: change => {
            // KEY CHANGE
            if (!change.parents) change.parents = [];
            change.parents.push(rawObj);
            let mutation = resolveMutation(
              { ...rawObj, ['_keyChange']: change.mutation.from },
              { ...rawObj, ['_keyChange']: change.mutation.to }
            );
            listener.current({ ...change, mutation });
            listeners.forEach(lst => lst({ ...change, mutation }));
          },
        },
        hookObserverMap.get(rawObj)
      );
      proxies.set(key, keyProxy);

      rawObj.set(keyProxy, value);
      const observer = getObserver(rawObj);
      const mutation = resolveMutation(
        {
          _type: 'Map',
          entries: oldData,
        },
        {
          _type: 'Map',
          entries: Array.from(rawObj.entries()),
        }
      );
      observer.setProp(COLLECTION_CHANGE, mutation);

      if (observer.watchers?.[key]) {
        observer.watchers[key].forEach(cb => {
          cb(key, null, value, mutation);
        });
      }
      observer.setProp(key, mutation);
      oldData = [...Array.from(rawObj.entries())];
    }

    return rawObj;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function has(rawObj: { has: (any) => boolean }, key: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(key);
    if (rawObj.has(key)) {
      return true;
    }
    return proxies.has(key);
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function clear(rawObj: { size: number; clear: () => void; entries: () => [any, any][] }) {
    const oldSize = rawObj.size;
    rawObj.clear();

    if (oldSize > 0) {
      const observer = getObserver(rawObj);
      observer.allChange();
      oldData = [...Array.from(rawObj.entries())];
    }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function deleteFun(
    rawObj: { has: (key: any) => boolean; delete: (key: any) => void; entries: () => [any, any][] },
    key: any
  ) {
    if (rawObj.has(key) || proxies.has(key)) {
      rawObj.delete(key || proxies.get(key));

      const observer = getObserver(rawObj);
      const mutation = resolveMutation(
        {
          _type: 'Map',
          entries: oldData,
        },
        {
          _type: 'Map',
          entries: Array.from(rawObj.entries()),
        }
      );
      observer.setProp(key, mutation);
      observer.setProp(COLLECTION_CHANGE, mutation);

      oldData = [...Array.from(rawObj.entries())];
      return true;
    }

    return false;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function forEach(
    rawObj: { forEach: (callback: (value: any, key: any) => void) => void },
    callback: (valProxy: any, keyProxy: any, rawObj: any) => void
  ) {
    const observer = getObserver(rawObj);
    observer.useProp(COLLECTION_CHANGE);
    rawObj.forEach((value, key) => {
      const keyProxy = createProxy(value, {
          current: change => {
            //KEY ATTRIBUTES CHANGED
            if (!change.parents) change.parents = [];
            change.parents.push(rawObj);
            let mutation = resolveMutation(
              { ...rawObj, ['_keyChange']: change.mutation.from },
              { ...rawObj, ['_keyChange']: change.mutation.to }
            );
            listener.current({ ...change, mutation });
            listeners.forEach(lst => lst({ ...change, mutation }));
          },
        },
        hookObserverMap.get(rawObj)
      );
      const valProxy = createProxy(key, {
          current: change => {
            // VALUE ATTRIBUTE CHANGED
            if (!change.parents) change.parents = [];
            change.parents.push(rawObj);
            let mutation = resolveMutation(
              { ...rawObj, key: change.mutation.from },
              { ...rawObj, key: change.mutation.to }
            );
            listener.current({ ...change, mutation });
            listeners.forEach(lst => lst({ ...change, mutation }));
          },
        },
        hookObserverMap.get(rawObj)
      );
      // 最后一个参数要返回代理对象
      return callback(keyProxy, valProxy, rawObj);
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function wrapIterator(rawObj: Object, rawIt: { next: () => { value: any; done: boolean } }, type) {
    const observer = getObserver(rawObj);
    const hookObserver = hookObserverMap.get(rawObj);
    observer.useProp(COLLECTION_CHANGE);

    return {
      next() {
        const { value, done } = rawIt.next();
        if (done) {
          return {
            value: createProxy(value, {
                current: change => {
                  if (!change.parents) change.parents = [];
                  change.parents.push(rawObj);
                  let mutation = resolveMutation(
                    { ...rawObj, [value]: change.mutation.from },
                    { ...rawObj, [value]: change.mutation.to }
                  );
                  listener.current({ ...change, mutation });
                  listeners.forEach(lst => lst({ ...change, mutation }));
                },
              },
              hookObserver
            ),
            done,
          };
        }

        observer.useProp(COLLECTION_CHANGE);
        let newVal;
        if (type === 'entries') {
          //ENTRY CHANGED
          newVal = [
            createProxy(value[0], {
                current: change => {
                  if (!change.parents) change.parents = [];
                  change.parents.push(rawObj);
                  let mutation = resolveMutation(
                    { ...rawObj, ['itemChange']: { key: change.mutation.from, value: value[1] } },
                    { ...rawObj, ['itemChange']: { key: change.mutation.to, value: value[1] } }
                  );
                  listener.current({ ...change, mutation });
                  listeners.forEach(lst => lst({ ...change, mutation }));
                },
              },
              hookObserver
            ),
            createProxy(value[1], {
                current: change => {
                  if (!change.parents) change.parents = [];
                  change.parents.push(rawObj);
                  let mutation = resolveMutation(
                    { ...rawObj, item: { key: value[0], value: change.mutation.from } },
                    { ...rawObj, item: { key: value[0], value: change.mutation.to } }
                  );
                  listener.current({ ...change, mutation });
                  listeners.forEach(lst => lst({ ...change, mutation }));
                },
              },
              hookObserver
            ),
          ];
        } else {
          // SINGLE VALUE CHANGED
          newVal = createProxy(value, {
              current: change => {
                if (!change.parents) change.parents = [];
                change.parents.push(rawObj);
                let mutation = resolveMutation(
                  { ...rawObj, [type === 'keys' ? 'key' : 'value']: change.mutation.from },
                  { ...rawObj, [type === 'keys' ? 'key' : 'value']: change.mutation.to }
                );
                listener.current({ ...change, mutation });
                listeners.forEach(lst => lst({ ...change, mutation }));
              },
            },
            hookObserver
          );
        }

        return { value: newVal, done };
      },
      // 判断Symbol类型，兼容IE
      [typeof Symbol === 'function' ? Symbol.iterator : '@@iterator']() {
        return this;
      },
    };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function size(rawObj: { size: number }) {
    const observer = getObserver(rawObj);
    observer.useProp(COLLECTION_CHANGE);
    return rawObj.size;
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function keys(rawObj: { keys: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.keys(), 'keys');
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function values(rawObj: { values: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.values(), 'values');
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function entries(rawObj: { entries: () => { next: () => { value: any; done: boolean } } }) {
    return wrapIterator(rawObj, rawObj.entries(), 'entries');
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  function forOf(rawObj: {
    entries: () => { next: () => { value: any; done: boolean } };
    values: () => { next: () => { value: any; done: boolean } };
  }) {
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

  function get(rawObj: { size: number }, key: any, receiver: any): any {
    if (key === 'size') {
      return size(rawObj);
    }

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
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const boundHandler = {};
  Object.entries(handler).forEach(([id, val]) => {
    boundHandler[id] = (...args: any[]) => {
      return (val as any)(...args, hookObserver);
    };
  });

  getObserver(rawObj).addListener(change => {
    if (!change.parents) change.parents = [];
    change.parents.push(rawObj);
    listener.current(change);
    listeners.forEach(lst => lst(change));
  });
  return new Proxy(rawObj, { ...boundHandler });
}
