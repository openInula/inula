import { UnwrapRef, ComputedImpl, RefType } from '@cloudsop/horizon';

type StoreSetup<R = Record<string, unknown>> = () => R;
type AnyFunction = (...args: any[]) => any;
interface StoreDefinition<Id extends string = string, S extends Record<string, unknown> = Record<string, unknown>, A extends Record<string, AnyFunction> = Record<string, AnyFunction>, C extends Record<string, AnyFunction> = Record<string, AnyFunction>> {
    id?: Id;
    state?: () => S;
    actions?: ActionType<A, S, C>;
    getters?: ComputedType<C, S>;
}
type Store<S extends Record<string, unknown>, A extends Record<string, AnyFunction>, C extends Record<string, AnyFunction>> = {
    $s: S;
    $state: S;
    $a: ActionType<A, S, C>;
    $c: ComputedType<C, S>;
    $subscribe: (listener: Listener) => void;
    $unsubscribe: (listener: Listener) => void;
} & {
    [K in keyof S]: S[K];
} & {
    [K in keyof ActionType<A, S, C>]: ActionType<A, S, C>[K];
} & {
    [K in keyof ComputedType<C, S>]: ReturnType<ComputedType<C, S>[K]>;
};
type ActionType<A, S, C> = A & ThisType<A & UnwrapRef<S> & WithGetters<C>>;
type ComputedType<C, S> = {
    [K in keyof C]: AddFirstArg<C[K], S>;
} & ThisType<UnwrapRef<S> & WithGetters<C>>;
type AddFirstArg<T, S> = T extends (...args: infer A) => infer R ? (state: S, ...args: A) => R : T extends () => infer R ? (state: S) => R : T;
type WithGetters<G> = {
    readonly [k in keyof G]: G[k] extends (...args: any[]) => infer R ? R : UnwrapRef<G[k]>;
};
type Listener = (change: any) => void;
type FilterState<T extends Record<string, unknown>> = {
    [K in FilterStateProperties<T>]: UnwrapRef<T[K]>;
};
type FilterStateProperties<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends ComputedImpl ? never : T[K] extends RefType ? K : T[K] extends Record<any, unknown> ? K : never;
}[keyof T];
type FilterAction<T extends Record<string, unknown>> = {
    [K in FilterFunctionProperties<T>]: T[K] extends AnyFunction ? T[K] : never;
};
type FilterFunctionProperties<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends AnyFunction ? K : never;
}[keyof T];
type FilterComputed<T extends Record<string, unknown>> = {
    [K in FilterComputedProperties<T>]: T[K] extends ComputedImpl<infer T> ? (T extends AnyFunction ? T : never) : never;
};
type FilterComputedProperties<T extends Record<string, unknown>> = {
    [K in keyof T]: T[K] extends ComputedImpl ? K : never;
}[keyof T];
type StoreToRefsReturn<S extends Record<string, unknown>, C extends Record<string, AnyFunction>> = {
    [K in keyof S]: RefType<S[K]>;
} & {
    [K in keyof ComputedType<C, S>]: Readonly<RefType<ReturnType<ComputedType<C, S>[K]>>>;
};

declare function defineStore<Id extends string, S extends Record<string, unknown>, A extends Record<string, AnyFunction>, C extends Record<string, AnyFunction>>(definition: StoreDefinition<Id, S, A, C>): (pinia?: any) => Store<S, A, C>;
declare function defineStore<Id extends string, S extends Record<string, unknown>, A extends Record<string, AnyFunction>, C extends Record<string, AnyFunction>>(id: Id, definition: Omit<StoreDefinition<Id, S, A, C>, 'id'>): (pinia?: any) => Store<S, A, C>;
declare function defineStore<Id extends string, SS extends Record<any, unknown>>(id: Id, setup: StoreSetup<SS>): (pinia?: any) => Store<FilterState<SS>, FilterAction<SS>, FilterComputed<SS>>;
declare function mapStores<S extends Record<string, unknown>, A extends Record<string, AnyFunction>, C extends Record<string, AnyFunction>>(...stores: (() => Store<S, A, C>)[]): {
    [key: string]: () => Store<S, A, C>;
};
declare function storeToRefs<S extends Record<string, unknown>, A extends Record<string, AnyFunction>, C extends Record<string, AnyFunction>>(store: Store<S, A, C>): StoreToRefsReturn<S, C>;
declare function createPinia(): {
    install: (app: any) => void;
    use: (plugin: any) => any;
    state: {};
};

export { createPinia, defineStore, mapStores, storeToRefs };
