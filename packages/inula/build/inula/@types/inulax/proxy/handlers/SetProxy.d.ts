export declare function createSetProxy<T extends object>(rawObj: T, listener: {
    current: (...args: any[]) => any;
}, hookObserver?: boolean): ProxyHandler<T>;
