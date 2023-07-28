import { Observer } from './Observer';
export declare const hookObserverMap: WeakMap<object, any>;
export declare function getObserver(rawObj: any): Observer;
export declare function createProxy(rawObj: any, listener: {
    current: (...args: any[]) => any;
}, isHookObserver?: boolean): any;
export declare function toRaw<T>(observed: T): T;
