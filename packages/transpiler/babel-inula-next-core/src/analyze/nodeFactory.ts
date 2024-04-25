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
import { Branch, ComponentNode, CondNode, InulaNode, JSX, JSXNode, LifeCycle, SubCompNode } from './types';
import { PropType } from '../constants';

export function createComponentNode(
  name: string,
  fnNode: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>,
  parent?: ComponentNode
): ComponentNode {
  const comp: ComponentNode = {
    type: 'comp',
    name,
    props: [],
    child: undefined,
    properties: [],
    dependencyMap: {},
    reactiveMap: {},
    lifecycle: {},
    parent,
    // fnBody,
    get availableProps() {
      return comp.props
        .map(({ name, nestedProps, alias }) => {
          const nested = nestedProps ? nestedProps.map(name => name) : [];
          return [alias ? alias : name, ...nested];
        })
        .flat();
    },
    get ownAvailableProperties() {
      return [...comp.properties.filter(p => !p.isMethod).map(({ name }) => name), ...comp.availableProps];
    },
    get availableProperties() {
      return [...comp.ownAvailableProperties, ...(comp.parent ? comp.parent.availableProperties : [])];
    },
  };

  return comp;
}

export function addProperty(comp: ComponentNode, name: string, value: t.Expression | null, isComputed: boolean) {
  comp.properties.push({ name, value, isComputed, isMethod: false });
}

export function addMethod(comp: ComponentNode, name: string, value: t.Expression | null) {
  comp.properties.push({ name, value, isComputed: false, isMethod: true });
}

export function addSubComponent(comp: ComponentNode, subComp: ComponentNode, isComputed: boolean) {
  comp.properties.push({ name: subComp.name, value: subComp, isSubComp: true, isComputed, isMethod: false });
}

export function addProp(
  comp: ComponentNode,
  type: PropType,
  key: string,
  defaultVal: t.Expression | null = null,
  alias: string | null = null,
  nestedProps: string[] | null = null,
  nestedRelationship: t.ObjectPattern | t.ArrayPattern | null = null
) {
  comp.props.push({ name: key, type, default: defaultVal, alias, nestedProps, nestedRelationship });
}

export function addLifecycle(comp: ComponentNode, lifeCycle: LifeCycle, block: NodePath<t.BlockStatement>) {
  const compLifecycle = comp.lifecycle;
  if (!compLifecycle[lifeCycle]) {
    compLifecycle[lifeCycle] = [];
  }
  compLifecycle[lifeCycle]!.push(block);
}

export function addWatch(
  comp: ComponentNode,
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>,
  deps: NodePath<t.ArrayExpression> | null
) {
  // if watch not exist, create a new one
  if (!comp.watch) {
    comp.watch = [];
  }
  comp.watch.push({ callback, deps });
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
