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
import { ComponentNode, FunctionalExpression, LifeCycle, ViewNode } from './types';
import { PropType } from '../constants';
import { ViewParticle } from '@openinula/reactivity-parser';

export function createComponentNode(
  name: string,
  fnNode: NodePath<FunctionalExpression>,
  parent?: ComponentNode
): ComponentNode {
  const comp: ComponentNode = {
    type: 'comp',
    name,
    props: [],
    child: undefined,
    variables: [],
    dependencyMap: {},
    reactiveMap: {},
    lifecycle: {},
    parent,
    fnNode,
    get availableProps() {
      return comp.props
        .map(({ name, nestedProps, alias }) => {
          const nested = nestedProps ? nestedProps.map(name => name) : [];
          return [alias ? alias : name, ...nested];
        })
        .flat();
    },
    get ownAvailableVariables() {
      return [...comp.variables.filter(p => p.type === 'reactive').map(({ name }) => name), ...comp.availableProps];
    },
    get availableVariables() {
      return [...comp.ownAvailableVariables, ...(comp.parent ? comp.parent.availableVariables : [])];
    },
  };

  return comp;
}

export function addProperty(comp: ComponentNode, name: string, value: t.Expression | null, isComputed: boolean) {
  comp.variables.push({ name, value, isComputed, type: 'reactive' });
}

export function addMethod(comp: ComponentNode, name: string, value: FunctionalExpression) {
  comp.variables.push({ name, value, type: 'method' });
}

export function addSubComponent(comp: ComponentNode, subComp: ComponentNode) {
  comp.variables.push({ name: subComp.name, value: subComp, type: 'subComp' });
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

export function addLifecycle(comp: ComponentNode, lifeCycle: LifeCycle, block: t.BlockStatement) {
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

export function setViewChild(comp: ComponentNode, view: ViewParticle[], usedPropertySet: Set<string>) {
  const viewNode: ViewNode = {
    content: view,
    usedPropertySet,
  };
  comp.child = viewNode;
}
