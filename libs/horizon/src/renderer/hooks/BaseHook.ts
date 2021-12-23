import type {VNode} from '../Types';
import type {Hook} from './HookType';

let processingVNode: VNode = null;

let activatedHook: Hook<any, any> | null = null;

// 当前hook函数对应的hook对象
let currentHook: Hook<any, any> | null = null;

export function getProcessingVNode() {
  return processingVNode;
}

export function setProcessingVNode(vNode: VNode) {
  processingVNode = vNode;
}

export function getActivatedHook() {
  return activatedHook;
}

export function setActivatedHook(hook: Hook<any, any>) {
  activatedHook = hook;
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

export function getNextHook(hook: Hook<any, any>, vNode: VNode) {
  return vNode.hooks[hook.hIndex + 1] || null;
}

// 获取当前hook函数对应的hook对象。
// processing中的hook和activated中的hook，需要同时往前走，
// 原因：1.比对hook的数量有没有变化（非必要）；2.从activated中的hook获取removeEffect
export function getCurrentHook(): Hook<any, any> {
  currentHook = currentHook !== null ? getNextHook(currentHook, processingVNode) : (processingVNode.hooks[0] || null);
  const activated = processingVNode.twins;
  activatedHook = activatedHook !== null ? getNextHook(activatedHook, activated) : ((activated && activated.hooks[0]) || null);

  if (currentHook === null) {
    if (activatedHook === null) {
      throw Error('Hooks are more than expected, please check whether the hook is written in the condition.');
    }

    createHook(activatedHook.state);
  }

  return currentHook;
}
