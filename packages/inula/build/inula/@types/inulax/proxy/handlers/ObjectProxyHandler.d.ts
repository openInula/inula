export declare function createObjectProxy<T extends object>(rawObj: T, listener: {
    current: (...args: any[]) => any;
}, singleLevel?: boolean): ProxyHandler<T>;
