import {
  createHook,
  getCurrentHook,
  throwNotInFuncError
} from './BaseHook';
import {getHookStage, HookStage} from './HookStage';
import {isArrayEqual} from '../utils/compare';

export function useMemoImpl<V>(fun: () => V, deps?: Array<any> | null,): V {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  let hook;
  let result;
  const nextDeps = deps === undefined ? null : deps;

  if (stage === HookStage.Init) {
    hook = createHook();
    result = fun();
  } else if (stage === HookStage.Update) {
    hook = getCurrentHook();

    const lastState = hook.state;
    // dependencies相同，不更新state
    if (lastState !== null && nextDeps !== null && isArrayEqual(nextDeps, lastState.dependencies)) {
      return lastState.result;
    }
    result = fun();
  }

  hook.state = {result, dependencies: nextDeps};
  return hook.state.result;
}
