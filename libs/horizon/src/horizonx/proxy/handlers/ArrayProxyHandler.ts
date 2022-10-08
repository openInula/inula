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

import { getObserver } from '../ProxyHandler';
import { isSame, isValidIntegerKey } from '../../CommonUtils';
import { get as objectGet } from './ObjectProxyHandler';

export function createArrayProxy(rawObj: any[]): any[] {
  const handle = {
    get,
    set,
  };

  return new Proxy(rawObj, handle);
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
  return Reflect.get(rawObj, key, receiver);
}

function set(rawObj: any[], key: string, value: any, receiver: any) {
  const oldValue = rawObj[key];
  const oldLength = rawObj.length;
  const newValue = value;

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  const newLength = rawObj.length;
  const observer = getObserver(rawObj);

  if (!isSame(newValue, oldValue)) {
    if (observer.watchers?.[key]) {
      observer.watchers[key].forEach(cb => {
        cb(key, oldValue, newValue);
      });
    }

    observer.setProp(key);
  }

  if (oldLength !== newLength) {
    observer.setProp('length');
  }

  return ret;
}
