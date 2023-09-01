import { Action, Location, Path, To } from './types';
export declare function createPath(path: Partial<Path>): string;
export declare function parsePath(url: string): Partial<Path>;
export declare function createLocation<S>(current: string | Location, to: To, state?: S, key?: string): Readonly<Location<S>>;
export declare function isLocationEqual(p1: Partial<Path>, p2: Partial<Path>): boolean;
export declare function addHeadSlash(path: string): string;
export declare function stripHeadSlash(path: string): string;
export declare function normalizeSlash(path: string): string;
export declare function hasBasename(path: string, prefix: string): Boolean;
export declare function stripBasename(path: string, prefix: string): string;
export declare function createMemoryRecord<T, S>(initVal: S, fn: (arg: S) => T): {
    getDelta: (to: S, form: S) => number;
    addRecord: (current: S, newRecord: S, action: Action) => void;
};
