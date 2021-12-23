import {createHook, getCurrentHook, throwNotInFuncError} from './BaseHook';
import {getHookStage, HookStage} from './HookStage';
import type {Ref} from './HookType';

export function useRefImpl<V>(value: V): Ref<V> {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  let hook;
  if (stage === HookStage.Init) {
    hook = createHook();
    hook.state = {current: value};
  } else if (stage === HookStage.Update) {
    hook = getCurrentHook();
  }

  return hook.state;
}
