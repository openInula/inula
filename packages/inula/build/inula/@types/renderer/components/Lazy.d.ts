import type { PromiseType } from '../Types';
declare type LazyContent<T> = {
    _status: string;
    _value: () => PromiseType<{
        default: T;
    }> | PromiseType<T> | T | any;
};
export declare type LazyComponent<T, P> = {
    vtype: number;
    _content: P;
    _load: (content: P) => T;
};
export declare function lazy<T>(promiseCtor: () => PromiseType<{
    default: T;
}>): LazyComponent<T, LazyContent<T>>;
export {};
