import type { IObserver } from './Observer';
/**
 * 一个对象（对象、数组、集合）对应一个Observer
 */
export declare class HooklessObserver implements IObserver {
    listeners: ((mutation: any) => void)[];
    useProp(key: string | symbol): void;
    addListener(listener: (mutation: any) => void): void;
    removeListener(listener: (mutation: any) => void): void;
    getListeners(): ((mutation: any) => void)[];
    setProp(key: string | symbol, mutation: any): void;
    triggerChangeListeners(mutation: any): void;
    triggerUpdate(vNode: any): void;
    allChange(): void;
    clearByVNode(vNode: any): void;
}
