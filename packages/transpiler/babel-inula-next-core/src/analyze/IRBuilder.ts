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
  DerivedSource,
  DerivedStmt,
  FunctionalExpression,
  HookNode,
  IRBlock,
  IRStmt,
  LifeCycle,
  PARAM_PROPS,
  PropsSource,
  RestPropStmt,
  SinglePropStmt,
  StateStmt,
  WholePropStmt,
} from './types';
import { createIRNode } from './nodeFactory';
import type { NodePath } from '@babel/core';
import { getBabelApi, types as t } from '@openinula/babel-api';
import { COMPONENT, isPropStmt, PropType, reactivityFuncNames } from '../constants';
import { Dependency, getDependenciesFromNode, parseReactivity } from '@openinula/reactivity-parser';
import { assertComponentNode, assertHookNode, isUseHook } from './utils';
import { AllowedJSXNode, parseView as parseJSX } from '@openinula/jsx-view-parser';
import { pruneUnusedState } from './pruneUnusedState';
import { assertIdOrDeconstruct, bitmapToIndices } from '../utils';
import { CompilerError } from '@openinula/error-handler';

function trackSource(waveBitsMap: Map<number, number>, stmt: DerivedStmt, ownBit: number) {
  // Then, we need to find the wave bits(other derived reactive dependency on it) of the derived reactive id
  const downstreamWaveBits = waveBitsMap.get(stmt.reactiveId);

  const derivedWaves = downstreamWaveBits ? downstreamWaveBits | ownBit : ownBit;

  // At last, add the derived wave bit to the source
  if (stmt.dependency) {
    bitmapToIndices(stmt.dependency.depIdBitmap).forEach(id => {
      const waveBits = waveBitsMap.get(id);
      if (waveBits) {
        waveBitsMap.set(id, waveBits | derivedWaves);
      } else {
        waveBitsMap.set(id, derivedWaves);
      }
    });
  }
}

function getWaveBits(
  idToWaveBitMap: Map<number, number>,
  stmt: StateStmt | DerivedStmt | SinglePropStmt | RestPropStmt | WholePropStmt,
  waveBitsMap: Map<number, number>
) {
  const ownBit = idToWaveBitMap.get(stmt.reactiveId);
  let waveBits = ownBit;
  if (ownBit) {
    // if ownBit exist, means the state was used. Try to find derivedState using the state
    const downstreamWaveBits = waveBitsMap.get(stmt.reactiveId) ?? 0;
    waveBits = ownBit | downstreamWaveBits;
  }
  return waveBits;
}

export class IRBuilder {
  #current: HookNode | ComponentNode;
  readonly #htmlTags: string[];
  reactiveIndex = 0;

  constructor(name: string, type: CompOrHook, fnNode: NodePath<FunctionalExpression>, htmlTags: string[]) {
    this.#current = createIRNode(name, type, fnNode);
    this.#htmlTags = htmlTags;
  }

  getNextId() {
    return 1 << this.reactiveIndex++;
  }

  addStmt(stmt: IRStmt) {
    this.#current.body.push(stmt);
  }

  addDeclaredReactive(name: string, id?: number) {
    const reactiveId = id ?? this.getNextId();
    this.#current.scope.reactiveMap.set(name, reactiveId);
    return reactiveId;
  }

  /**
   * Get tree level global reactive map
   */
  getGlobalReactiveMap() {
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

    return fullReactiveMap;
  }

  getDependency = (node: t.Expression | t.Statement) => {
    return getDependenciesFromNode(node, this.getGlobalReactiveMap(), reactivityFuncNames);
  };

  addRawStmt(stmt: t.Statement) {
    this.addStmt({
      type: 'raw',
      value: stmt,
    });
  }

  addProps(name: string, value: t.Identifier, source: PropsSource = PARAM_PROPS, ctxName?: string) {
    const reactiveId = this.addDeclaredReactive(name);
    this.addStmt({
      name,
      value,
      type: PropType.WHOLE,
      reactiveId,
      source,
      ctxName,
    });
  }

