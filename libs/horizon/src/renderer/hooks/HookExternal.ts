import type {ContextType} from '../Types';

import hookMapping from './HookMapping';
import {useRefImpl} from './UseRefHook';
import {useEffectImpl, useLayoutEffectImpl} from './UseEffectHook';
import {useCallbackImpl} from './UseCallbackHook';
import {useMemoImpl} from './UseMemoHook';
import {useImperativeHandleImpl} from './UseImperativeHook';

const {
  UseContextHookMapping,
  UseReducerHookMapping,
  UseStateHookMapping
} = hookMapping;

type BasicStateAction<S> = ((S) => S) | S;
type Dispatch<A> = (A) => void;


export function useContext<T>(
  Context: ContextType<T>,
): T {
  return UseContextHookMapping.val.useContext(Context);
}

export function useState<S>(initialState: (() => S) | S,): [S, Dispatch<BasicStateAction<S>>] {
  return UseStateHookMapping.val.useState(initialState);
}

export function useReducer<S, I, A>(
  reducer: (S, A) => S,
  initialArg: I,
  init?: (I) => S,
): [S, Dispatch<A>] {
  return UseReducerHookMapping.val.useReducer(reducer, initialArg, init);
}

export function useRef<T>(initialValue: T): {current: T} {
  return useRefImpl(initialValue);
}

export function useEffect(
  create: () => (() => void) | void,
  deps?: Array<any> | null,
): void {
  return useEffectImpl(create, deps);
}

export function useLayoutEffect(
  create: () => (() => void) | void,
  deps?: Array<any> | null,
): void {
  return useLayoutEffectImpl(create, deps);
}

export function useCallback<T>(
  callback: T,
  deps?: Array<any> | null,
): T {
  return useCallbackImpl(callback, deps);
}

export function useMemo<T>(
  create: () => T,
  deps?: Array<any> | null,
): T {
  return useMemoImpl(create, deps);
}

export function useImperativeHandle<T>(
  ref: {current: T | null} | ((inst: T | null) => any) | null | void,
  create: () => T,
  deps?: Array<any> | null,
): void {
  return useImperativeHandleImpl(ref, create, deps);
}
