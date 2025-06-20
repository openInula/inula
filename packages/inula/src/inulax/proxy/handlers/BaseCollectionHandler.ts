/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { KeyTypes } from '../../Constants';
import { getObserver } from '../ProxyHandler';
import { getValOrProxy, getWatchFn, triggerSetWatchers } from './HandlerUtils';
import {
  CollectionStringTypes,
  CollectionTypes,
  CurrentListener,
  IterableTypes,
  Listener,
  Listeners,
  MapTypes,
  ObjectType,
  SetTypes,
} from '../../types/ProxyTypes';
import { resolveMutation } from '../../CommonUtils';

export function baseGetFun(
  rawObj: MapTypes | SetTypes,
  key: any,
  receiver: any,
  listeners: Listeners,
  handler: ObjectType,
  type: CollectionStringTypes,
  getFun?: (rawObj: MapTypes, key: any) => any
): any {
  if (key === KeyTypes.VALUE) {
    return receiver;
  }

  if ((type === 'Map' || type === 'Set') && key === KeyTypes.SIZE) {
    return baseSizeFun(rawObj as IterableTypes);
  }

  if ((type === 'Map' || type === 'WeakMap') && key === KeyTypes.GET) {
    return getFun!.bind(null, rawObj);
  }

  if (Object.prototype.hasOwnProperty.call(handler, key)) {
    const value = Reflect.get(handler, key, receiver);
    return value.bind(null, rawObj);
  }

  const observer = getObserver(rawObj);
  if (key === KeyTypes.WATCH) {
    return getWatchFn(observer);
  }

  if (key === KeyTypes.ADD_LISTENER) {
    return (listener: Listener) => {
      listeners.push(listener);
    };
  }

  if (key === KeyTypes.REMOVE_LISTENER) {
    return (listener: Listener) => {
      listeners = listeners.filter(item => item != listener);
    };
  }

  if (key === KeyTypes.RAW_VALUE) {
    return rawObj;
  }

  return Reflect.get(rawObj, key, receiver);
}

function baseSizeFun(rawObj: IterableTypes) {
  const observer = getObserver(rawObj);
  observer.useProp(KeyTypes.COLLECTION_CHANGE);
  return rawObj.size;
}

export function baseForEach(
  rawObj: CollectionTypes,
  callback: (valProxy: any, keyProxy: any, rawObj: any) => void,
  listener: CurrentListener,
  listeners: Listeners
) {
  const observer = getObserver(rawObj);
  observer.useProp(KeyTypes.COLLECTION_CHANGE);
  rawObj.forEach((value, key) => {
    observer.useProp(key);
    const valProxy = getValOrProxy('valueChange', false, value, rawObj, listener, listeners);
    const keyProxy = getValOrProxy('keyChange', false, key, rawObj, listener, listeners);
    // 最后一个参数要返回代理对象
    return callback(valProxy, keyProxy, rawObj);
  });
}

export function baseClearFun(rawObj: IterableTypes, proxies: Map<any, any>, type: CollectionStringTypes) {
  const oldSize = rawObj.size;
  rawObj.clear();
  proxies.clear();

  if (oldSize > 0) {
    const observer = getObserver(rawObj);

    if (type === 'Set') {
      triggerSetWatchers(observer);
    }
    observer.allChange();
  }
}

export function baseDeleteFun(
  rawObj: MapTypes | SetTypes,
  value: any,
  type: CollectionStringTypes,
  proxies?: MapTypes
) {
  if (baseHasFun(rawObj, value, proxies)) {
    let oldValues;
    if (type === 'Set') {
      oldValues = Array.from((rawObj as Set<any>).values());
    } else if (type === 'Map') {
      oldValues = [...Array.from((rawObj as Map<any, any>).entries())];
    }

    rawObj.delete(value);
    proxies?.delete(value);

    const observer = getObserver(rawObj);

    if (type === 'Set' || type === 'WeakSet') {
      triggerSetWatchers(observer);
    }

    let mutation;
    if (type === 'Set') {
      mutation = resolveMutation(
        {
          _type: type,
          values: oldValues,
        },
        {
          _type: type,
          values: Array.from((rawObj as Set<any>).values()),
        }
      );
    } else if (type === 'Map') {
      mutation = resolveMutation(
        {
          _type: type,
          entries: oldValues,
        },
        {
          _type: type,
          entries: Array.from((rawObj as Map<any, any>).entries()),
        }
      );
    } else {
      mutation = { mutation: true, from: value, to: rawObj };
    }

    observer.setProp(value, mutation);

    if (type === 'Set' || type === 'Map') {
      observer.setProp(KeyTypes.COLLECTION_CHANGE, mutation);
    }

    return true;
  }

  return false;
}

export function baseAddFunOfSet(
  rawObj: SetTypes,
  value: any,
  listener: CurrentListener,
  listeners: Listeners,
  type: CollectionStringTypes,
  proxies?: MapTypes
): Record<string, any> {
  if (!baseHasFun(rawObj, value, proxies)) {
    const proxy = getValOrProxy('valueChange', false, value, rawObj, listener, listeners);

    let oldValues;
    if (type === 'Set') {
      oldValues = Array.from((rawObj as Set<any>).values());
    }

    // 更新
    proxies?.set(value, proxy);
    rawObj.add(value);

    const observer = getObserver(rawObj);

    triggerSetWatchers(observer);

    let mutation;
    if (type === 'Set') {
      mutation = resolveMutation(
        {
          _type: type,
          values: oldValues,
        },
        {
          _type: type,
          values: Array.from((rawObj as Set<any>).values()),
        }
      );
    } else {
      mutation = { mutation: true, from: rawObj, to: value };
    }

    observer.setProp(value, mutation, undefined, value);
    if (type === 'Set') {
      observer.setProp(KeyTypes.COLLECTION_CHANGE, mutation);
    }
  }

  return rawObj;
}

export function baseHasFun(rawObj: MapTypes | SetTypes, value: any, proxies?: MapTypes): boolean {
  // 通过new Set([{a: 1}])创建的值并没有加入proxies，所以还需要判断一下
  return proxies?.has(value) || rawObj.has(value);
}
