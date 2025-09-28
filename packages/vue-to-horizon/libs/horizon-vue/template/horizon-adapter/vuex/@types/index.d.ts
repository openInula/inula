import { StoreObj, ComputedImpl } from '@cloudsop/horizon';

type AnyFunction = (...args: any[]) => any;
interface VuexStoreOptions<State extends Record<string, unknown> = Record<string, unknown>, Mutations extends Record<string, AnyFunction> = Record<string, AnyFunction>, Actions extends Record<string, AnyFunction> = Record<string, AnyFunction>, Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>, RootState extends Record<string, unknown> = Record<string, unknown>, RootGetters extends Record<string, AnyFunction> = Record<string, AnyFunction>, Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>> {
    namespaced?: boolean;
    state?: State | (() => State);
    mutations?: MutationsType<Mutations, State>;
    actions?: ActionsType<Actions, State, Getters, RootState, RootGetters>;
    getters?: GettersType<State, Getters, State, Getters>;
    modules?: {
        [k in keyof Modules]: VuexStoreOptions<Modules[k]>;
    };
}
type MutationsType<Mutations, State> = {
    [K in keyof Mutations]: AddFirstArg<Mutations[K], State>;
};
type ActionsType<Actions, State, Getters, RootState, RootGetters> = {
    [K in keyof Actions]: AddFirstArg<Actions[K], {
        commit: CommitType;
        dispatch: DispatchType;
        state: State;
        getters: Getters;
        rootState: RootState;
        rootGetters: RootGetters;
    }>;
};
type AddFirstArg<T, S> = T extends (arg1: any, ...args: infer A) => infer R ? (state: S, ...args: A) => R : T extends () => infer R ? (state: S) => R : T;
type GettersType<State, Getters, RootState, RootGetters> = {
    [K in keyof Getters]: AddArgs<Getters[K], [State, Getters, RootState, RootGetters]>;
};
type AddArgs<T, Args extends any[]> = T extends (...args: infer A) => infer R ? (...args: [...Args, ...A]) => R : T extends () => infer R ? (...args: Args) => R : T;
type CommitType = (type: string | (Record<string, unknown> & {
    type: string;
}), payload?: any, options?: Record<string, unknown>, moduleName?: string) => void;
type DispatchType = (type: string | (Record<string, unknown> & {
    type: string;
}), payload?: any, options?: Record<string, unknown>, moduleName?: string) => any;
type VuexStore<State extends Record<string, unknown> = Record<string, unknown>, Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>, Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>> = {
    state: State & {
        [K in keyof Modules]: Modules[K] extends {
            state: infer ModuleState;
        } ? ModuleState : Modules[K];
    };
    getters: {
        [K in keyof Getters]: ReturnType<Getters[K]>;
    };
    commit: CommitType;
    dispatch: DispatchType;
    subscribe: AnyFunction;
    subscribeAction: AnyFunction;
    watch: (fn: (state: State, getters: Getters) => void, cb: AnyFunction) => void;
    registerModule: (moduleName: string, module: VuexStoreOptions) => void;
    unregisterModule: (moduleName: string) => void;
    hasModule: (moduleName: string) => boolean;
    getModule: (moduleName: string) => StoreObj;
    install: (app: any, injectKey?: string) => void;
};

declare const MUTATION_PREFIX = "m_";
declare const GETTER_PREFIX = "g_";
declare function createStore<State extends Record<string, unknown> = Record<string, unknown>, Mutations extends Record<string, AnyFunction> = Record<string, AnyFunction>, Actions extends Record<string, AnyFunction> = Record<string, AnyFunction>, Getters extends Record<string, AnyFunction> = Record<string, AnyFunction>, RootState extends Record<string, unknown> = Record<string, unknown>, RootGetters extends Record<string, AnyFunction> = Record<string, AnyFunction>, Modules extends Record<string, Record<string, unknown>> = Record<string, Record<string, unknown>>>(options: VuexStoreOptions<State, Mutations, Actions, Getters, RootState, RootGetters, Modules>): VuexStore<State, Getters, Modules>;
declare function prepareTypeParams(type: string | (Record<string, unknown> & {
    type: string;
}), payload?: any, options?: Record<string, unknown>): {
    type: string;
    payload: any;
    options: Record<string, unknown>;
};
declare function moduleGettersProxy(storeX: StoreObj): {};
declare const storeKey = "DEFAULT_VUEX_STORE";
declare function useStore(key?: string): any;
declare function registerStore(store: VuexStore, key?: string): void;

declare const useMapState: (moduleName: any, states: any) => {
    [key: string]: ComputedImpl<any>;
};
declare const useMapGetters: (moduleName: any, getters: any) => {
    [key: string]: ComputedImpl<any>;
};
declare const useMapMutations: (moduleName: any, mutations: any) => {
    [key: string]: () => any;
};
declare const useMapActions: (moduleName: any, actions: any) => {
    [key: string]: () => any;
};

export { GETTER_PREFIX, MUTATION_PREFIX, createStore, moduleGettersProxy, prepareTypeParams, registerStore, storeKey, useMapActions, useMapGetters, useMapMutations, useMapState, useStore };
