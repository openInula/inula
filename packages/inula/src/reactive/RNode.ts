/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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

import { bindReactiveWithContext, currentDependent, triggerRContexts } from './RContext';
import { isAtom, isFunction, isRNode, isPrimitive } from './Utils';
import { createProxy } from './proxy/RProxyHandler';
import { Atom } from './Atom';
import { isSame } from '../renderer/utils/compare';
import { ProxyRNode, Reactive, ReactiveProxy, RNode, RootRNode } from './types';

export const nodeSymbol = Symbol('ReactiveNode');

export function createReactiveObj<T extends any>(raw?: T): ReactiveProxy<T> {
  if (isPrimitive(raw) || raw === null || raw === undefined) {
    return new Atom(raw);
  } else {
    const node = createRootRNode(raw);
    const proxyObj = createProxy<T>(node);
    node.proxy = proxyObj;
    return proxyObj as ReactiveProxy<T>;
  }
}

export function createRootRNode<T extends any>(raw?: T): RootRNode<T> {
  const root: RootRNode<T> = {
    type: nodeSymbol,
    root: { $: raw },
    parent: null,
    parentKey: null,
  };

  return root;
}

export function getOrCreateChildRNode(node: RNode, key: string | symbol): RNode {
  let child = node.children?.get(key);

  if (!child || isAtom(child)) {
    child = {
      type: nodeSymbol,
      root: node.root,
      parent: node,
      parentKey: key,
    };
    if (!node.children) {
      node.children = new Map();
    }

    node.children.set(key, child);
  }
  return child;
}

export function getOrCreateChildAtom(node: RNode, key: string | symbol, value: any): Atom {
  const child = node.children?.get(key);

  // 如果没有子节点或者子节点是RNode类型，就创建一个新的Atom，否则返回已存在的子节点
  // 注意：不能使用getNodeVal来判断之前节点的值，因为根数据已被修改，只能通过判断child的类型为
  if (!child || isRNode(child)) {
    const atom = new Atom(value, node, key);
    if (!node.children) {
      node.children = new Map();
    }
    node.children.set(key, atom);
    return atom;
  }

  return child;
}

export function getOrCreateChildNode(value: unknown, parent: RNode, key: string | symbol): Atom | RNode {
  let child: Atom | RNode;
  // if (isPrimitive(value) || value === null || value === undefined) {
  //   child = getOrCreateChildAtom(parent, key, value);
  // } else {
    child = getOrCreateChildRNode(parent, key);
  // }
  return child;
}

export function getOrCreateChildProxy(value: unknown, parent: RNode, key: string | symbol): Atom | ProxyRNode<any> {
  let child: Atom | RNode;
  // if (isPrimitive(value) || value === null || value === undefined) {
  //   child = getOrCreateChildAtom(parent, key, value);
  //   return child;
  // } else {
    child = getOrCreateChildRNode(parent, key);
    if (!child.proxy) {
      child.proxy = createProxy(child);
    }
    return child.proxy;
  // }
}

// 最终响应式数据的使用
export function trackReactiveData(reactive: Reactive) {
  if (currentDependent !== null) {
    bindReactiveWithContext(reactive, currentDependent);
  }
}

export function getRNodeVal(node: Reactive): any {
  let currentNode = node;
  const keys: (string | symbol)[] = [];
  while (currentNode.parentKey !== null && currentNode.parent !== null) {
    keys.push(currentNode.parentKey);
    currentNode = currentNode.parent;
  }

  let rawObj = node.root.$;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (keys[i] !== undefined && rawObj) {
      rawObj = rawObj[keys[i]];
    }
  }

  return rawObj;
}

export function setRNodeVal(rNode: RNode, value: unknown, trigger = false, isArrayModified = false): void {
  if (rNode.root.readOnly) {
    return;
  }

  const { parent, parentKey } = rNode;
  const isRoot = parent === null;
  let prevValue: unknown;
  let newValue: unknown;

  if (isRoot) {
    prevValue = rNode.root.$;
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    rNode.root.$ = newValue;
  } else {
    const parentVal = getRNodeVal(parent!);
    prevValue = parentVal[parentKey!];
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    parentVal[parentKey!] = newValue;
  }

  if (trigger && !isSame(newValue, prevValue)) {
    triggerRContexts(rNode, prevValue, newValue, isArrayModified);
  }
}
