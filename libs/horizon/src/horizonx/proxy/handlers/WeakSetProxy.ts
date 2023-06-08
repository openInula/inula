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

export function createWeakSetProxy<T extends object>(
  rawObj: T,
  listener: { current: (...args) => any },
  hookObserver = true,
): ProxyHandler<T> {
  let listeners: ((mutation) => {})[] = [];
  let proxies = new WeakMap();

  const handler = {
    get,
    add,
    delete: deleteFun,
    has,
  };

  function get(rawObj: { size: number }, key: any, receiver: any): any {
    if (Object.prototype.hasOwnProperty.call(handler, key)) {
      const value = Reflect.get(handler, key, receiver);
      return value.bind(null, rawObj);
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
  // Set的add方法
  function add(rawObj: { add: (any) => void; has: (any) => boolean }, value: any): Object {
    if (!rawObj.has(proxies.get(value))) {
      const proxy = createProxy(value, {
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
        hookObserverMap.get(rawObj)
      );

      proxies.set(value, proxy);

      rawObj.add(proxies.get(value));

      const observer = getObserver(rawObj);
      const mutation = { mutation: true, from: rawObj, to: value };

      observer.setProp(value, mutation);
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
  function deleteFun(rawObj: { has: (key: any) => boolean; delete: (value: any) => void }, value: any) {
    if (rawObj.has(proxies.get(value))) {
      rawObj.delete(proxies.get(value));

      proxies.delete(value);

      const observer = getObserver(rawObj);
      const mutation = { mutation: true, from: value, to: rawObj };

      observer.setProp(value, mutation);

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
