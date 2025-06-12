import { Observer } from './Observer';
export declare const hookObserverMap: WeakMap<object, any>;
export declare function createProxy(rawObj: any, id: any, isHookObserver?: boolean): any;
export declare function getObserver(rawObj: any): Observer;
