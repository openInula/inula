export declare function createObjectProxy<T extends object>(rawObj: T, singleLevel?: boolean): ProxyHandler<T>;
export declare function get(rawObj: object, key: string | symbol, receiver: any, singleLevel?: boolean): any;
export declare function set(rawObj: object, key: string, value: any, receiver: any): boolean;
