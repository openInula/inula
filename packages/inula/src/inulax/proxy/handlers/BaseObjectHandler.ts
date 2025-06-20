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

import { isPanelActive } from '../../devtools';
import { getObserver } from '../ProxyHandler';
import { isArray, isSame, isValidIntegerKey, resolveMutation } from '../../CommonUtils';
import { isRef } from '../../reactive/Ref';
import { KeyTypes, OBSERVER_KEY, ReactiveFlags } from '../../Constants';
import { getValOrProxy, getWatchFn } from './HandlerUtils';
import { toRaw } from '../../reactive/Reactive';
import { CurrentListener, Listeners, Listener, ObjectType, KeyType } from '../../types/ProxyTypes';

// Object 和 Array 公用的 proxy handler set
export function baseSetFun(rawObj: any[], key: string, value: any, receiver: any) {
  const oldValue = rawObj[key];
  const newValue = value;
  const isArr = isArray(rawObj);

  if (!isArr && isRef(oldValue) && !isRef(newValue)) {
    oldValue.value = newValue;
    return true;
  }

  const oldLength = isArr ? rawObj.length : 0;
  const oldObj = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;

  const hadKey =
    isArr && isValidIntegerKey(key) ? Number(key) < rawObj.length : Object.prototype.hasOwnProperty.call(rawObj, key);

  const ret = Reflect.set(rawObj, key, newValue, receiver);

  const newLength = isArr ? rawObj.length : 0;
  const observer = getObserver(rawObj);

  if (!isSame(newValue, oldValue)) {
    const mutation = resolveMutation(oldObj, rawObj);

    // 触发属性变化
    observer.setProp(key, mutation, oldValue, newValue);

    if (isArr) {
      if (oldLength !== newLength) {
        if (key === KeyTypes.LENGTH) {
          // 只需要触发比新数组长度大的部分
          observer.arrayLengthChange(newLength);
        } else {
          // 触发数组的大小变化
          observer.setProp('length', mutation);
        }
      }
    } else {
      if (!hadKey) {
        // 触发数组的大小变化
        observer.setProp('length', mutation);
      }
    }
  }

  return ret;
}

export function baseGetFun<T extends Record<string | symbol, any> | any[]>(
  rawObj: T,
  key: KeyType,
  receiver: any,
  listener: CurrentListener,
  listeners: Listeners,
  isShallow = false
) {
  if (key === OBSERVER_KEY) {
    return undefined;
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

  if (key === KeyTypes.HAS_OWN_PROPERTY) {
    return hasOwnProperty;
  }

  const value = Reflect.get(rawObj, key, receiver);

  if (key === ReactiveFlags.IS_SHALLOW) {
    return isShallow;
  }

  const isArr = isArray(rawObj);

  if (isArr) {
    // 数组只代理数字索引和length
    if (isValidIntegerKey(key) || key === KeyTypes.LENGTH) {
      observer.useProp(key);

      // 对于value也需要进一步代理
      return getValOrProxy(key, isShallow, value, rawObj, listener, listeners);
    }
  } else {
    if (key !== KeyTypes.PROTOTYPE) {
      observer.useProp(key);

      // 对于value也需要进一步代理
      return getValOrProxy(key, isShallow, value, rawObj, listener, listeners);
    }
  }

  return value;
}

export function has<T extends ObjectType>(rawObj: T, key: KeyType) {
  const observer = getObserver(rawObj);
  observer.useProp(key);

  return Reflect.has(rawObj, key);
}

export function deleteProperty<T extends ObjectType | any[]>(rawObj: T, key: KeyType) {
  const oldObj = isPanelActive() ? JSON.parse(JSON.stringify(rawObj)) : null;
  const observer = getObserver(rawObj);

  const oldValue = rawObj[key];
  const newValue = undefined;

  const ret = Reflect.deleteProperty(rawObj, key);
  const mutation = resolveMutation(oldObj, rawObj);

  if (!isSame(newValue, oldValue)) {
    observer.setProp(key, mutation, oldValue, newValue);

    // 触发数组的大小变化
    observer.setProp('length', mutation);
  }
  return ret;
}

// 代理 for (const key in obj) 场景
export function ownKeys(rawObj: ObjectType): (string | symbol)[] {
  const observer = getObserver(rawObj);

  observer.useProp('length');

  return Reflect.ownKeys(rawObj);
}

function hasOwnProperty(this: Record<string, any>, key: string) {
  const obj = toRaw(this);
  has(obj, key);
  return Object.prototype.hasOwnProperty.call(obj, key);
}
