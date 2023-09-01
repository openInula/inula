import { BaseOption, DefaultStateType, History } from './types';
export type urlHashType = 'slash' | 'noslash';
type HashHistoryOption = {
    hashType?: urlHashType;
} & BaseOption;
export declare function createHashHistory<S = DefaultStateType>(option?: HashHistoryOption): History<S>;
export {};
