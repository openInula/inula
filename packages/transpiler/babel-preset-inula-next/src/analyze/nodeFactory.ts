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

import { NodePath, type types as t } from '@babel/core';
import { Branch, ComponentNode, CondNode, InulaNode, JSX, JSXNode, SubCompNode } from './types';
import { iterateFCBody } from './index';

export function createComponentNode(
  name: string,
  fnBody: NodePath<t.Statement>[],
  parent?: ComponentNode
): ComponentNode {
  const comp: ComponentNode = {
    type: 'comp',
    name,
    props: {},
    child: undefined,
    subComponents: [],
    methods: [],
    state: [],
    parent,
    fnBody,
  };

  iterateFCBody(fnBody, comp);

  return comp;
}

export function addState(comp: ComponentNode, name: string, value: t.Expression | null) {
  comp.state.push({ name, value });
}

export function addMethod(comp: ComponentNode, method: NodePath<t.FunctionDeclaration>) {
  comp.methods.push(method);
}

export function createJSXNode(parent: ComponentNode, content: NodePath<JSX>): JSXNode {
  return {
    type: 'jsx',
    parent,
    child: content,
  };
}

export function createCondNode(parent: ComponentNode, child: InulaNode, branches: Branch[]): CondNode {
  return {
    type: 'cond',
    branches,
    child,
    parent,
  };
}

export function createSubCompNode(name: string, parent: ComponentNode, child: JSX): SubCompNode {
  return {
    type: 'subComp',
    name,
    parent,
    child,
  };
}
