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

import { createProxy } from '../proxy/ProxyHandler';
import { KeyTypes, ReactiveFlags } from '../Constants';
import { Raw, ReactiveRet } from '../types/ReactiveTypes';
import { ObjectType } from '../types/ProxyTypes';
import { useRef } from '../../renderer/hooks/HookExternal';

export function reactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
export function reactive<T extends ObjectType>(rawObj: T) {
  return createProxy(rawObj);
}

export function useReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
export function useReactive<T extends ObjectType>(rawObj: T) {
  const objRef = useRef(rawObj);
  return createProxy(objRef.current);
}

// TODO shallowReactive当前只支持Object，对于集合和数组后续需要完成
export function shallowReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
export function shallowReactive<T extends ObjectType>(rawObj: T) {
  return createProxy(rawObj, undefined, true);
}

export function useShallowReactive<T extends ObjectType>(rawObj: T): ReactiveRet<T>;
export function useShallowReactive<T extends ObjectType>(rawObj: T) {
  const objRef = useRef(rawObj);
  return createProxy(objRef.current, undefined, true);
}

export function toRaw<T>(observed: T): T {
  const raw = observed && observed[KeyTypes.RAW_VALUE];
  return raw ? toRaw(raw) : observed;
}

export function markRaw<T extends object>(value: T): Raw<T> {
  if (Object.isExtensible(value)) {
    Object.defineProperty(value, ReactiveFlags.IS_SKIP, {
      configurable: true,
      enumerable: false,
      value: true,
    });
  }
  return value;
}
