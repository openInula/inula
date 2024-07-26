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
import { COMPONENT, DID_MOUNT, DID_UNMOUNT, HOOK, PropType, WILL_MOUNT, WILL_UNMOUNT } from '../constants';
import { Bitmap, ViewParticle } from '@openinula/reactivity-parser';
import { IRBuilder } from './IRBuilder';

export type CompOrHook = typeof COMPONENT | typeof HOOK;
export type LifeCycle = typeof WILL_MOUNT | typeof DID_MOUNT | typeof WILL_UNMOUNT | typeof DID_UNMOUNT;
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
  _fullDepBits: Bitmap[];
  _fullDepMask: Bitmap;
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
  bit: Bitmap;
  dependency: Dependency | null;
}

export type SubCompVariable = ComponentNode<'subComp'>;

// Including static variable and method
export interface PlainVariable {
  type: 'plain';
  value: t.Statement;
}

export type Variable = ReactiveVariable | PlainVariable | SubCompVariable;

export type WatchFunc = {
  dependency: Dependency | null;
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
};

export interface Prop {
  name: string;
  type: PropType;
  alias: string | null;
  default: t.Expression | null;
  nestedProps: string[] | null;
  nestedRelationship: t.ObjectPattern | t.ArrayPattern | null;
}

export interface IRNode {
  name: string;
  level: number;
  params: t.FunctionExpression['params'];
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
  parent?: ComponentNode;
  /**
   * The function body of the fn component code
   */
  fnNode: NodePath<FunctionalExpression>;
  lifecycle: Partial<Record<LifeCycle, t.Statement[]>>;
  /**
   * The watch fn in the component
   */
  watch?: WatchFunc[];
}

export interface ComponentNode<Type = 'comp'> extends IRNode {
  type: Type;
  children?: ViewParticle[];
}
export type SubComponentNode = SubCompVariable;
export interface HookNode extends IRNode {
  type: 'hook';
  children?: {
    value: t.Expression;
    depMask?: number; // -> bit
    _fullDepBits: number[];
    dependenciesNode: t.ArrayExpression;
  };
}

export interface AnalyzeContext {
  builder: IRBuilder;
  analyzers: Analyzer[];
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
