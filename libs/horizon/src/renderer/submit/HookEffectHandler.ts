/**
 * useEffect 和 useLayoutEffect的执行逻辑
 */

import type {VNode} from '../Types';
import type {
  Effect as HookEffect,
  EffectList,
} from '../hooks/HookType';
import {
  callRenderQueueImmediate,
} from '../taskExecutor/RenderQueue';
import {runAsync} from '../taskExecutor/TaskExecutor';
import {
  copyExecuteMode, InRender, setExecuteMode,changeMode
} from '../ExecuteMode';
import {handleSubmitError} from '../ErrorHandler';
import {clearDirtyNodes} from './Submit';
import {EffectConstant} from '../hooks/EffectConstant';

let hookEffects: Array<HookEffect | VNode> = [];
let hookRemoveEffects: Array<HookEffect | VNode> = [];
// 是否正在异步调度effects
let isScheduling: boolean = false;
let hookEffectRoot: VNode | null = null;

export function setSchedulingEffects(value) {
  isScheduling = value;
}
export function isSchedulingEffects() {
  return isScheduling;
}

export function setHookEffectRoot(root: VNode | null) {
  hookEffectRoot = root;
}
export function getHookEffectRoot() {
  return hookEffectRoot;
}

export function callUseEffects(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;

  effectList.forEach(effect => {
    const {effectConstant} = effect;
    if (
      (effectConstant & EffectConstant.Effect) !== EffectConstant.NoEffect &&
      (effectConstant & EffectConstant.DepsChange) !== EffectConstant.NoEffect
    ) {
      hookEffects.push({effect, vNode});
      hookRemoveEffects.push({effect, vNode});

      // 异步调用
      if (!isScheduling) {
        isScheduling = true;
        runAsync(runAsyncEffects);
      }
    }
  });
}

export function runAsyncEffects() {
  if (hookEffectRoot === null) {
    return false;
  }

  const root = hookEffectRoot;
  hookEffectRoot = null;

  const preMode = copyExecuteMode();
  changeMode(InRender, true);

  // 调用effect destroy
  const removeEffects = hookRemoveEffects;
  hookRemoveEffects = [];
  removeEffects.forEach(({effect, vNode}) => {
    const destroy = effect.removeEffect;
    effect.removeEffect = undefined;

    if (typeof destroy === 'function') {
      try {
        destroy();
      } catch (error) {
        handleSubmitError(vNode, error);
      }
    }
  });

  // 调用effect create
  const createEffects = hookEffects;
  hookEffects = [];
  createEffects.forEach(({effect, vNode}) => {
    try {
      const create = effect.effect;

      effect.removeEffect = create();
    } catch (error) {
      handleSubmitError(vNode, error);
    }
  });

  // 清理dirtyNodes
  clearDirtyNodes(root.dirtyNodes);

  setExecuteMode(preMode);

  callRenderQueueImmediate();

  return true;
}

// 在销毁vNode的时候调用remove
export function callEffectRemove(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;

  effectList.forEach(effect => {
    const {removeEffect, effectConstant} = effect;

    if (removeEffect !== undefined) {
      if ((effectConstant & EffectConstant.Effect) !== EffectConstant.NoEffect) { // 如果是useEffect，就异步调用
        hookRemoveEffects.push({effect, vNode});

        if (!isScheduling) {
          isScheduling = true;
          runAsync(runAsyncEffects);
        }
      } else { // 是useLayoutEffect，直接执行
        removeEffect();
      }
    }
  });
}

// 同步执行UseLayoutEffect的remove
export function callUseLayoutEffectRemove(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;

  const layoutLabel = EffectConstant.LayoutEffect | EffectConstant.DepsChange;
  effectList.forEach(item => {
    if ((item.effectConstant & layoutLabel) === layoutLabel) {
      const remove = item.removeEffect;
      item.removeEffect = undefined;
      if (typeof remove === 'function') {
        remove();
      }
    }
  });
}

// 同步执行UseLayoutEffect
export function callUseLayoutEffectCreate(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;

  const layoutLabel = EffectConstant.LayoutEffect | EffectConstant.DepsChange;
  effectList.forEach(item => {
    if ((item.effectConstant & layoutLabel) === layoutLabel) {
      const create = item.effect;
      item.removeEffect = create();
    }
  });
}