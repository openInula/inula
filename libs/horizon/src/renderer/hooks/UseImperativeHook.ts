import {useLayoutEffectImpl} from './UseEffectHook';
import {getHookStage} from './HookStage';
import {throwNotInFuncError} from './BaseHook';
import type {Ref} from './HookType';

export function useImperativeHandleImpl<R>(
  ref: { current: R | null } | ((any) => any) | null | void,
  func: () => R,
  dependencies?: Array<any> | null,
): void {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  const params = isNotNull(dependencies) ? dependencies.concat([ref]) : null;
  useLayoutEffectImpl(effectFunc.bind(null, func, ref), params);
}

function isNotNull(object: any): boolean {
  return object !== null && object !== undefined;
}

function effectFunc<R>(
  func: () => R,
  ref: Ref<R> | ((any) => any) | null,
): (() => void) | void {
  if (typeof ref === 'function') {
    const value = func();
    ref(value);
    return () => {
      ref(null);
    };
  }

  if (isNotNull(ref)) {
    ref.current = func();
    return () => {
      ref.current = null;
    };
  }
}
