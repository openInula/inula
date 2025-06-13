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

export type KeyType = string | symbol;
export type ObjectType = Record<KeyType, any>;
export type FnType = () => any;

// Collection types
export type MapTypes = Map<any, any> | WeakMap<any, any>;
export type SetTypes = Set<any> | WeakSet<any>;
export type IterableTypes = Map<any, any> | Set<any>;
export type CollectionTypes = Map<any, any> | Set<any>;
export type CollectionStringTypes = 'Map' | 'WeakMap' | 'Set' | 'WeakSet';

export type Listener = (change: any) => void;
export type Listeners = Listener[];
export type CurrentListener = { current: Listener };
export type WatchHandler = (key?: KeyType, oldValue?: any, newValue?: any, mutation?: any) => void;
export type WatchFn = (prop: KeyType, handler?: WatchHandler) => void;
export type WatchCallback = (val: any, prevVal: any) => void;

type WatchProp<T> = T & { watch?: WatchFn };
export type AddWatchProp<T> =
  T extends Map<infer K, infer V>
    ? WatchProp<Map<K, AddWatchProp<V>>>
    : T extends WeakMap<infer K, infer V>
      ? WatchProp<WeakMap<K, AddWatchProp<V>>>
      : T extends Set<infer U>
        ? WatchProp<Set<AddWatchProp<U>>>
        : T extends WeakSet<infer U>
          ? WatchProp<WeakSet<AddWatchProp<U>>>
          : T extends ObjectType
            ? WatchProp<{ [K in keyof T]: AddWatchProp<T[K]> }>
            : T;

export interface IObserver {
  watchers: {
    [key: KeyType]: WatchHandler[];
  };

  useProp: (key: KeyType) => void;

  addListener: (listener: Listener) => void;

  removeListener: (listener: () => void) => void;

  setProp: (key: KeyType, mutation: any, oldValue?: any, newValue?: any) => void;

  triggerChangeListeners: (mutation: any) => void;

  triggerUpdate: (vNode: any) => void;

  allChange: () => void;

  arrayLengthChange: (length: number) => void;

  clearByVNode: (vNode: any) => void;
}

export type Mutation<T = any> = {
  mutation: boolean;
  from: T;
  to: T;
};
