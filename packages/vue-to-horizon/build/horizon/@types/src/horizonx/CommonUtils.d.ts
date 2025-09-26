export declare function isObject(obj: any): boolean;
export declare function isSet(obj: any): boolean;
export declare function isWeakSet(obj: any): boolean;
export declare function isMap(obj: any): boolean;
export declare function isWeakMap(obj: any): boolean;
export declare function isArray(obj: any): boolean;
export declare function isCollection(obj: any): boolean;
export declare function isString(obj: any): boolean;
export declare function isValidIntegerKey(key: any): boolean;
export declare function isPromise(obj: any): boolean;
export declare function isSame(x: any, y: any): boolean;
export declare function getDetailedType(val: any): "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "map" | "null" | "collection" | "promise" | "array" | "weakMap" | "weakSet" | "set";
export declare function resolveMutation(from: any, to: any): {
    mutation: boolean;
    from: any;
    to: any;
    items?: undefined;
    attributes?: undefined;
} | {
    mutation: boolean;
    items: any[];
    from: any;
    to: any;
    attributes?: undefined;
} | {
    mutation: boolean;
    attributes: {};
    from: any;
    to: any;
    items?: undefined;
} | {
    mutation: boolean;
    from?: undefined;
    to?: undefined;
    items?: undefined;
    attributes?: undefined;
};
