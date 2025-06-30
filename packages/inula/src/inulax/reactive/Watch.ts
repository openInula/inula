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

import { ContextType, RContext } from './RContext';
import { useRef } from '../../renderer/hooks/HookExternal';
import { RefType } from '../types/ReactiveTypes';
import { WatchCallback } from '../types/ProxyTypes';
import { ComputedImpl } from './Computed';
import { isRef } from './Ref';
import { isArray, isMap, isObject, isPlainObject, isReactive, isSame, isSet } from '../CommonUtils';
import { toRaw } from './Reactive';
import { ReactiveFlags } from '../Constants';

export type WatchSource<T = any> = RefType<T> | ProxyHandler<T> | ComputedImpl<T> | (() => T);

export interface WatchOptions {
  deep?: boolean;
  immediate?: boolean;
}

const INITIAL_WATCHER_VALUE = {};

export function watch(source: WatchSource | WatchSource[], fn: WatchCallback, { deep, immediate }: WatchOptions = {}) {
  if (isRef(source)) {
    return doWatch(source, fn, { immediate });
  } else if (isReactive(source)) {
    return doWatch(source as WatchSource, fn, { deep, immediate });
  } else if (isArray(source)) {
    const stops = (source as WatchSource[]).map((s, index) => {
      return watch(
        s,
        (val, prevVal) => {
          const vals = getSourcesValue(source as WatchSource[]);
          const prevVals = getSourcesValue(source as WatchSource[]);
          vals[index] = val;
          prevVals[index] = prevVal === INITIAL_WATCHER_VALUE ? undefined : prevVal;
          fn(vals, prevVals);
        },
        { immediate }
      );
    });

    return () => {
      stops.forEach(stop => stop());
    };
  } else if (typeof source === 'function') {
    if (fn) {
      if (deep) {
        return doWatch(source, fn, { deep, immediate });
      } else {
        return doWatch(source, fn, { immediate });
      }
    } else {
      return watchEffect(source);
    }
  }
}

function getSourcesValue(sources: WatchSource[]) {
  return sources.map(source => {
    if (isRef(source)) {
      return source.value;
    } else if (isReactive(source)) {
      return toRaw(source);
    } else if (typeof source === 'function') {
      return source();
    }
  });
}

function doWatch(source: WatchSource, cb: WatchCallback, { deep, immediate }: WatchOptions = {}) {
  let getter: () => any;
  let forceTrigger = false;

  if (isRef(source)) {
    getter = () => source.value;
  } else if (isReactive(source)) {
    getter = () => traverse(source, deep === true ? undefined : 1);
    forceTrigger = true;
  } else if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => {};
    console.warn('Invalid watch source');
  }

  if (deep) {
    const baseGetter = getter;
    getter = () => traverse(baseGetter());
  }

  let oldValue: any = INITIAL_WATCHER_VALUE;
  const job = () => {
    if (!rContext.isDirty()) {
      return;
    }

    if (cb) {
      // watch(source, cb)
      const newValue = rContext.run();
      if (!isSame(newValue, oldValue) || forceTrigger || deep) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    } else {
      rContext.run();
    }
  };

  const rContext = new RContext(getter, ContextType.WATCH, undefined, job);

  if (immediate) {
    job(); // 立即执行一次 job
  } else {
    oldValue = rContext.run();
  }

  return () => {
    rContext.stop();
  };
}

export function watchEffect(fn: () => void): any {
  if (typeof fn === 'function') {
    const rContext = new RContext(fn, ContextType.WATCH, undefined, () => {
      if (rContext.isDirty()) {
        rContext.run();
      }
    });

    rContext.run();

    return () => {
      rContext.stop();
    };
  }
}

export function useWatch(source: WatchSource | WatchSource[], fn: WatchCallback, options: WatchOptions = {}): any {
  const objRef = useRef<null | RContext>(null);
  if (objRef.current === null) {
    objRef.current = watch(source, fn, options);
  }

  return objRef.current;
}

export function traverse(value: unknown, depth?: number, currentDepth = 0, seen?: Set<unknown>) {
  if (!isObject(value) || (value as object)[ReactiveFlags.IS_SKIP]) {
    return value;
  }

  if (depth && depth > 0) {
    if (currentDepth >= depth) {
      return value;
    }
    currentDepth++;
  }

  seen = seen || new Set();
  if (seen.has(value)) {
    return value;
  }
  seen.add(value);
  if (isRef(value)) {
    traverse(value.value, depth, currentDepth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, currentDepth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v: any) => {
      traverse(v, depth, currentDepth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, currentDepth, seen);
    }
  }
  return value;
}