  addRestProps(name: string, source: PropsSource = PARAM_PROPS, ctxName?: string) {
    // check if the props is initialized
    const reactiveId = this.addDeclaredReactive(name);
    this.addStmt({
      name,
      type: PropType.REST,
      reactiveId,
      source,
      ctxName,
    });
  }

  addSingleProp(
    key: string | number,
    valPath: NodePath<t.Expression | t.PatternLike>,
    source: PropsSource = PARAM_PROPS,
    ctxName?: string
  ) {
    if (!valPath.isLVal()) {
      throw new CompilerError('Invalid Prop Value type: ' + valPath.type, valPath.node.loc);
    }
    const reactiveId = this.getNextId();
    const destructured = getDestructure(valPath);
    let value = valPath.node;
    let defaultValue: t.Expression | null = null;
    if (destructured) {
      const destructuredNames = searchNestedProps(destructured);

      // All destructured names share the same id
      destructuredNames.forEach(name => this.addDeclaredReactive(name, reactiveId));
    } else {
      let propName = key;
      // alias
      if (valPath.isIdentifier() && valPath.node.name !== key) {
        propName = valPath.node.name;
      }
      if (valPath.isAssignmentPattern()) {
        const left = valPath.node.left;
        if (t.isIdentifier(left) && left.name !== key) {
          propName = left.name;
        }
        value = left;
        defaultValue = valPath.node.right;
      }
      this.addDeclaredReactive(propName as string, reactiveId);
    }
    this.addStmt({
      name: key,
      reactiveId,
      value,
      type: PropType.SINGLE,
      isDestructured: !!destructured,
      defaultValue,
      source,
      ctxName,
    });
  }

  addVariable(varInfo: BaseVariable<t.Expression | null>) {
    const id = varInfo.id;
    const reactiveId = this.getNextId();
    const varIds = this.parseIdInLVal(id, reactiveId);
    const value = varInfo.value;
    if (value) {
      const dependency = this.getDependency(value);

      if (isUseHook(value)) {
        if (dependency) {
          this.addUsedReactives(dependency.depIdBitmap);
        }
        this.addStmt({
          type: 'derived',
          ids: varIds,
          lVal: id.node,
          reactiveId: reactiveId,
          value,
          source: DerivedSource.HOOK,
          dependency,
          hookArgDependencies: getHookProps(value, this.getDependency),
        });
        return;
      }

      if (dependency) {
        this.addUsedReactives(dependency.depIdBitmap);
        this.addStmt({
          type: 'derived',
          ids: varIds,
          lVal: id.node,
          reactiveId: reactiveId,
          value,
          source: DerivedSource.STATE,
          dependency,
        });

        return;
      }
    }

    this.addStmt({
      type: 'state',
      name: id.node,
      value,
      reactiveId,
      node: varInfo.node,
    });
  }

  private parseIdInLVal(id: NodePath<t.LVal>, reactiveId?: number) {
    let varIds: string[] = [];
    if (id.isIdentifier()) {
      const name = id.node.name;
      this.addDeclaredReactive(name, reactiveId);
      varIds.push(name);
    } else if (id.isObjectPattern() || id.isArrayPattern()) {
      const destructuredNames = searchNestedProps(id);
      destructuredNames.forEach(name => {
        this.addDeclaredReactive(name, reactiveId);
      });
      varIds = destructuredNames;
    }
    return varIds;
  }

  addContext(id: NodePath<t.LVal>, context: t.Identifier) {
    assertIdOrDeconstruct(id, 'Invalid Variable type when using context: ' + id.type);

    this.addStmt({
      type: 'useContext',
      lVal: id.node,
      context,
    });
  }

  private addUsedReactives(usedIdBits: number) {
    this.#current.scope.usedIdBits |= usedIdBits;
  }

  addSubComponent(subComp: ComponentNode) {
    this.#current.scope.usedIdBits |= subComp.scope.usedIdBits;
    this.addStmt({
      type: 'subComp',
      component: subComp,
      name: subComp.name,
    });
  }

  addLifecycle(lifeCycle: LifeCycle, callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>) {
    this.addStmt({
      type: 'lifecycle',
      lifeCycle,
      callback,
    });
  }

