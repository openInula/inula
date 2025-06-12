export declare function useImperativeHandleImpl<R>(ref: {
    current: R | null;
} | ((any: any) => any) | null | void, func: () => R, dependencies?: Array<any> | null): void;
