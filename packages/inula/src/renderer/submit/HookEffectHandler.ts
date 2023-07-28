/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

/**
 * useEffect 和 useLayoutEffect的执行逻辑
 */

import type { VNode } from '../Types';
import type { Effect as HookEffect, EffectList } from '../hooks/HookType';
import { runAsync } from '../taskExecutor/TaskExecutor';
import { copyExecuteMode, InRender, setExecuteMode, changeMode } from '../ExecuteMode';
import { EffectConstant } from '../hooks/EffectConstant';

let hookEffects: Array<HookEffect | VNode> = [];
let hookRemoveEffects: Array<HookEffect | VNode> = [];

export function hasAsyncEffects() {
  return hookEffects.length > 0 || hookRemoveEffects.length > 0;
}

// 是否正在异步调度effects
let isScheduling = false;

export function setSchedulingEffects(value) {
  isScheduling = value;
}
export function isSchedulingEffects() {
  return isScheduling;
}

export function runAsyncEffects() {
  const preMode = copyExecuteMode();
  changeMode(InRender, true);

  // 调用effect destroy
  const removeEffects = hookRemoveEffects;
  hookRemoveEffects = [];
  removeEffects.forEach(effect => {
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
  createEffects.forEach(effect => {
    try {
      const create = effect.effect;

      effect.removeEffect = create();
    } catch (error) {
      // 不处理副作用阶段抛出的异常
    }
  });

  setExecuteMode(preMode);
}

export function callUseEffects(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;
  if (effectList !== null) {
    effectList.forEach(effect => {
      const { effectConstant } = effect;
      if (
        (effectConstant & EffectConstant.Effect) !== EffectConstant.NoEffect &&
        (effectConstant & EffectConstant.DepsChange) !== EffectConstant.NoEffect
      ) {
        hookEffects.push(effect);
        hookRemoveEffects.push(effect);

        // 异步调用
        if (!isScheduling) {
          isScheduling = true;
          runAsync(runAsyncEffects);
        }
      }
    });
  }
}

// 在销毁vNode的时候调用remove
export function callEffectRemove(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;
  if (effectList !== null) {
    effectList.forEach(effect => {
      const { removeEffect, effectConstant } = effect;

      if (removeEffect !== undefined) {
        if ((effectConstant & EffectConstant.Effect) !== EffectConstant.NoEffect) {
          // 如果是useEffect，就异步调用
          hookRemoveEffects.push(effect);

          if (!isScheduling) {
            isScheduling = true;
            runAsync(runAsyncEffects);
          }
        } else {
          // 是useLayoutEffect，直接执行
          removeEffect();
        }
      }
    });
  }
}

// 同步执行UseLayoutEffect的remove
export function callUseLayoutEffectRemove(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;

  const layoutLabel = EffectConstant.LayoutEffect | EffectConstant.DepsChange;
  if (effectList !== null) {
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
}

// 同步执行UseLayoutEffect
export function callUseLayoutEffectCreate(vNode: VNode) {
  const effectList: EffectList = vNode.effectList;
  if (effectList !== null) {
    const layoutLabel = EffectConstant.LayoutEffect | EffectConstant.DepsChange;
    effectList.forEach(effect => {
      if ((effect.effectConstant & layoutLabel) === layoutLabel) {
        const create = effect.effect;
        effect.removeEffect = create();
      }
    });
  }
}
