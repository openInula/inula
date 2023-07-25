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

import { BELONG_CLASS_VNODE_KEY } from './vnode/VNode';

export { VNode } from './vnode/VNode';

type Trigger<A> = (A) => void;

export type UseStateHookType = {
  useState<S>(initialState: (() => S) | S): [S, Trigger<((S) => S) | S>];
};
export type UseReducerHookType = {
  useReducer<S, P, A>(reducer: (S, A) => S, initArg: P, init?: (P) => S): [S, Trigger<A>];
};
export type UseContextHookType = { useContext<T>(context: ContextType<T>): T };

export type JSXElement = {
  vtype: any;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
  [BELONG_CLASS_VNODE_KEY]: any;
};

export type ProviderType<T> = {
  vtype: number;
  _context: ContextType<T>;
};

export type ContextType<T> = {
  vtype: number;
  Consumer: ContextType<T> | null;
  Provider: ProviderType<T> | null;
  value: T;
};

export type PortalType = {
  vtype: number;
  key: null | string;
  realNode: any;
  children: any;
};

export type RefType = {
  current: any;
};

export interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U
  ): void | PromiseType<U>;
}

export interface SuspenseState {
  promiseSet: Set<PromiseType<any>> | null; // suspense组件的promise列表
  childStatus: string;
  oldChildStatus: string; // 上一次Suspense的Children是否显示
  didCapture: boolean; // suspense是否捕获了异常
  promiseResolved: boolean; // suspense的promise是否resolve
}

export type Source = {
  fileName: string;
  lineNumber: number;
};

export type Callback = () => void;
