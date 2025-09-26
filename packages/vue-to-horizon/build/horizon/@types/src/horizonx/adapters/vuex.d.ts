export declare function createStore({ state, mutations, getters, actions, modules, }: {
    state?: Object | Function;
    mutations?: {
        [type: string]: Function;
    };
    getters?: {
        [type: string]: Function;
    };
    actions?: {
        [type: string]: Function;
    };
    modules?: Object;
}): () => import("../types").StoreObj<Object | Function, import("../types").UserActions<Object | Function>, import("../types").UserComputedValues<Object | Function>>;
