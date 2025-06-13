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
import { baseSetFun, baseGetFun, has, deleteProperty, ownKeys } from './BaseObjectHandler';
import { CurrentListener, KeyType, Listeners, ObjectType } from '../../types/ProxyTypes';

export function createObjectProxy<T extends ObjectType>(
  rawObj: T,
  listener: CurrentListener,
  isShallow = false
): ProxyHandler<T> {
  const listeners: Listeners = [];

  function get(rawObj: T, key: KeyType, receiver: any): any {
    return baseGetFun(rawObj, key, receiver, listener, listeners, isShallow);
  }

  const handler = {
    get,
    set: baseSetFun,
    deleteProperty,
    has,
    ownKeys,
  };

  registerListener(rawObj, listener, listeners);

  return new Proxy(rawObj, handler);
}
