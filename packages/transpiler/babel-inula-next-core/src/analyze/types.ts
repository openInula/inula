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

import { type NodePath, types as t } from '@babel/core';
import { ON_MOUNT, ON_UNMOUNT, PropType, WILL_MOUNT, WILL_UNMOUNT } from '../constants';
import { Bitmap, ViewParticle } from '@openinula/reactivity-parser';

export type LifeCycle = typeof WILL_MOUNT | typeof ON_MOUNT | typeof WILL_UNMOUNT | typeof ON_UNMOUNT;
export type Dependency = {
  dependenciesNode: t.ArrayExpression;
  /**
   * Only contains the bit of direct dependencies and not contains the bit of used variables
   * So it's configured in pruneUnusedBit.ts
   */
  depMask?: Bitmap;
  /**
   * The bitmap of each dependency
   */
  depBitmaps: Bitmap[];
  fullDepMask: Bitmap;
};
export type FunctionalExpression = t.FunctionExpression | t.ArrowFunctionExpression;

export interface BaseVariable<V> {
  name: string;
  value: V;
  kind: t.VariableDeclaration['kind'];
}

export interface ReactiveVariable extends BaseVariable<t.Expression | null> {
  type: 'reactive';
  level: number;
  /**
   * The bitmap of the variable that should be used in the codegen
   */
  bit?: Bitmap;
  /**
   * Contains the bit of all dependencies graph
   * i.e.
   * let name = 'John';  // name's _fullBits is 0x0001
   * let age = 18;       // age's _fullBits is 0x0010
   * let greeting = `Hello, ${name}`; // greeting's _fullBits is 0x0101
   */
  _fullBits: Bitmap;
  dependency: Dependency | null;
}

/**
 * A variable that is not reactive, it comes from the reactive variable after the unused variable pruning.
 */
export interface PlainVariable extends BaseVariable<t.Expression | null> {
  type: 'plain';
}

export interface MethodVariable extends BaseVariable<FunctionalExpression | t.FunctionDeclaration> {
  type: 'method';
}

export type SubCompVariable = ComponentNode<'subComp'>;

export type Variable = ReactiveVariable | MethodVariable | SubCompVariable | PlainVariable;

export interface Prop {
  name: string;
  type: PropType;
  alias: string | null;
  default: t.Expression | null;
  nestedProps: string[] | null;
  nestedRelationship: t.ObjectPattern | t.ArrayPattern | null;
}

export interface ComponentNode<Type = 'comp'> {
  type: Type;
  name: string;
  level: number;
  // The variables defined in the component
  variables: Variable[];
  usedBit: Bitmap;
  /**
   * The map to find the reactive bitmap by name
   */
  _reactiveBitMap: Map<string, Bitmap>;
  /**
   * The available variables and props owned by the component
   */
  ownAvailableVariables: ReactiveVariable[];
  /**
   * The available variables and props for the component and its parent
   */
  availableVariables: ReactiveVariable[];
  children?: (ComponentNode | ViewParticle)[];
  parent?: ComponentNode;
  /**
   * The function body of the fn component code
   */
  fnNode: NodePath<FunctionalExpression>;
  lifecycle: Partial<Record<LifeCycle, t.Statement[]>>;
  /**
   * The watch fn in the component
   */
  watch?: {
    dependency: Dependency | null;
    callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  }[];
}

export interface AnalyzeContext {
  level: number;
  current: ComponentNode;
  analyzers: Analyzer[];
  htmlTags: string[];
  traverse: (p: NodePath<t.Statement>, ctx: AnalyzeContext) => void;
  unhandledNode: t.Statement[];
}

export type Visitor<S = AnalyzeContext> = {
  [Type in t.Statement['type']]?: (path: NodePath<Extract<t.Statement, { type: Type }>>, state: S) => void;
} & {
  Prop?: (path: NodePath<t.ObjectProperty | t.RestElement>, state: S) => void;
};
export type Analyzer = () => Visitor;

export interface FnComponentDeclaration extends t.FunctionDeclaration {
  id: t.Identifier;
}
