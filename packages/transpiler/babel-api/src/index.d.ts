import type babel from '@babel/core';

// use .d.ts to satisfy the type check
export * as types from '@babel/types';

export declare function register(api: typeof babel): void;
export declare function getBabelApi(): typeof babel;
