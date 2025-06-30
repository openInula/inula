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

import { registerListener } from './HandlerUtils';
import { CurrentListener, Listeners } from '../../types/ProxyTypes';
import { baseGetFun, baseAddFunOfSet, baseHasFun, baseDeleteFun } from './BaseCollectionHandler';
import { getObserver } from '../ProxyHandler';

export function createWeakSetProxy<T extends WeakSet<any>>(rawObj: T, listener: CurrentListener): ProxyHandler<T> {
  const listeners: Listeners = [];
  // 因为rawObj是WeakSet类型，里面存放的是proxy对象，所以需要一个map来存放真实的对象和proxy对象的映射关系
  const proxies = new WeakMap();

  const handler = {
    get,
    add,
    delete: deleteFun,
    has,
  };

  function get(rawObj: T, key: any, receiver: any): any {
    return baseGetFun(rawObj, key, receiver, listeners, handler, 'WeakSet');
  }

  function add(rawObj: T, value: any): Record<string, any> {
    return baseAddFunOfSet(rawObj, value, listener, listeners, 'WeakSet', proxies);
  }

  function has(rawObj: T, value: any): boolean {
    const observer = getObserver(rawObj);
    observer.useProp(value);

    return baseHasFun(rawObj, value, proxies);
  }

  function deleteFun(rawObj: T, value: any) {
    return baseDeleteFun(rawObj, value, 'WeakSet', proxies);
  }

  registerListener(rawObj, listener, listeners);

  return new Proxy(rawObj, handler);
}
