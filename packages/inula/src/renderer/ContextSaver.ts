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
 * 保存与深度遍历相关的一些context。
 * 在深度遍历过程中，capture阶段会修改一些全局的值，在bubble阶段会恢复。
 */

import type { VNode, ContextType } from './Types';
import type { Container } from '../dom/DOMOperator';

import { getNSCtx } from '../dom/DOMOperator';

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
