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
import { ComponentNode, FunctionalExpression, ReactiveVariable, CompOrHook, HookNode } from './types';
import { COMPONENT } from '../constants';

export function createIRNode<T extends CompOrHook>(
  name: string,
  type: T,
  fnNode: NodePath<FunctionalExpression>,
  parent?: ComponentNode
): HookNode | ComponentNode {
  const comp: HookNode | ComponentNode = {
    type: type === COMPONENT ? 'comp' : 'hook',
    params: fnNode.node.params,
    level: parent ? parent.level + 1 : 0,
    name,
    variables: [],
    usedBit: 0,
    _reactiveBitMap: parent ? new Map<string, number>(parent._reactiveBitMap) : new Map<string, number>(),
    lifecycle: {},
    parent,
    fnNode,
    get ownAvailableVariables() {
      return [...comp.variables.filter((p): p is ReactiveVariable => p.type === 'reactive')];
    },
    get availableVariables() {
      // Here is critical for the dependency analysis, must put parent's availableVariables first
      // so the subcomponent can react to the parent's variables change
      return [...(comp.parent ? comp.parent.availableVariables : []), ...comp.ownAvailableVariables];
    },
  };

  return comp;
}
