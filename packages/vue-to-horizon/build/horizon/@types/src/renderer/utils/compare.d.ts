/**
 * 兼容IE浏览器没有Object.is
 */
export declare function isSame(x: any, y: any): boolean;
export declare function isArrayEqual(nextParam: Array<any>, lastParam: Array<any> | null): boolean;
export declare function shallowCompare(paramX: any, paramY: any): boolean;
