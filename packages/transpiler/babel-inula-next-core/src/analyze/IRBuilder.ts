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
  FunctionalExpression,
  HookNode,
  IRBlock,
  IRScope,
  IRStmt,
  LifeCycle,
} from './types';
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

// 定义基础对象接口
interface ReactiveInfo {
  name: string;
  id: string;
  bit: number;
}
// 定义数据管理器类
class ReactiveMap {
  private entities: Map<string, ReactiveInfo>;
  private nameToId: Map<string, string>;
  private idToBit: Map<string, number>;

  constructor() {
    this.entities = new Map<string, ReactiveInfo>();
    this.nameToId = new Map<string, string>();
    this.idToBit = new Map<string, number>();
  }

  /**
   * 添加新对象
   * @param name 对象名称
   * @param id 对象ID
   * @param bit 位标志
   * @returns 新添加的对象
   */
  public add(name: string, id: string, bit: number): ReactiveInfo {
    const obj: ReactiveInfo = { name, id, bit };

    this.entities.set(id, obj);
    this.nameToId.set(name, id);
    this.idToBit.set(id, bit);

    return obj;
  }

  /**
   * 通过name查找id
   * @param name 对象名称
   * @returns 对象ID或undefined
   */
  public getIdByName(name: string): string | undefined {
    return this.nameToId.get(name);
  }

  /**
   * 通过id查找bit
   * @param id 对象ID
   * @returns bit值或undefined
   */
  public getBitById(id: string): number | undefined {
    return this.idToBit.get(id);
  }

  /**
   * 获取完整对象
   * @param id 对象ID
   * @returns 完整对象或undefined
   */
  public getObjectById(id: string): ReactiveInfo | undefined {
    return this.entities.get(id);
  }

  /**
   * 更新对象的bit值
   * @param id 对象ID
   * @param newBit 新的bit值
   * @returns 更新是否成功
   */
  public updateBit(id: string, newBit: number): boolean {
    const obj = this.entities.get(id);
    if (obj) {
      obj.bit = newBit;
      this.idToBit.set(id, newBit);
      return true;
    }
    return false;
  }

  /**
   * 清理符合条件的对象
   * @param bitCondition 判断函数，返回true的对象将被删除
   */
  public cleanup(bitCondition: (bit: number) => boolean): void {
    for (const [id, obj] of this.entities) {
      if (bitCondition(obj.bit)) {
        this.nameToId.delete(obj.name);
        this.idToBit.delete(id);
        this.entities.delete(id);
      }
    }
  }

  /**
   * 获取所有对象
   * @returns 所有对象的数组
   */
  public getAllObjects(): ReactiveInfo[] {
    return Array.from(this.entities.values());
  }

  /**
   * 获取存储的对象数量
   * @returns 对象数量
   */
  public size(): number {
    return this.entities.size;
  }

  /**
   * 检查是否包含指定ID的对象
   * @param id 对象ID
   * @returns 是否存在
   */
  public has(id: string): boolean {
    return this.entities.has(id);
  }
}

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
      node: varInfo.node,
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
    this.#current.scope.usedIdBits |= dependency.depIdBitmap;
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

    function traverse(node: ComponentNode | HookNode) {
      while (node) {
        node.body.forEach(stmt => {
          if (stmt.type === 'subComp') {
            traverse(stmt.component);
          }
          node.scope.waveMap = buildWaveMap(node);
        });
      }
    }
    return this.#current;
  }
}

function buildWaveMap(block: IRBlock) {
  block.body.forEach(stmt => {
    if (stmt.type === 'derived') {
      stmt.dependency.dependencies.forEach(dep => {});
    }
  });
  return waveMap;
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
