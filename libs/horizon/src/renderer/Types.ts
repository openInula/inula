export { VNode } from './vnode/VNode';

type Trigger<A> = (A) => void;

export type ReadContextHookType = { readContext<T>(context: ContextType<T>): T };
export type UseStateHookType = {
  useState<S>(
    initialState: (() => S) | S
  ): [S, Trigger<((S) => S) | S>]
};
export type UseReducerHookType = {
  useReducer<S, P, A>(
    reducer: (S, A) => S,
    initArg: P, init?: (P) => S,
  ): [S, Trigger<A>]
};
export type UseContextHookType = { useContext<T>(context: ContextType<T>,): T };

export type HorizonElement = {
  vtype: any,
  type: any,
  key: any,
  ref: any,
  props: any,

  _vNode: any,
};

export type ProviderType<T> = {
  vtype: number;
  _context: ContextType<T>;
};

export type ContextType<T> = {
  vtype: number;
  Consumer: ContextType<T>;
  Provider: ProviderType<T>;
  value: T;
};

export type PortalType = {
  vtype: number;
  key: null | string;
  outerDom: any;
  children: any;
};

export type RefType = {
  current: any;
};

export interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U,
  ): void | PromiseType<U>;
}

