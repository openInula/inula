/* 
  Inulax Types – Type-Level Test Suite
  Detected framework: unknown (repository scan in CI will determine).
  This file is compatible with Jest and Vitest:
    - If Vitest globals are disabled, uncomment the import below:
    // import { describe, it, expect } from "vitest";

  These tests focus on compile-time type contracts. Runtime expectations are no-ops,
  but the TypeScript compiler will fail if type assertions are violated.
*/

/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  IObserver,
  StoreConfig,
  UserActions,
  ActionFunction,
  StoreActions,
  Action,
  StoreObj,
  PlannedAction,
  UserComputedValues,
  AsyncAction,
  QueuedStoreActions,
  ComputedValues
} from "../types.test";

/* ---------- Type-level assertion helpers ---------- */
type Expect<T extends true> = T;
// Exact type equality (including tuples with optional elements)
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? (
    (<T>() => T extends B ? 1 : 2) extends
    (<T>() => T extends A ? 1 : 2) ? true : false
  ) : false;

describe("inulax/types - core generics", () => {
  it("Action removes the first parameter (state) and preserves rest and return type", () => {
    type S = { count: number; name: string };

    // Original user action function type with explicit params
    type IncT = (this: StoreObj<S, any, any>, state: S, amount: number, tag?: string) => number;

    // Derived Action should drop the first (state) parameter and keep the rest
    type IncAction = Action<IncT, S>;

    type P = Parameters<IncAction>;
    type R = ReturnType<IncAction>;
    type TThis = ThisParameterType<IncAction>;

    type _p = Expect<Equal<P, [number, string?]>>;
    type _r = Expect<Equal<R, number>>;
    type _this = Expect<Equal<TThis, StoreObj<S, any, any>>>;

    expect(true).toBe(true);
  });

  it("AsyncAction mirrors Action parameters and wraps return type in Promise", () => {
    type S = { count: number; name: string };
    type GetLenT = (this: StoreObj<S, any, any>, state: S, input: string) => number;

    type GetLenAsync = AsyncAction<GetLenT, S>;

    type P = Parameters<GetLenAsync>;
    type R = ReturnType<GetLenAsync>;
    type _p = Expect<Equal<P, [string]>>;
    type _r = Expect<Equal<R, Promise<number>>>;

    expect(true).toBe(true);
  });

  it("Action with no extra params results in a zero-arity function", () => {
    type S = { a: 1 };
    type NoArgsT = (this: StoreObj<S, any, any>, state: S) => boolean;

    type NoArgsAction = Action<NoArgsT, S>;
    type P = Parameters<NoArgsAction>;
    type R = ReturnType<NoArgsAction>;

    type _p = Expect<Equal<P, []>>;
    type _r = Expect<Equal<R, boolean>>;

    expect(true).toBe(true);
  });

  it("StoreActions maps UserActions to concrete Action signatures", () => {
    type S = { count: number; name: string };

    type ActionsDef = {
      inc: (this: StoreObj<S, any, any>, state: S, amount: number, tag?: string) => number;
      setName: (this: StoreObj<S, any, any>, state: S, newName: string) => void;
      noArgs: (this: StoreObj<S, any, any>, state: S) => boolean;
    };

    type SA = StoreActions<S, ActionsDef>;

    // Validate derived signatures
    type _incParams = Expect<Equal<Parameters<SA["inc"]>, [number, string?]>>;
    type _incRet = Expect<Equal<ReturnType<SA["inc"]>, number>>;
    type _setNameParams = Expect<Equal<Parameters<SA["setName"]>, [string]>>;
    type _setNameRet = Expect<Equal<ReturnType<SA["setName"]>, void>>;
    type _noArgsParams = Expect<Equal<Parameters<SA["noArgs"]>, []>>;
    type _noArgsRet = Expect<Equal<ReturnType<SA["noArgs"]>, boolean>>;

    expect(true).toBe(true);
  });

  it("QueuedStoreActions maps to AsyncAction variants", () => {
    type S = { count: number; name: string };

    type ActionsDef = {
      inc: (this: StoreObj<S, any, any>, state: S, amount: number) => number;
      readName: (this: StoreObj<S, any, any>, state: S) => string;
    };

    type Q = QueuedStoreActions<S, ActionsDef>;

    type _incParams = Expect<Equal<Parameters<Q["inc"]>, [number]>>;
    type _incRet = Expect<Equal<ReturnType<Q["inc"]>, Promise<number>>>;
    type _readNameParams = Expect<Equal<Parameters<Q["readName"]>, []>>;
    type _readNameRet = Expect<Equal<ReturnType<Q["readName"]>, Promise<string>>>;

    expect(true).toBe(true);
  });

  it("ComputedValues extracts return types from computed function map", () => {
    type S = { count: number; name: string };
    type C = {
      doubleCount: (state: S) => number;
      isLongName: (state: S) => boolean;
    };

    type CV = ComputedValues<S, C>;
    type _d = Expect<Equal<CV["doubleCount"], number>>;
    type _l = Expect<Equal<CV["isLongName"], boolean>>;

    expect(true).toBe(true);
  });

  it("StoreObj merges state props, action callables, computed values, and exposes $-metadata", () => {
    type S = { count: number; name: string };
    type C = {
      doubleCount: (state: S) => number;
      nameUpper: (state: S) => string;
    };
    type A = {
      inc: (this: StoreObj<S, any, any>, state: S, amount: number, label?: string) => number;
      setName: (this: StoreObj<S, any, any>, state: S, newName: string) => void;
    };

    type Store = StoreObj<S, A, C>;
    const store = {} as Store;

    // State properties are directly accessible
    const sCount: number = store.count;
    const sName: string = store.name;

    // Computed values appear as concrete properties on the store
    const cDouble: number = store.doubleCount;
    const cUpper: string = store.nameUpper;

    // Actions are callable directly on the store
    const incResult: number = store.inc(2);
    const setResult: void = store.setName("Alice");

    // $s mirrors state type
    const $state: S = store.$s;

    // $a exposes mapped store actions
    const inc2: number = store.$a.inc(3);

    // $queue exposes async versions of actions
    const queued: Promise<number> = store.$queue.inc(4);

    // $c contains the computed function map, not their results
    const computedFnMap: UserComputedValues<S> = store.$c;
    const doubleFn: (state: S) => number = computedFnMap.doubleCount;

    // $subscribe/$unsubscribe accept listeners (any-typed mutation)
    store.$subscribe((_m) => {});
    store.$unsubscribe((_m) => {});

    expect(incResult).toBeDefined();
    expect(queued).toBeInstanceOf(Promise);
  });

  it("StoreConfig allows optional fields with proper generics", () => {
    type S = { count: number; name: string };
    type A = {
      noop: (this: StoreObj<S, any, any>, state: S) => void;
    };
    type C = {
      id: (state: S) => string;
    };

    const cfg1: StoreConfig<S, A, C> = {
      id: "inula-store",
      state: { count: 0, name: "x" },
      actions: {} as any,
      computed: {} as any,
      options: { isReduxAdapter: true },
    };

    const cfg2: StoreConfig<S, A, C> = {}; // all optional

    expect(cfg1).toBeTruthy();
    expect(cfg2).toBeTruthy();
  });

  it("PlannedAction captures the ReturnType of the provided action function", () => {
    type S = { v: number };
    type AddT = (this: StoreObj<S, any, any>, state: S, x: number, y: number) => number;

    type PA = PlannedAction<S, AddT>;
    // resolve should be number, payload is any[], and action is string
    type _resolve = Expect<Equal<PA["resolve"], number>>;
    type _payload = Expect<Equal<PA["payload"], any[]>>;
    type _action = Expect<Equal<PA["action"], string>>;

    expect(true).toBe(true);
  });

  it("IObserver requires the expected method signatures", () => {
    const obs: IObserver = {
      useProp: (_key: string | symbol) => {},
      addListener: (_l: (mutation: any) => void) => {},
      removeListener: (_l: (mutation: any) => void) => {},
      setProp: (_key: string | symbol, _mutation: any) => {},
      triggerChangeListeners: (_mutation: any) => {},
      triggerUpdate: (_vNode: any) => {},
      allChange: () => {},
      clearByVNode: (_vNode: any) => {},
    };

    // Basic runtime sanity to ensure object shape exists
    expect(typeof obs.useProp).toBe("function");
    expect(typeof obs.allChange).toBe("function");
  });
});