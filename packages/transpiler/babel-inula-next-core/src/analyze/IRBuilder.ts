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

import {
  BaseVariable,
  ComponentNode,
  CompOrHook,
  Dependency,
  FunctionalExpression,
  HookNode,
  IRNode,
  LifeCycle,
  PlainVariable,
} from './types';
import { createIRNode } from './nodeFactory';
import type { NodePath } from '@babel/core';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { COMPONENT, reactivityFuncNames, WILL_MOUNT } from '../constants';
import { getDependenciesFromNode, parseReactivity } from '@openinula/reactivity-parser';
import { assertComponentNode, assertHookNode } from './utils';
import { parseView as parseJSX } from '@openinula/jsx-view-parser';
import { pruneUnusedState } from './pruneUnusedState';

export class IRBuilder {
  #current: HookNode | ComponentNode;
  readonly #htmlTags: string[];

  constructor(name: string, type: CompOrHook, fnNode: NodePath<FunctionalExpression>, htmlTags: string[]) {
    this.#current = createIRNode(name, type, fnNode);
    this.#htmlTags = htmlTags;
  }

  addVariable(varInfo: BaseVariable<t.Expression | null>) {
    const value = varInfo.value;
    const dependency =
      !value || t.isArrowFunctionExpression(value) || t.isFunctionExpression(value) ? null : this.getDependency(value);

    // The index of the variable in the availableVariables
    const idx = this.#current.availableVariables.length;
    const bit = 1 << idx;
    const fullDepBits = dependency?._fullDepMask;
    const bitmap = fullDepBits ? fullDepBits | bit : bit;

    if (fullDepBits) {
      this.#current.usedBit |= fullDepBits;
    }
    this.#current._reactiveBitMap.set(varInfo.name, bitmap);
    this.#current.variables.push({
      ...varInfo,
      type: 'reactive',
      bit: bitmap,
      level: this.#current.level,
      dependency: dependency?._fullDepMask ? dependency : null,
    });
  }

  addPlainVariable(value: PlainVariable['value']) {
    this.#current.variables.push({ value, type: 'plain' });
  }

  addSubComponent(subComp: IRNode) {
    this.#current.usedBit |= subComp.usedBit;
    this.#current.variables.push({ ...subComp, type: 'subComp' });
  }

  addLifecycle(lifeCycle: LifeCycle, block: t.Statement) {
    const compLifecycle = this.#current.lifecycle;
    if (!compLifecycle[lifeCycle]) {
      compLifecycle[lifeCycle] = [];
    }
    compLifecycle[lifeCycle]!.push(block);
  }

  addWillMount(stmt: t.Statement) {
    this.addLifecycle(WILL_MOUNT, stmt);
  }

  addWatch(callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>, dependency: Dependency) {
    // if watch not exist, create a new one
    if (!this.#current.watch) {
      this.#current.watch = [];
    }
    this.#current.usedBit |= dependency._fullDepMask;
    this.#current.watch.push({
      callback,
      dependency: dependency._fullDepMask ? dependency : null,
    });
  }

  setViewChild(viewNode: t.JSXElement | t.JSXFragment) {
    assertComponentNode(this.#current);

    const viewUnits = parseJSX(viewNode, {
      babelApi: getBabelApi(),
      htmlTags: this.#htmlTags,
      parseTemplate: false,
    });

    const [viewParticles, usedBit] = parseReactivity(viewUnits, {
      babelApi: getBabelApi(),
      depMaskMap: this.#current._reactiveBitMap,
      reactivityFuncNames,
    });

    // TODO: Maybe we should merge
    this.#current.usedBit |= usedBit;
    this.#current.children = viewParticles;
  }

  setReturnValue(expression: t.Expression) {
    assertHookNode(this.#current);
    const dependency = getDependenciesFromNode(expression, this.#current._reactiveBitMap, reactivityFuncNames);

    this.#current.usedBit |= dependency._fullDepMask;
    this.#current.children = { value: expression, ...dependency };
  }

  getDependency(node: t.Expression | t.Statement) {
    return getDependenciesFromNode(node, this.#current._reactiveBitMap, reactivityFuncNames);
  }

  checkSubComponent(subCompName: string) {
    return !!this.#current.variables.find(sub => sub.type === 'subComp' && sub.name === subCompName);
  }

  startSubComponent(name: string, fnNode: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>) {
    assertComponentNode(this.#current);
    this.#current = createIRNode(name, COMPONENT, fnNode, this.#current);
  }

  endSubComponent() {
    const subComp = this.#current;
    this.#current = this.#current.parent!;
    this.addSubComponent(subComp);
  }

  build() {
    pruneUnusedState(this.#current);
    return this.#current;
  }
}
