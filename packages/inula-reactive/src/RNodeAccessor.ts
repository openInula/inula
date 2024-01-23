/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import { isFunction } from './Utils';
import { RProxyNode } from './RProxyNode';

export function getRNodeVal(node: RProxyNode<any>): any {
  let currentNode = node;
  const keys: (string | symbol)[] = [];
  while (currentNode.key !== null && currentNode.parent !== null) {
    keys.push(currentNode.key);
    currentNode = currentNode.parent;
  }

  let rawObj = node.root?.$;
  for (let i = keys.length - 1; i >= 0; i--) {
    if (keys[i] !== undefined && rawObj) {
      rawObj = rawObj[keys[i]];
    }
  }

  return rawObj;
}

export function setRNodeVal(rNode: RProxyNode<any>, value: unknown): void {
  const parent = rNode.parent;
  const key = rNode.key!;
  const isRoot = parent === null;
  let prevValue: unknown;
  let newValue: unknown;

  if (isRoot) {
    prevValue = rNode.root!.$;
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    rNode.root!.$ = newValue;
  } else {
    const parentVal = getRNodeVal(parent!);
    prevValue = parentVal[key];
    newValue = isFunction<(...prev: any) => any>(value) ? value(prevValue) : value;
    parentVal[key] = newValue;
  }
}

export function getRootRNode(node: RProxyNode<any>): RProxyNode {
  let currentNode = node;
  const keys: (string | symbol)[] = [];
  while (currentNode.parent !== null) {
    currentNode = currentNode.parent;
  }

  return currentNode;
}

export function setExtendProp(rNode: RProxyNode, key: string, value: any) {
  rNode.extend = rNode.extend || {};
  rNode.extend[key] = value;
}

export function getExtendProp(rNode: RProxyNode, key: string, defaultValue: any) {
  rNode.extend = rNode.extend || {};
  if (key in rNode.extend) {
    return rNode.extend[key];
  } else {
    rNode.extend[key] = defaultValue;
    return defaultValue;
  }
}
