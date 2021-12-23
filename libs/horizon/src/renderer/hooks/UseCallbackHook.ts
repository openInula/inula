import {
  createHook,
  getCurrentHook,
  throwNotInFuncError
} from './BaseHook';
import {getHookStage, HookStage} from './HookStage';
import {isArrayEqual} from '../utils/compare';

export function useCallbackImpl<F>(func: F, dependencies?: Array<any> | null): F {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  let hook;
  const deps = dependencies !== undefined ? dependencies : null;
  if (stage === HookStage.Init) {
    hook = createHook();
    hook.state = {func, dependencies: deps};
  } else if (stage === HookStage.Update) {
    hook = getCurrentHook();

    const lastState = hook.state;
    // 判断dependencies是否相同，不同就不更新state
    if (lastState !== null && deps !== null && isArrayEqual(deps, lastState.dependencies)) {
      return lastState.func;
    }
    hook.state = {func, dependencies: deps};
  }

  return func;
}
