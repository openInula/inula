import type { Trigger } from './HookType';
export declare function useStateImpl<S>(initArg?: (() => S) | S): [S, Trigger<((S: any) => S) | S>];
