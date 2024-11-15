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
  WholeProp,
} from './types';
import { createIRNode } from './nodeFactory';
import type { NodePath } from '@babel/core';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { COMPONENT, PropType, reactivityFuncNames, WILL_MOUNT } from '../constants';
import { Bitmap, getDependenciesFromNode, parseReactivity } from '@openinula/reactivity-parser';
import { assertComponentNode, assertHookNode } from './utils';
import { parseView as parseJSX } from '@openinula/jsx-view-parser';
import { pruneUnusedState } from './pruneUnusedState';

type PlainStmt = {
  type: 'plain';
  value: t.Statement;
};

type WatchStmt = {
  type: 'watch';
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  dependency: Dependency;
};

type LifecycleStmt = {
  type: 'lifecycle';
  lifeCycle: LifeCycle;
  block: t.Statement;
};

type InitStmt = {
  type: 'init';
};

type SubCompStmt = {
  type: 'subComp';
  name: string;
  fnNode: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
};

type DerivedStmt = {
  type: 'derived';
  dependency: Dependency;
};

type IRStmt = PlainStmt | WatchStmt | LifecycleStmt | InitStmt | SubCompStmt | DerivedStmt;

export class IRBuilder {
  #current: HookNode | ComponentNode;
  readonly #htmlTags: string[];
  // The value of the reactiveMap is whether the variable is used.
  reactiveMap = new Map<string, number>();
  usedReactive = new Set<string>();
  body: IRStmt[] = [];
  indexer = 1;

  constructor(name: string, type: CompOrHook, fnNode: NodePath<FunctionalExpression>, htmlTags: string[]) {
    this.#current = createIRNode(name, type, fnNode);
    this.#htmlTags = htmlTags;
  }

  accumulateUsedBit(allDepBits: Bitmap[]) {
    this.#current.usedBit |= allDepBits.reduce((acc, cur) => acc | cur, 0);
  }

  addProps(name: string, value: t.Identifier) {
    this.reactiveMap.set(name, this.indexer++);
    this.#current.props = {
      name,
      value,
      type: PropType.WHOLE,
    };
  }

  addRestProps(name: string, value: t.Identifier) {
    // check if the props is initialized
    if (!this.#current.props) {
      this.#current.props = [];
    } else if (!Array.isArray(this.#current.props)) {
      throw new Error('props is not an array');
    }
    this.reactiveMap.set(name, this.indexer++);
    this.#current.props.push({
      name,
      value,
      type: PropType.REST,
    });
  }

  addSingleProp(name: string, path: NodePath<t.ObjectPattern | t.ArrayPattern>) {
    // check if the props is initialized
    if (!this.#current.props) {
      this.#current.props = [];
    } else if (!Array.isArray(this.#current.props)) {
      throw new Error('props is not an array');
    }
    const destructuredNames = searchNestedProps(path);
    const value = path.node;
    // All destructured names share the same index
    const index = this.indexer++;
    destructuredNames.forEach(name => {
      this.reactiveMap.set(name, index);
    });
    this.#current.props.push({
      name,
      value,
      type: PropType.SINGLE,
      destructuring: value,
      destructuredNames,
    });
  }
  addVariable(varInfo: BaseVariable<t.Expression | null>) {
    const value = varInfo.value;
    if (value) {
      const dependency = this.getDependency(value);

      if (dependency) {
        dependency.dependencies.forEach(name => {
          this.usedReactive.add(name);
        });
        this.body.push({
          type: 'derived',
          value,
          dependency,
        });
      }
    }

    // The index of the variable in the availableVariables
    const idx = this.#current.availableVariables.length;
    const bit = 1 << idx;
    const allDepBits = dependency?.allDepBits;

    if (allDepBits?.length) {
      this.accumulateUsedBit(allDepBits);
    }
    this.#current._reactiveBitMap.set(varInfo.name, bit);
    this.#current.variables.push({
      ...varInfo,
      type: 'reactive',
      bit,
      level: this.#current.level,
      dependency: allDepBits?.length ? dependency : null,
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
    this.accumulateUsedBit(dependency.allDepBits);
    this.#current.watch.push({
      callback,
      dependency: dependency.allDepBits.length ? dependency : null,
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

    this.accumulateUsedBit(dependency.allDepBits);
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

/**
 * Iterate identifier in nested destructuring, collect the identifier that can be used
 * e.g. function ({prop1, prop2: [p20X, {p211, p212: p212X}]}
 * we should collect prop1, p20X, p211, p212X
 * @param idPath
 */
export function searchNestedProps(idPath: NodePath<t.ArrayPattern | t.ObjectPattern>) {
  const nestedProps: string[] | null = [];

  if (idPath.isObjectPattern() || idPath.isArrayPattern()) {
    idPath.traverse({
      Identifier(path) {
        // judge if the identifier is a prop
        // 1. is the key of the object property and doesn't have alias
        // 2. is the item of the array pattern and doesn't have alias
        // 3. is alias of the object property
        const parentPath = path.parentPath;
        if (parentPath.isObjectProperty() && path.parentKey === 'value') {
          // collect alias of the object property
          nestedProps.push(path.node.name);
        } else if (
          parentPath.isArrayPattern() ||
          parentPath.isObjectPattern() ||
          parentPath.isRestElement() ||
          (parentPath.isAssignmentPattern() && path.key === 'left')
        ) {
          // collect the key of the object property or the item of the array pattern
          nestedProps.push(path.node.name);
        }
      },
    });
  }

  return nestedProps;
}
