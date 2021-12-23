import type {Trigger} from './HookType';
import {useReducerImpl} from './UseReducerHook';

function defaultReducer<S>(state: S, action: ((S) => S) | S): S {
  // @ts-ignore
  return typeof action === 'function' ? action(state) : action;
}

export function useStateImpl<S>(initArg: (() => S) | S): [S, Trigger<((S) => S) | S>] {
  return useReducerImpl(defaultReducer, initArg, undefined, true);
}
