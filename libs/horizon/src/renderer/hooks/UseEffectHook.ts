import {
  createHook,
  getCurrentHook,
  getLastTimeHook,
  getProcessingVNode, throwNotInFuncError
} from './BaseHook';
import {FlagUtils} from '../vnode/VNodeFlags';
import {EffectConstant} from './EffectConstant';
import type {Effect, EffectList} from './HookType';
import {getHookStage, HookStage} from './HookStage';
import {isArrayEqual} from '../utils/compare';

export function useEffectImpl(effectFunc: () => (() => void) | void, deps?: Array<any> | null,): void {
  // 异步触发的effect
  useEffect(effectFunc, deps, EffectConstant.Effect);
}

export function useLayoutEffectImpl(effectFunc: () => (() => void) | void, deps?: Array<any> | null): void {
  // 同步触发的effect
  useEffect(effectFunc, deps, EffectConstant.LayoutEffect);
}

function useEffect(
  effectFunc: () => (() => void) | void,
  deps: Array<any> | void | null,
  effectType: number
): void {
  const stage = getHookStage();
  if (stage === null) {
    throwNotInFuncError();
  }

  if (stage === HookStage.Init) {
    return useEffectForInit(effectFunc, deps, effectType);
  } else if (stage === HookStage.Update) {
    return useEffectForUpdate(effectFunc, deps, effectType);
  }
}

export function useEffectForInit(effectFunc, deps, effectType): void {
  FlagUtils.markUpdate(getProcessingVNode());

  const hook = createHook();
  const nextDeps = deps !== undefined ? deps : null;
  // 初始阶段，设置DepsChange标记位; 构造EffectList数组，并赋值给state
  hook.state = createEffect(effectFunc, undefined, nextDeps, EffectConstant.DepsChange | effectType);
}

export function useEffectForUpdate(effectFunc, deps, effectType): void {
  const hook = getCurrentHook();
  const nextDeps = deps !== undefined ? deps : null;
  let removeFunc;

  if (getLastTimeHook() !== null) {
    const effect = getLastTimeHook().state as Effect;
    // removeEffect是通过执行effect返回的，所以需要在上一次hook中获取
    removeFunc = effect.removeEffect;
    const lastDeps = effect.dependencies;

    // 判断dependencies是否相同，同相同不需要设置DepsChange标记位
    if (nextDeps !== null && isArrayEqual(nextDeps, lastDeps)) {
      hook.state = createEffect(effectFunc, removeFunc, nextDeps, effectType);
      return;
    }
  }

  FlagUtils.markUpdate(getProcessingVNode());
  // 设置DepsChange标记位，构造Effect，并赋值给state
  hook.state = createEffect(effectFunc, removeFunc, nextDeps, EffectConstant.DepsChange | effectType);
}

function createEffect(effectFunc, removeFunc, deps, effectConstant): Effect {
  const effect: Effect = {
    effect: effectFunc,
    removeEffect: removeFunc,
    dependencies: deps,
    effectConstant: effectConstant,
  };

  getProcessingVNode().effectList.push(effect);

  return effect;
}
