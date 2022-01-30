/**
 * useEffect 和 useLayoutEffect的执行逻辑
 */

import type {VNode} from '../Types';
import type {
  Effect as HookEffect,
  EffectList,
} from '../hooks/HookType';
import {runAsync} from '../taskExecutor/TaskExecutor';
import {
  copyExecuteMode, InRender, setExecuteMode,changeMode
} from '../ExecuteMode';
import {EffectConstant} from '../hooks/EffectConstant';

let hookEffects: Array<HookEffect | VNode> = [];
let hookRemoveEffects: Array<HookEffect | VNode> = [];
// 是否正在异步调度effects
let isScheduling: boolean = false;

export function setSchedulingEffects(value) {
  isScheduling = value;
}
export function isSchedulingEffects() {
  return isScheduling;
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
  const preMode = copyExecuteMode();
  changeMode(InRender, true);

  // 调用effect destroy
  const removeEffects = hookRemoveEffects;
  hookRemoveEffects = [];
  removeEffects.forEach(({effect}) => {
    const destroy = effect.removeEffect;
    effect.removeEffect = undefined;

    if (typeof destroy === 'function') {
      try {
        destroy();
      } catch (error) {
        // 不处理副作用阶段抛出的异常
      }
    }
  });

  // 调用effect create
  const createEffects = hookEffects;
  hookEffects = [];
  createEffects.forEach(({effect}) => {
    try {
      const create = effect.effect;

      effect.removeEffect = create();
    } catch (error) {
      // 不处理副作用阶段抛出的异常
    }
  });

  setExecuteMode(preMode);
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
  effectList.forEach(effect => {
    if ((effect.effectConstant & layoutLabel) === layoutLabel) {
      const remove = effect.removeEffect;
      effect.removeEffect = undefined;
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
  effectList.forEach(effect => {
    if ((effect.effectConstant & layoutLabel) === layoutLabel) {
      const create = effect.effect;
      effect.removeEffect = create();
    }
  });
}
