/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { builtinUpdateFunc, inMount, updateCompNode } from './index.js';
import { CompNode, HookNode } from './types';
import { InulaNodeType } from '@openinula/next-shared';

export function createHookNode(parent: HookNode | CompNode, bitmap: number): HookNode {
  return {
    updateProp: builtinUpdateFunc,
    updateState: builtinUpdateFunc,
    __type: InulaNodeType.Hook,
    props: {},
    _$nodes: [],
    bitmap,
    parent,
  };
}

export function emitUpdate(node: HookNode) {
  // the new value is not used in the `updateCompNode`, just pass a null
  updateCompNode(node.parent, null, node.bitmap);
}

export function constructHook(
  node: HookNode,
  {
    value,
    updateState,
    updateProp,
    updateContext,
    getUpdateViews,
    didUnmount,
    willUnmount,
    didMount,
  }: Pick<
    HookNode,
    | 'value'
    | 'updateState'
    | 'updateProp'
    | 'updateContext'
    | 'getUpdateViews'
    | 'didUnmount'
    | 'willUnmount'
    | 'didMount'
  >
): HookNode {
  node.value = value;
  node.updateState = updateState;
  node.updateProp = updateProp;
  node.updateContext = updateContext;
  node.getUpdateViews = getUpdateViews;
  node.didUnmount = didUnmount;
  node.willUnmount = willUnmount;
  node.didMount = didMount;

  return node;
}
