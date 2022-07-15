import {EffectConstant} from './EffectConstant';
type ValueOf<T> = T[keyof T];
export interface Hook<S, A> {
  state: Reducer<S, A> | Effect | Memo<S> | CallBack<S> | Ref<S>;
  hIndex: number;
}

export interface Reducer<S, A> {
  stateValue: S | null;
  trigger: Trigger<A> | null;
  reducer: ((S, A) => S) | null;
  updates: Array<Update<S, A>> | null;
  isUseState: boolean;
}

export type Update<S, A> = {
  action: A;
  didCalculated: boolean;
  state: S | null;
};

export type EffectList = Array<Effect> | null;

export type Effect = {
  effect: () => (() => void) | void;
  removeEffect: (() => void) | void;
  dependencies: Array<any> | null;
  effectConstant: ValueOf<typeof EffectConstant>;
};

export type Memo<V> = {
  result: V | null;
  dependencies: Array<any> | null;
};

export type CallBack<F> = {
  func: F | null;
  dependencies: Array<any> | null;
};

export type Ref<V> = {
  current: V | null;
};

export type Trigger<A> = (A) => void;
