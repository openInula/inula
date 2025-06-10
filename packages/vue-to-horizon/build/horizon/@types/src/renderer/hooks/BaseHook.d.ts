import type { Hook } from './HookType';
export declare function getLastTimeHook(): Hook<any, any>;
export declare function setLastTimeHook(hook: Hook<any, any> | null): void;
export declare function setCurrentHook(hook: Hook<any, any> | null): void;
export declare function throwNotInFuncError(): void;
export declare function createHook(state?: any): Hook<any, any>;
export declare function getNextHook(hook: Hook<any, any>, hooks: Array<Hook<any, any>>): Hook<any, any>;
export declare function getCurrentHook(): Hook<any, any>;
