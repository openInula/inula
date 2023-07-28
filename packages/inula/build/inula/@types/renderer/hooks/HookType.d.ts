import { EffectConstant } from './EffectConstant';
declare type ValueOf<T> = T[keyof T];
export interface Hook<S, A> {
    state: Reducer<S, A> | Effect | Memo<S> | CallBack<S> | Ref<S>;
    hIndex: number;
}
export interface Reducer<S, A> {
    stateValue: S | null;
    trigger: Trigger<A> | null;
    reducer: ((S: any, A: any) => S) | null;
    updates: Array<Update<S, A>> | null;
    isUseState: boolean;
}
export declare type Update<S, A> = {
    action: A;
    didCalculated: boolean;
    state: S | null;
};
export declare type EffectList = Array<Effect> | null;
export declare type Effect = {
    effect: () => (() => void) | void;
    removeEffect: (() => void) | void;
    dependencies: Array<any> | null;
    effectConstant: ValueOf<typeof EffectConstant>;
};
export declare type Memo<V> = {
    result: V | null;
    dependencies: Array<any> | null;
};
export declare type CallBack<F> = {
    func: F | null;
    dependencies: Array<any> | null;
};
export declare type Ref<V> = {
    current: V;
};
export declare type Trigger<A> = (state: A) => void;
export {};
