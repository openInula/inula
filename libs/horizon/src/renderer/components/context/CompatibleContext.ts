import type {VNode} from '../../Types';

import {
  setOldContextCtx,
  setContextChangeCtx,
  getOldContextCtx,
  resetOldContextCtx,
  resetContextChangeCtx,
  setOldPreviousContextCtx,
  getOldPreviousContextCtx,
  setVNodeOldContext,
  getVNodeOldContext,
  setVNodeOldPreviousContext,
  getVNodeOldPreviousContext,
} from '../../ContextSaver';

const emptyObject = {};

// 判断是否是过时的context的提供者
export function isOldProvider(comp: Function): boolean {
  // @ts-ignore
  const childContextTypes = comp.childContextTypes;
  return childContextTypes !== null && childContextTypes !== undefined;
}

// 判断是否是过时的context的消费者
export function isOldConsumer(comp: Function): boolean {
  // @ts-ignore
  const contextTypes = comp.contextTypes;
  return contextTypes !== null && contextTypes !== undefined;
}

// 如果是旧版context提供者，则缓存两个全局变量，上一个提供者提供的context和当前提供者提供的context
export function cacheOldCtx(processing: VNode, hasOldContext: any): void {
  // 每一个context提供者都会更新ctxOldContext
  if (hasOldContext) {
    setOldPreviousContextCtx(getOldContextCtx());

    const vNodeContext = getVNodeOldContext(processing) || emptyObject;
    setOldContextCtx(processing, vNodeContext);
  }
}

// 获取当前组件可以消费的context
export function getOldContext(processing: VNode, clazz: Function, ifProvider: boolean) {
  const type = processing.type;
  // 不是context消费者， 则直接返回空对象
  if (!isOldConsumer(type)) {
    return emptyObject;
  }

  // 当组件既是提供者，也是消费者时，取上一个context，不能直接取最新context，因为已经被更新为当前组件的context；
  // 当组件只是消费者时，则取最新context
  const parentContext = ((ifProvider && isOldProvider(clazz))) ?
    getOldPreviousContextCtx() :
    getOldContextCtx();

  // 除非父级context更改，否则不需要重新创建子context，直接取对应节点上存的。
  if (getVNodeOldPreviousContext(processing) === parentContext) {
    return getVNodeOldContext(processing);
  }

  // 从父的context中取出子定义的context
  const context = {};
  for (const key in type.contextTypes) {
    context[key] = parentContext[key];
  }

  // 缓存当前组件的context，最近祖先传递下来context，当前可消费的context
  setVNodeOldPreviousContext(processing, parentContext);
  setVNodeOldContext(processing, context);

  return context;
}

// 重置context
export function resetOldCtx(vNode: VNode): void {
  resetOldContextCtx(vNode);
  resetContextChangeCtx(vNode);
}

// 当前组件是提供者，则需要合并祖先context和当前组件提供的context
function handleContext(vNode: VNode, parentContext: Object): Object {
  const instance = vNode.realNode;

  if (typeof instance.getChildContext !== 'function') {
    return parentContext;
  }

  // 合并祖先提供的context和当前组件提供的context
  return {...parentContext, ...instance.getChildContext()};
}

// 当前组件是context提供者，更新时，需要合并祖先context和当前组件提供的context
export function updateOldContext(vNode: VNode): void {
  const ctx = handleContext(vNode, getOldPreviousContextCtx());
  // 更新context，给子组件用的context
  setOldContextCtx(vNode, ctx);
  // 标记更改
  setContextChangeCtx(vNode, true);
}
