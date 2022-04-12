/**
 * 保存与深度遍历相关的一些context。
 * 在深度遍历过程中，capture阶段会修改一些全局的值，在bubble阶段会恢复。
 */

import type { VNode, ContextType } from './Types';
import type { Container } from '../dom/DOMOperator';

import { getNSCtx } from '../dom/DOMOperator';
import { ContextProvider } from './vnode/VNodeTags';

// 保存的是“http://www.w3.org/1999/xhtml”或“http://www.w3.org/2000/svg”，
// 用于识别是使用document.createElement()还是使用document.createElementNS()创建DOM
let ctxNamespace = '';

// capture阶段设置
export function setNamespaceCtx(vNode: VNode, dom?: Container) {
  const nextContext = getNSCtx(ctxNamespace, vNode.type, dom);

  vNode.context = ctxNamespace;

  ctxNamespace = nextContext;
}

// bubble阶段恢复
export function resetNamespaceCtx(vNode: VNode) {
  ctxNamespace = vNode.context;
}

export function getNamespaceCtx(): string {
  return ctxNamespace;
}

export function setContext<T>(providerVNode: VNode, nextValue: T) {
  const context: ContextType<T> = providerVNode.type._context;

  providerVNode.context = context.value;

  context.value = nextValue;
}

export function resetContext(providerVNode: VNode) {
  const context: ContextType<any> = providerVNode.type._context;

  context.value = providerVNode.context;
}

// 在局部更新时，恢复父节点的context
export function recoverParentContext(vNode: VNode) {
  let parent = vNode.parent;

  while (parent !== null) {
    if (parent.tag === ContextProvider) {
      setContext(parent, parent.props.value);
    }
    parent = parent.parent;
  }
}


