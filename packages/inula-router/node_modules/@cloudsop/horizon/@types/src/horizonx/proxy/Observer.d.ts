import { VNode } from '../../renderer/vnode/VNode';
export interface IObserver {
    useProp: (key: string) => void;
    addListener: (listener: () => void) => void;
    removeListener: (listener: () => void) => void;
    setProp: (key: string, mutation: any) => void;
    triggerChangeListeners: (mutation: any) => void;
    triggerUpdate: (vNode: any) => void;
    allChange: () => void;
    clearByVNode: (vNode: any) => void;
}
/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
export declare class Observer implements IObserver {
    vNodeKeys: WeakMap<object, any>;
    keyVNodes: Map<any, any>;
    listeners: ((mutation: any) => void)[];
    watchers: {
        [key: string]: ((key: string, oldValue: any, newValue: any, mutation: any) => void)[];
    };
    useProp(key: string | symbol): void;
    setProp(key: string | symbol, mutation: any): void;
    triggerUpdate(vNode: VNode): void;
    addListener(listener: (mutation: any) => void): void;
    removeListener(listener: (mutation: any) => void): void;
    triggerChangeListeners({ mutation, vNodes }: {
        mutation: any;
        vNodes: any;
    }): void;
    allChange(): void;
    clearByVNode(vNode: VNode): void;
}
