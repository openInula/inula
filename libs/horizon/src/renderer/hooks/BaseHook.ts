import type { VNode } from '../Types';
import type { Hook } from './HookType';

let processingVNode: VNode = null;

// lastTimeHook是上一次执行func时产生的hooks中，与currentHook对应的hook
let lastTimeHook: Hook<any, any> | null = null;

// 当前hook函数对应的hook对象
let currentHook: Hook<any, any> | null = null;

export function getProcessingVNode() {
  return processingVNode;
}

export function setProcessingVNode(vNode: VNode) {
  processingVNode = vNode;
}

export function getLastTimeHook() {
  return lastTimeHook;
}

export function setLastTimeHook(hook: Hook<any, any>) {
  lastTimeHook = hook;
}

export function setCurrentHook(hook: Hook<any, any>) {
  currentHook = hook;
}

export function throwNotInFuncError() {
  throw Error(
    'Hooks should be used inside function component.',
  );
}

// 新建一个hook，并放到vNode.hooks中
export function createHook(state: any = null): Hook<any, any> {
  const newHook: Hook<any, any> = {
    state: state,
    hIndex: processingVNode.hooks.length,
  };

  currentHook = newHook;
  processingVNode.hooks.push(newHook);

  return currentHook;
}

export function getNextHook(hook: Hook<any, any>, hooks: Array<Hook<any, any>>) {
  return hooks[hook.hIndex + 1] || null;
}

// 获取当前hook函数对应的hook对象。
// processing中的hook和上一次执行中的hook，需要同时往前走，
// 原因：1.比对hook的数量有没有变化（非必要）；2.从上一次执行中的hook获取removeEffect
export function getCurrentHook(): Hook<any, any> {
  currentHook = currentHook !== null ?
    getNextHook(currentHook, processingVNode.hooks) :
    (processingVNode.hooks[0] || null);

  if (lastTimeHook !== null) {
    lastTimeHook = getNextHook(lastTimeHook, processingVNode.oldHooks);
  } else {
    if (processingVNode.oldHooks && processingVNode.oldHooks.length) {
      lastTimeHook = processingVNode.oldHooks[0];
    } else {
      lastTimeHook = null;
    }
  }

  if (currentHook === null) {
    if (lastTimeHook === null) {
      throw Error('Hooks are more than expected, please check whether the hook is written in the condition.');
    }

    createHook(lastTimeHook.state);
  }

  return currentHook;
}
