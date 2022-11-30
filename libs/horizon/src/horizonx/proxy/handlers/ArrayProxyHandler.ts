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
import { resolveMutation } from '../../CommonUtils';
import { isPanelActive } from '../../devtools';

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

  const oldArray = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  const newLength = rawObj.length;
  const observer = getObserver(rawObj);

  const mutation = isPanelActive() ? resolveMutation(oldArray, rawObj) : { mutation: true, from: [], to: rawObj };

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
