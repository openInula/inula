import type { StoreConfig, StoreObj, UserActions, UserComputedValues } from '../types';
import { VNode } from '../../renderer/vnode/VNode';
export declare function createStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(config: StoreConfig<S, A, C>): () => StoreObj<S, A, C>;
export declare function clearVNodeObservers(vNode: VNode): void;
export declare function useStore<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>>(id: string): StoreObj<S, A, C>;
export declare function getStore(id: string): StoreObj<any, any, any>;
export declare function getAllStores(): {
    [k: string]: StoreObj<any, any, any>;
};
export declare function clearStore(id: string): void;
