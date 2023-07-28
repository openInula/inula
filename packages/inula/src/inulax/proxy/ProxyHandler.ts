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

import { createObjectProxy } from './handlers/ObjectProxyHandler';
import { Observer } from './Observer';
import { HooklessObserver } from './HooklessObserver';
import { isArray, isCollection, isObject } from '../CommonUtils';
import { createArrayProxy } from './handlers/ArrayProxyHandler';
import { createCollectionProxy } from './handlers/CollectionProxyHandler';
import type { IObserver } from '../types';
import { OBSERVER_KEY, RAW_VALUE } from '../Constants';

// 保存rawObj -> Proxy
const proxyMap = new WeakMap();

export const hookObserverMap = new WeakMap();

export function getObserver(rawObj: any): Observer {
  return rawObj[OBSERVER_KEY];
}

const setObserverKey = typeof OBSERVER_KEY === 'string'
  ? (rawObj, observer) => {
    Object.defineProperty(rawObj, OBSERVER_KEY, {
      configurable: false,
      enumerable: false,
      value: observer,
    });
  }
  : (rawObj, observer) => {
    rawObj[OBSERVER_KEY] = observer;
  };

export function createProxy(rawObj: any, listener: { current: (...args) => any }, isHookObserver = true): any {
  // 不是对象（是原始数据类型）不用代理
  if (!(rawObj && isObject(rawObj))) {
    return rawObj;
  }

  // 已代理过
  const existProxy = proxyMap.get(rawObj);
  if (existProxy) {
    return existProxy;
  }

  // Observer不需要代理
  if (rawObj instanceof Observer) {
    return rawObj;
  }

  // 创建Observer
  let observer: IObserver = getObserver(rawObj);
  if (!observer) {
    observer = isHookObserver ? new Observer() : new HooklessObserver();
    setObserverKey(rawObj, observer);
  }

  hookObserverMap.set(rawObj, isHookObserver);

  // 创建Proxy
  let proxyObj;
  if (!isHookObserver) {
    proxyObj = createObjectProxy(rawObj, {
        current: change => {
          listener.current(change);
        },
      },
      true);
  } else if (isArray(rawObj)) {
    // 数组
    proxyObj = createArrayProxy(rawObj as [], {
      current: change => {
        listener.current(change);
      },
    });
  } else if (isCollection(rawObj)) {
    // 集合
    proxyObj = createCollectionProxy(rawObj, {
        current: change => {
          listener.current(change);
        },
      },
      true);
  } else {
    // 原生对象 或 函数
    proxyObj = createObjectProxy(rawObj, {
        current: change => {
          listener.current(change);
        },
      },
      false);
  }

  proxyMap.set(rawObj, proxyObj);
  proxyMap.set(proxyObj, proxyObj);

  return proxyObj;
}

export function toRaw<T>(observed: T): T {
  return observed && (observed)[RAW_VALUE];
}
