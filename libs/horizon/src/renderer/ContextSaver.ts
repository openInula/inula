/**
 * 保存与深度遍历相关的一些context。
 * 在深度遍历过程中，begin阶段会修改一些全局的值，在complete阶段会恢复。
 */

import type {VNode, ContextType} from './Types';
import type {Container} from '../dom/DOMOperator';

import {getNSCtx} from '../dom/DOMOperator';
import {ContextProvider} from './vnode/VNodeTags';

// 保存的是“http://www.w3.org/1999/xhtml”或“http://www.w3.org/2000/svg”，
// 用于识别是使用document.createElement()还是使用document.createElementNS()创建DOM
const CTX_NAMESPACE = 'CTX_NAMESPACE';

// 保存的是Horizon.createContext()的值，或Provider重新设置的值
const CTX_CONTEXT = 'CTX_CONTEXT';

// 旧版context API,是否更改。
const CTX_OLD_CHANGE = 'CTX_OLD_CHANGE';
// 旧版context API，保存的是的当前组件提供给子组件使用的context。
const CTX_OLD_CONTEXT = 'CTX_OLD_CONTEXT';
// 旧版context API，保存的是的上一个提供者提供给后代组件使用的context。
const CTX_OLD_PREVIOUS_CONTEXT = 'CTX_OLD_PREVIOUS_CONTEXT';

let ctxNamespace: string = '';

let ctxOldContext: Object = {};
let ctxOldChange: Boolean = false;
let ctxOldPreviousContext: Object = {};

// capture阶段设置
function setNamespaceCtx(vNode: VNode, dom?: Container) {
  const nextContext = getNSCtx(ctxNamespace, vNode.type, dom);

  vNode.setContext(CTX_NAMESPACE, ctxNamespace);
  ctxNamespace = nextContext;
}

// bubble阶段恢复
function resetNamespaceCtx(vNode: VNode) {
  ctxNamespace = vNode.getContext(CTX_NAMESPACE);
}

function getNamespaceCtx(): string {
  return ctxNamespace;
}

function setContextCtx<T>(providerVNode: VNode, nextValue: T) {
  const context: ContextType<T> = providerVNode.type._context;

  providerVNode.setContext(CTX_CONTEXT, context.value);
  context.value = nextValue;
}

function resetContextCtx(providerVNode: VNode) {
  const context: ContextType<any> = providerVNode.type._context;

  context.value = providerVNode.getContext(CTX_CONTEXT);
}

// 在局部更新时，恢复父节点的context
function recoverParentsContextCtx(vNode: VNode) {
  let parent = vNode.parent;

  while (parent !== null) {
    if (parent.tag === ContextProvider) {
      const newValue = parent.props.value;
      setContextCtx(parent, newValue);
    }
    parent = parent.parent;
  }
}

// ctxOldContext是 旧context提供者的context
function setVNodeOldContext(providerVNode: VNode, context: Object) {
  providerVNode.setContext(CTX_OLD_CONTEXT, context);
}

function getVNodeOldContext(vNode: VNode) {
  return vNode.getContext(CTX_OLD_CONTEXT);
}

function setOldContextCtx(providerVNode: VNode, context: Object) {
  setVNodeOldContext(providerVNode, context);
  ctxOldContext = context;
}

function getOldContextCtx() {
  return ctxOldContext;
}

function resetOldContextCtx(vNode: VNode) {
  ctxOldContext = getVNodeOldContext(vNode);
}

function setVNodeOldPreviousContext(providerVNode: VNode, context: Object) {
  providerVNode.setContext(CTX_OLD_PREVIOUS_CONTEXT, context);
}

function getVNodeOldPreviousContext(vNode: VNode) {
  return vNode.getContext(CTX_OLD_PREVIOUS_CONTEXT);
}

function setOldPreviousContextCtx(context: Object) {
  ctxOldPreviousContext = context;
}

function getOldPreviousContextCtx() {
  return ctxOldPreviousContext;
}

function setContextChangeCtx(providerVNode: VNode, didChange: boolean) {
  providerVNode.setContext(CTX_OLD_CHANGE, didChange);
  ctxOldChange = didChange;
}

function getContextChangeCtx() {
  return ctxOldChange;
}

function resetContextChangeCtx(vNode: VNode) {
  ctxOldChange = vNode.getContext(CTX_OLD_CHANGE);
}

export {
  getNamespaceCtx,
  resetNamespaceCtx,
  setNamespaceCtx,
  setContextCtx,
  resetContextCtx,
  recoverParentsContextCtx,
  setOldContextCtx,
  getOldContextCtx,
  resetOldContextCtx,
  setContextChangeCtx,
  getContextChangeCtx,
  resetContextChangeCtx,
  setOldPreviousContextCtx,
  getOldPreviousContextCtx,
  setVNodeOldContext,
  getVNodeOldContext,
  setVNodeOldPreviousContext,
  getVNodeOldPreviousContext,
};


