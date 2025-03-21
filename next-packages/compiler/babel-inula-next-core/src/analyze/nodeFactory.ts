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

import { NodePath } from '@babel/core';
import { ComponentNode, FunctionalExpression, CompOrHook, HookNode, IRScope } from './types';
import { COMPONENT } from '../constants';

export function createIRNode<T extends CompOrHook>(
  name: string,
  type: T,
  fnNode: NodePath<FunctionalExpression>,
  parent?: ComponentNode
): HookNode | ComponentNode {
  const parentScope = parent?.scope;
  const comp: HookNode | ComponentNode = {
    type: type === COMPONENT ? 'comp' : 'hook',
    params: fnNode.node.params,
    name,
    body: [
      {
        type: 'init',
      },
    ],
    parent,
    fnNode,
    scope: createScope(parentScope),
  };

  return comp;
}

function createScope(parentScope: IRScope | undefined) {
  return {
    level: parentScope ? parentScope.level + 1 : 0,
    reactiveMap: new Map<string, number>(),
    usedIdBits: 0,
  };
}
