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

import { BaseVariable, ComponentNode, CompOrHook, FunctionalExpression, HookNode, IRStmt, LifeCycle } from './types';
import { createIRNode } from './nodeFactory';
import type { NodePath } from '@babel/core';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { COMPONENT, PropType, reactivityFuncNames, WILL_MOUNT } from '../constants';
import {
  Bitmap,
  Dependency,
  getDependenciesFromNode,
  parseReactivity,
  genReactiveBitMap,
} from '@openinula/reactivity-parser';
import { assertComponentNode, assertHookNode } from './utils';
import { parseView as parseJSX } from '@openinula/jsx-view-parser';
import { pruneUnusedState } from './pruneUnusedState';

export class IRBuilder {
  #current: HookNode | ComponentNode;
  readonly #htmlTags: string[];
  reactiveId = 0;

  getNextId() {
    return this.reactiveId++;
  }

  addStmt(stmt: IRStmt) {
    this.#current.body.push(stmt);
  }

  addDeclaredReactive(name: string, id?: number) {
    this.#current.scope.reactiveMap.set(name, id ?? this.getNextId());
  }

  getDependency(node: t.Expression | t.Statement) {
    const fullReactiveMap = new Map(this.#current.scope.reactiveMap);
    let next = this.#current.parent;
    while (next) {
      next.scope.reactiveMap.forEach((id, name) => {
        if (!fullReactiveMap.has(name)) {
          fullReactiveMap.set(name, id);
        }
      });
      next = next.parent;
    }

    return getDependenciesFromNode(node, genReactiveBitMap(fullReactiveMap), reactivityFuncNames);
  }

  constructor(name: string, type: CompOrHook, fnNode: NodePath<FunctionalExpression>, htmlTags: string[]) {
    this.#current = createIRNode(name, type, fnNode);
    this.#htmlTags = htmlTags;
  }

  addRawStmt(stmt: t.Statement) {
    this.addStmt({
      type: 'raw',
      value: stmt,
    });
  }

  addProps(name: string, value: t.Identifier) {
    this.addDeclaredReactive(name);
    this.addStmt({
      name,
      value,
      type: PropType.WHOLE,
    });
  }

  addRestProps(name: string) {
    // check if the props is initialized
    this.addDeclaredReactive(name);
    this.addStmt({
      name,
      type: PropType.REST,
    });
  }

  addSingleProp(name: string, valPath: NodePath<t.Expression | t.PatternLike>, node: t.ObjectProperty) {
    const value = valPath.node;

    const index = this.getNextId();
    if (valPath.isObjectPattern() || valPath.isArrayPattern()) {
      const destructuredNames = searchNestedProps(valPath);

      // All destructured names share the same index
      destructuredNames.forEach(name => this.addDeclaredReactive(name, index));
      this.addStmt({
        name,
        value,
        type: PropType.SINGLE,
        node,
        destructuredNames,
      });
    } else {
      if (valPath.isIdentifier() && valPath.node.name !== name) {
        name = valPath.node.name;
      }
      this.addDeclaredReactive(name, index);
      this.addStmt({
        name,
        value,
        type: PropType.SINGLE,
        node,
      });
    }
  }

  addVariable(varInfo: BaseVariable<t.Expression | null>) {
    const id = varInfo.id;
    const index = this.getNextId();
    if (id.isIdentifier()) {
      this.addDeclaredReactive(id.node.name, index);
    } else if (id.isObjectPattern() || id.isArrayPattern()) {
      const destructuredNames = searchNestedProps(id);
      destructuredNames.forEach(name => {
        this.addDeclaredReactive(name, index);
      });
    } else {
      throw new Error('Invalid variable LVal');
    }

    const value = varInfo.value;
    if (value) {
      const dependency = this.getDependency(value);

      if (dependency) {
        this.addUsedReactives(dependency);
        this.addStmt({
          type: 'derived',
          id: id.node,
          value,
          dependency,
        });

        return;
      }
    }

    this.addStmt({
      type: 'state',
      name: id.node,
      value,
    });
  }

  private findReactiveId(name: string) {
    let next: HookNode | ComponentNode | undefined = this.#current;
    while (next) {
      const id = next.scope.reactiveMap.get(name);
      if (id !== undefined) {
        return id;
      }
      next = next.parent;
    }
  }

  private addUsedReactives(dependency: Dependency) {
    dependency.dependencies.forEach(name => {
      const id = this.findReactiveId(name);

      if (id !== undefined) {
        this.#current.scope.usedIdBits |= 1 << id;
      } else {
        throw new Error(`Reactive ${name} is not declared`);
      }
    });
  }

  addSubComponent(subComp: ComponentNode) {
    this.#current.scope.usedIdBits |= subComp.scope.usedIdBits;
    this.addStmt({
      type: 'subComp',
      component: subComp,
      name: subComp.name,
    });
  }

  addLifecycle(lifeCycle: LifeCycle, block: t.Statement) {
    this.addStmt({
      type: 'lifecycle',
      lifeCycle,
      block,
    });
  }

  addWillMount(stmt: t.Statement) {
    this.addLifecycle(WILL_MOUNT, stmt);
  }

  addWatch(callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>, dependency: Dependency) {
    this.addUsedReactives(dependency);
    this.addStmt({
      type: 'watch',
      callback,
      dependency,
    });
  }

  setViewChild(viewNode: t.JSXElement | t.JSXFragment) {
    assertComponentNode(this.#current);

    const viewUnits = parseJSX(viewNode, {
      babelApi: getBabelApi(),
      htmlTags: this.#htmlTags,
      parseTemplate: false,
    });

    const [viewParticles, useIdBits] = parseReactivity(viewUnits, {
      babelApi: getBabelApi(),
      reactiveIndexMap: this.#current.scope.reactiveMap,
      reactivityFuncNames,
    });

    // TODO: Maybe we should merge
    this.#current.scope.usedIdBits |= useIdBits;
    this.#current.children = viewParticles;
  }

  setReturnValue(expression: t.Expression) {
    assertHookNode(this.#current);
    const dependency = getDependenciesFromNode(expression, this.#current.scope.reactiveMap, reactivityFuncNames);

    if (dependency) {
      this.addUsedReactives(dependency);
    }
    (this.#current as HookNode).children = { value: expression, ...dependency };
  }

  checkSubComponent(subCompName: string) {
    return !!this.#current.body.find(sub => sub.type === 'subComp' && sub.name === subCompName);
  }

  startSubComponent(name: string, fnNode: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>) {
    assertComponentNode(this.#current);
    this.#current = createIRNode(name, COMPONENT, fnNode, this.#current);
  }

  endSubComponent() {
    const subComp = this.#current as ComponentNode; // we start from a component node
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
