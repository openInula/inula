import type { Hook, Trigger } from './HookType';
import type { VNode } from '../Types';
export declare function TriggerAction<S, A>(vNode: VNode, hook: Hook<S, A>, isUseState: boolean, action: A): void;
export declare function useReducerForInit<S, A>(reducer: any, initArg: any, init: any, isUseState?: boolean): [S, Trigger<A>];
export declare function useReducerImpl<S, P, A>(reducer: (S: any, A: any) => S, initArg: P, init?: (P: any) => S, isUseState?: boolean): [S, Trigger<A>] | void;
