import type {VNode, ContextType} from '../../Types';
import {getHookStage} from '../../hooks/HookStage';
import {throwNotInFuncError} from '../../hooks/BaseHook';

// 重置依赖
export function resetDepContexts(vNode: VNode): void {
  vNode.depContexts = null;
}

// 收集依赖
function collectDeps<T>(vNode: VNode, context: ContextType<T>) {
  const depContexts = vNode.depContexts;
  if (depContexts === null) {
    vNode.depContexts = [context];
  } else {
    vNode.isDepContextChange = false;
    if (!depContexts.includes(context)) {
      depContexts.push(context);
    }
  }
}

export function getNewContext<T>(vNode: VNode, ctx: ContextType<T>, isUseContext: boolean = false): T {
  // 如果来自于useContext，则需要在函数组件中调用
  if (isUseContext && getHookStage() === null) {
    throwNotInFuncError();
  }

  // 调用到这个方法，说明当前vNode依赖了这个context，所以需要收集起来
  collectDeps(vNode, ctx);

  return ctx.value;
}
