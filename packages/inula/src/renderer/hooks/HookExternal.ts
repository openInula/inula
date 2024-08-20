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

import type { ContextType } from '../Types';

import { useRefImpl } from './UseRefHook';
import { useEffectImpl, useLayoutEffectImpl } from './UseEffectHook';
import { useCallbackImpl } from './UseCallbackHook';
import { useMemoImpl } from './UseMemoHook';
import { useImperativeHandleImpl } from './UseImperativeHook';
import { useReducerImpl } from './UseReducerHook';
import { useStateImpl } from './UseStateHook';
import { getNewContext } from '../components/context/Context';
import { getProcessingVNode } from '../GlobalVar';
import type { MutableRef, RefCallBack, RefObject, Trigger } from './HookType';

import type {
  BasicStateAction,
  Dispatch,
  ReducerStateVoid,
  ReducerVoid,
  Reducer,
  EffectCallBack,
  DependencyList,
} from '../../types';
import { DispatchVoid, ReducerAction, ReducerState, Context } from '../../types';

export function useContext<T>(Context: Context<T>): T;
export function useContext<T>(Context: ContextType<T> | Context<T>): T {
  const processingVNode = getProcessingVNode();
  return getNewContext(processingVNode!, Context as ContextType<T>, true);
}

export function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>];
export function useState<S = undefined>(): [S | undefined, Dispatch<BasicStateAction<S | undefined>>];
export function useState<S>(
  initialState?: (() => S) | S
): [S | undefined, Trigger<((arg0: S) => S | undefined) | S | undefined>] | void {
  return useStateImpl(initialState);
}
export function useReducer<R extends ReducerVoid<any>, I>(
  reducer: R,
  initialArg: I,
  init: (arg: I) => ReducerVoid<R>
): [ReducerStateVoid<R>, DispatchVoid];
export function useReducer<R extends ReducerVoid<any>>(
  reducer: R,
  initialArg: ReducerStateVoid<R>,
  init?: undefined
): [ReducerStateVoid<R>, DispatchVoid];
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initialArg: I & ReducerState<R>,
  init?: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends Reducer<any, any>, I>(
  reducer: R,
  initialArg: I,
  init?: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends Reducer<any, any>>(
  reducer: R,
  initialArg: ReducerState<R>,
  init?: undefined
): [ReducerState<R>, Dispatch<ReducerAction<R>>];
export function useReducer<R extends ReducerVoid<any> | Reducer<any, any>, I>(
  reducer: R,
  initialArg: ReducerState<R> | I | (I & ReducerState<R>),
  init?: undefined | ((arg: I) => ReducerState<R> | ReducerVoid<R>) | ((arg: I & ReducerState<R>) => ReducerState<R>)
): unknown {
  return useReducerImpl(reducer, initialArg, init);
}

export function useRef<T>(initialValue: T): MutableRef<T>;
export function useRef<T>(initialValue: T | null): RefObject<T>;
export function useRef<T = undefined>(): MutableRef<T | undefined>;
export function useRef<T>(initialValue?: T): MutableRef<T> {
  return useRefImpl(initialValue);
}

export function useEffect(create: EffectCallBack, deps?: DependencyList): void {
  return useEffectImpl(create, deps);
}

export function useLayoutEffect(create: EffectCallBack, deps?: DependencyList): void {
  return useLayoutEffectImpl(create, deps);
}

export function useCallback<T>(callback: T, deps: DependencyList): T {
  return useCallbackImpl(callback, deps);
}

export function useMemo<T>(create: () => T, deps: DependencyList | undefined): T {
  return useMemoImpl(create, deps);
}

export function useImperativeHandle<T, R extends T>(
  ref: RefObject<T> | RefCallBack<T> | null | undefined,
  create: () => R,
  deps?: DependencyList
): void {
  return useImperativeHandleImpl(ref, create, deps);
}

// 兼容react-redux
export const useDebugValue = () => {};
