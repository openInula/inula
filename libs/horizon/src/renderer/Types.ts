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
  source: any;
  type: any;
  key: any;
  ref: any;
  props: any;
  belongClassVNode: any;
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
  columnNumber: number;
  fileName: string;
  lineNumber: number;
};
