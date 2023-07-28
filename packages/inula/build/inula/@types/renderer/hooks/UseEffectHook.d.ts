export declare function useEffectForInit(effectFunc: any, deps: any, effectType: any): void;
export declare function useEffectForUpdate(effectFunc: any, deps: any, effectType: any): void;
export declare function useEffectImpl(effectFunc: () => (() => void) | void, deps?: Array<any> | null): void;
export declare function useLayoutEffectImpl(effectFunc: () => (() => void) | void, deps?: Array<any> | null): void;
