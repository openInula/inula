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
import { ComponentNode, FunctionalExpression, LifeCycle, ReactiveVariable } from './types';
import { PropType } from '../constants';
import { ViewParticle, PrevMap } from '@openinula/reactivity-parser';

export function createComponentNode(
  name: string,
  fnNode: NodePath<FunctionalExpression>,
  parent?: ComponentNode
): ComponentNode {
  const comp: ComponentNode = {
    type: 'comp',
    level: parent ? parent.level + 1 : 0,
    name,
    children: undefined,
    variables: [],
    dependencyMap: parent ? { [PrevMap]: parent.dependencyMap } : {},
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

export function addProperty(comp: ComponentNode, name: string, value: t.Expression | null, deps: string[] | null) {
  comp.variables.push({ name, value, isComputed: !!deps?.length, type: 'reactive', deps });
  if (comp.dependencyMap[name] === undefined) {
    comp.dependencyMap[name] = null;
  }
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
  // TODO: Maybe we should merge
  comp.usedPropertySet = usedPropertySet;
  comp.children = view;
}
