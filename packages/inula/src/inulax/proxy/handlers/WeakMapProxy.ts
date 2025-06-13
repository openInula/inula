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
import { isSame } from '../../CommonUtils';
import { resolveMutation } from '../../CommonUtils';
import { isPanelActive } from '../../devtools';
import { getValOrProxy, registerListener } from './HandlerUtils';
import { CurrentListener, Listeners, ObjectType } from '../../types/ProxyTypes';
import { baseDeleteFun, baseGetFun } from './BaseCollectionHandler';

export function createWeakMapProxy<T extends WeakMap<any, any>>(rawObj: T, listener: CurrentListener): ProxyHandler<T> {
  const listeners: Listeners = [];

  const handler = {
    get,
    set,
    delete: deleteFun,
    has,
  };

  function getFun(rawObj: T, key: any) {
    const observer = getObserver(rawObj);
    observer.useProp(key);

    const value = rawObj.get(key);
    // 对于value也需要进一步代理
    return getValOrProxy(key, false, value, rawObj, listener, listeners);
  }

  function get(rawObj: T, key: any, receiver: any): any {
    return baseGetFun(rawObj, key, receiver, listeners, handler, 'WeakMap', getFun);
  }

  function set(rawObj: T, key: any, value: any) {
    const oldValue = rawObj.get(key);

    rawObj.set(key, value);

    const observer = getObserver(rawObj);
    const mutation = isPanelActive() ? resolveMutation(oldValue, rawObj) : resolveMutation(null, rawObj);

    if (!isSame(value, oldValue)) {
      observer.setProp(key, mutation, oldValue, value);
    }

    return rawObj;
  }

  function has(rawObj: T, key: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(key);

    return rawObj.has(key);
  }

  function deleteFun(rawObj: T, key: any) {
    return baseDeleteFun(rawObj, key, 'WeakMap');
  }

  registerListener(rawObj, listener, listeners);

  return new Proxy(rawObj as ObjectType, handler as any);
}
