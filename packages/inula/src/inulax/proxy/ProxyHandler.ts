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

import { createObjectProxy } from './handlers/ObjectProxyHandler';
import { Observer, ObserverType } from './Observer';
import { HooklessObserver } from './HooklessObserver';
import { isArray, isCanProxyObject, isCollection, isObject } from '../CommonUtils';
import { createArrayProxy } from './handlers/ArrayProxyHandler';
import { createCollectionProxy } from './handlers/CollectionProxyHandler';
import { IObserver, CurrentListener } from '../types/ProxyTypes';
import { ReactiveFlags } from '../Constants';

// Save rawObj -> Proxy
const proxyMap = new WeakMap<any, ProxyHandler<any>>();

// Record whether rawObj has been deeply proxied
export const reduxAdapterMap = new WeakMap<any, boolean>();

// Use WeakMap to save rawObj -> Observer, without polluting the original object
const rawObserverMap = new WeakMap<any, IObserver>();

export function getObserver(rawObj: any): IObserver {
  return rawObserverMap.get(rawObj) as IObserver;
}

function setObserver(rawObj: any, observer: IObserver): void {
  rawObserverMap.set(rawObj, observer);
}

export function createProxy(rawObj: any, listener?: CurrentListener, isShallow = false, isReduxAdapter = false): any {
  // No need to proxy if it's not an object (i.e., it's a primitive data type)
  if (!(rawObj && isObject(rawObj))) {
    return rawObj;
  }

  // just proxy 'Object', 'Array', 'Map', 'Set', 'WeakMap', 'WeakSet'
  if (!isCanProxyObject(rawObj)) {
    return rawObj;
  }

  // skip markRaw object
  if (rawObj[ReactiveFlags.IS_SKIP]) {
    return rawObj;
  }

  // Already exists
  const existProxy = proxyMap.get(rawObj);
  if (existProxy) {
    return existProxy;
  }

  // Observer does not need to be approached
  if (rawObj instanceof Observer) {
    return rawObj;
  }

  // Create Observer
  let observer = getObserver(rawObj);
  if (!observer) {
    observer = (isReduxAdapter ? new HooklessObserver() : new Observer(ObserverType.REACTIVE)) as IObserver;
    setObserver(rawObj, observer);
  }

  reduxAdapterMap.set(rawObj, isReduxAdapter);

  // 创建Proxy
  let proxyObj: ProxyHandler<any>;
  if (isShallow) {
    proxyObj = createObjectProxy(
      rawObj,
      {
        current: change => {
          listener?.current(change);
        },
      },
      true
    );
  } else if (isArray(rawObj)) {
    // 数组
    proxyObj = createArrayProxy(rawObj as [], {
      current: change => {
        listener?.current(change);
      },
    });
  } else if (isCollection(rawObj)) {
    // 集合
    proxyObj = createCollectionProxy(rawObj, {
      current: change => {
        listener?.current(change);
      },
    });
  } else {
    // 原生对象 或 函数
    proxyObj = createObjectProxy(
      rawObj,
      {
        current: change => {
          listener?.current(change);
        },
      },
      false
    );
  }

  proxyMap.set(rawObj, proxyObj);
  proxyMap.set(proxyObj, proxyObj);

  return proxyObj;
}
