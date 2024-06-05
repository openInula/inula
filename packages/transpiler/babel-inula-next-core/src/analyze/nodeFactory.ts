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
import {
  ComponentNode,
  FunctionalExpression,
  LifeCycle,
  ReactiveVariable,
  Dependency,
  BaseVariable,
  MethodVariable,
} from './types';
import { Bitmap, ViewParticle } from '@openinula/reactivity-parser';

export function createComponentNode(
  name: string,
  fnNode: NodePath<FunctionalExpression>,
  parent?: ComponentNode
): ComponentNode {
  const comp: ComponentNode = {
    type: 'comp',
    params: fnNode.node.params,
    level: parent ? parent.level + 1 : 0,
    name,
    children: undefined,
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

export function addVariable(
  comp: ComponentNode,
  varInfo: BaseVariable<t.Expression | null>,
  dependency: Dependency | null
) {
  // The index of the variable in the availableVariables
  const idx = comp.availableVariables.length;
  const bit = 1 << idx;
  const fullDepBits = dependency?._fullDepMask;
  const bitmap = fullDepBits ? fullDepBits | bit : bit;

  if (fullDepBits) {
    comp.usedBit |= fullDepBits;
  }
  comp._reactiveBitMap.set(varInfo.name, bitmap);
  comp.variables.push({
    ...varInfo,
    type: 'reactive',
    _fullBits: bitmap,
    level: comp.level,
    dependency: dependency?._fullDepMask ? dependency : null,
  });
}

export function addMethod(comp: ComponentNode, methodInfo: BaseVariable<MethodVariable['value']>) {
  comp.variables.push({ ...methodInfo, type: 'method' });
}

export function addSubComponent(comp: ComponentNode, subComp: ComponentNode) {
  comp.usedBit |= subComp.usedBit;
  comp.variables.push({ ...subComp, type: 'subComp' });
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
  dependency: Dependency
) {
  // if watch not exist, create a new one
  if (!comp.watch) {
    comp.watch = [];
  }
  comp.usedBit |= dependency._fullDepMask;
  comp.watch.push({
    callback,
    dependency: dependency._fullDepMask ? dependency : null,
  });
}

export function setViewChild(comp: ComponentNode, view: ViewParticle[], usedBit: Bitmap) {
  // TODO: Maybe we should merge
  comp.usedBit |= usedBit;
  comp.children = view;
}
