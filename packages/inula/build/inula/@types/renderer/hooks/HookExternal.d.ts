import type { ContextType } from '../Types';
import { Ref, Trigger } from './HookType';
declare type BasicStateAction<S> = ((S: any) => S) | S;
declare type Dispatch<A> = (value: A) => void;
export declare function useContext<T>(Context: ContextType<T>): T;
export declare function useState<S = undefined>(): [S | undefined, Dispatch<BasicStateAction<S | undefined>>];
export declare function useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>];
export declare function useReducer<S, I, A>(reducer: (S: any, A: any) => S, initialArg: I, init?: (I: any) => S): [S, Trigger<A>];
export declare function useRef<T = undefined>(): Ref<T | undefined>;
export declare function useRef<T>(initialValue: T): Ref<T>;
export declare function useEffect(create: () => (() => void) | void, deps?: Array<any> | null): void;
export declare function useLayoutEffect(create: () => (() => void) | void, deps?: Array<any> | null): void;
export declare function useCallback<T>(callback: T, deps?: Array<any> | null): T;
export declare function useMemo<T>(create: () => T, deps?: Array<any> | null): T;
export declare function useImperativeHandle<T>(ref: {
    current: T | null;
} | ((inst: T | null) => any) | null | void, create: () => T, deps?: Array<any> | null): void;
export declare const useDebugValue: () => void;
export {};