  addWatch(
    callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>,
    dependency: Dependency | null
  ) {
    if (dependency) {
      this.addUsedReactives(dependency.depIdBitmap);
    }
    this.addStmt({
      type: 'watch',
      callback,
      dependency,
    });
  }

  setViewChild(viewNode: AllowedJSXNode) {
    assertComponentNode(this.#current);

    const viewUnits = parseJSX(viewNode, {
      babelApi: getBabelApi(),
      htmlTags: this.#htmlTags,
      parseTemplate: false,
    });

    const [viewParticle, useIdBits] = parseReactivity(viewUnits, {
      babelApi: getBabelApi(),
      reactiveMap: this.getGlobalReactiveMap(),
      reactivityFuncNames,
    });

    this.addStmt({
      type: 'viewReturn',
      value: viewParticle,
    });
    this.addUsedReactives(useIdBits);
  }

  setEmptyView() {
    this.addStmt({
      type: 'viewReturn',
      value: null,
    });
  }

  setReturnValue(expression: t.Expression) {
    assertHookNode(this.#current);
    const dependency = this.getDependency(expression);

    if (dependency) {
      this.addUsedReactives(dependency.depIdBitmap);
    }
    this.addStmt({
      type: 'hookReturn',
      value: expression,
      ...dependency,
    });
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
    const idToWaveBitMap = new Map<number, number>();
    pruneUnusedState(this.#current, idToWaveBitMap);
    // wave map is a map from reactive id to wave bit
    const waveBitsMap = new Map<number, number>();

    function buildWaveMap(block: IRBlock) {
      for (let i = block.body.length - 1; i >= 0; i--) {
        const stmt = block.body[i];
        if (stmt.type === 'state' || stmt.type === 'derived' || isPropStmt(stmt)) {
          const waveBits = getWaveBits(idToWaveBitMap, stmt, waveBitsMap);
          if (waveBits) {
            waveBitsMap.set(stmt.reactiveId, waveBits);
            if (stmt.type === 'derived') {
              trackSource(waveBitsMap, stmt, waveBits);
            }
          }
        }
      }
    }

    // post order traverse to build wave map because
    // e.g. a = b, b = c, a need to know c's wave bit,
    // so we need to traverse bottom up
    function traverse(node: ComponentNode | HookNode) {
      node.body.forEach(stmt => {
        if (stmt.type === 'subComp') {
          traverse(stmt.component);
        }
      });
      buildWaveMap(node);
    }

    traverse(this.#current);
    return [this.#current, new BitManager(waveBitsMap, idToWaveBitMap)] as const;
  }
}

export class BitManager {
  constructor(
    private readonly waveBitsMap: Map<number, number>,
    private readonly idToWaveBitMap: Map<number, number>
  ) {}

  getWaveBits = (block: IRBlock, name: string) => {
    let current: IRBlock | undefined = block;
    while (current) {
      const id = current.scope.reactiveMap.get(name);
      if (id) {
        return this.waveBitsMap.get(id) ?? 0;
      }
      current = current.parent;
    }
    return 0;
  };

  getWaveBitsById = (id: number) => {
    return this.waveBitsMap.get(id) ?? 0;
  };

  getReactBits = (idBitmap: number) => {
    return bitmapToIndices(idBitmap).reduce((acc, depId) => {
      const waveBit = this.idToWaveBitMap.get(depId);
      if (waveBit) {
        return acc | waveBit;
      }
      throw new Error(`wave bit not found for id ${depId}`);
    }, 0);
  };
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

function getDestructure(path: NodePath<t.LVal>) {
  if (path.isAssignmentPattern()) {
    const left = path.get('left');
    if (left.isObjectPattern() || left.isArrayPattern()) {
      return left;
    }
  } else if (path.isObjectPattern() || path.isArrayPattern()) {
    return path;
  }
  return null;
}

function getHookProps(value: t.CallExpression, getDependency: (node: t.Expression | t.Statement) => Dependency | null) {
  const params = value.arguments;

  return params.map(param => {
    if (t.isSpreadElement(param)) {
      return getDependency(param.argument);
    }
    if (t.isArgumentPlaceholder(param)) {
      return null;
    }
    return getDependency(param);
  });
}
