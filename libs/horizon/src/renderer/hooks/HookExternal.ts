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
import { Ref, Trigger } from './HookType';

type BasicStateAction<S> = ((S) => S) | S;
type Dispatch<A> = (value: A) => void;

export function useContext<T>(Context: ContextType<T>): T {
  const processingVNode = getProcessingVNode();
  return getNewContext(processingVNode!, Context, true);
}
export function useState<S = undefined>(): [S | undefined, Dispatch<BasicStateAction<S | undefined>>]
export function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>]
export function useState<S>(initialState?: (() => S) | S): [S, Dispatch<BasicStateAction<S>>] {
  return useStateImpl(initialState);
}

export function useReducer<S, I, A>(reducer: (S, A) => S, initialArg: I, init?: (I) => S): [S, Trigger<A>] {
  return useReducerImpl(reducer, initialArg, init);
}

export function useRef<T = undefined>(): Ref<T | undefined>
export function useRef<T>(initialValue: T): Ref<T>
export function useRef<T>(initialValue?: T): Ref<T> {
  return useRefImpl(initialValue);
}

export function useEffect(create: () => (() => void) | void, deps?: Array<any> | null): void {
  return useEffectImpl(create, deps);
}

export function useLayoutEffect(create: () => (() => void) | void, deps?: Array<any> | null): void {
  return useLayoutEffectImpl(create, deps);
}

export function useCallback<T>(callback: T, deps?: Array<any> | null): T {
  return useCallbackImpl(callback, deps);
}

export function useMemo<T>(create: () => T, deps?: Array<any> | null): T {
  return useMemoImpl(create, deps);
}

export function useImperativeHandle<T>(
  ref: { current: T | null } | ((inst: T | null) => any) | null | void,
  create: () => T,
  deps?: Array<any> | null
): void {
  return useImperativeHandleImpl(ref, create, deps);
}

// 兼容react-redux
export const useDebugValue = () => {};
