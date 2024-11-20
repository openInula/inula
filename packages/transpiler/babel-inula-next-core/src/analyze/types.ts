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
import { Dependency } from '@openinula/reactivity-parser';

export type CompOrHook = typeof COMPONENT | typeof HOOK;
export type LifeCycle = typeof WILL_MOUNT | typeof DID_MOUNT | typeof WILL_UNMOUNT | typeof DID_UNMOUNT;

export type FunctionalExpression = t.FunctionExpression | t.ArrowFunctionExpression;
export interface BaseVariable<V> {
  id: NodePath<t.LVal>;
  value: V;
  kind: t.VariableDeclaration['kind'];
  node: t.VariableDeclarator;
}
export interface SinglePropStmt {
  name: string;
  value: t.ObjectProperty['value'];
  destructuring?: t.ObjectPattern | t.ArrayPattern;
  destructuredNames?: string[];
  type: PropType.SINGLE;
  node: t.ObjectProperty;
}
export interface RestPropStmt {
  name: string;
  type: PropType.REST;
}

export interface WholePropStmt {
  name: string;
  value: t.Identifier;
  type: PropType.WHOLE;
}

export type RawStmt = {
  type: 'raw';
  value: t.Statement;
};

export type WatchStmt = {
  type: 'watch';
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  dependency: Dependency;
};

export type LifecycleStmt = {
  type: 'lifecycle';
  lifeCycle: LifeCycle;
  block: t.Statement;
};

export type InitStmt = {
  type: 'init';
};

export type SubCompStmt = {
  type: 'subComp';
  name: string;
  component: ComponentNode;
};

export type StateStmt = {
  type: 'state';
  name: t.Identifier | t.ArrayPattern | t.ObjectPattern;
  value: t.Expression | null;
  node: t.VariableDeclarator;
};

export type DerivedStmt = {
  type: 'derived';
  id: t.LVal;
  dependency: Dependency;
  value: t.Expression;
};

export type IRStmt =
  | RawStmt
  | WatchStmt
  | LifecycleStmt
  | InitStmt
  | SubCompStmt
  | DerivedStmt
  | StateStmt
  | SinglePropStmt
  | RestPropStmt
  | WholePropStmt;

export interface IRScope {
  waveMap: Map<string, number>;
  /**
   * The map to find the reactive index by name
   */
  reactiveMap: Map<string, number>;
  /**
   * The bits of the used reactive ids
   * e.g. we have 3 reactives, a,b,c, and bc is used, then usedIdBits = 0b110
   */
  usedIdBits: number;
  level: number;
}
export interface IRBlock {
  name: string;
  params: t.FunctionExpression['params'];
  body: IRStmt[];
  parent?: IRBlock;
  scope: IRScope;
  /**
   * The function body of the fn component code
   */
  fnNode: NodePath<FunctionalExpression>;
}

export interface ComponentNode<Type = 'comp'> extends IRBlock {
  type: Type;
  children?: ViewParticle[];
  parent?: ComponentNode;
}
export type SubComponentNode = ComponentNode<'subComp'>;
export interface HookNode extends IRBlock {
  type: 'hook';
  parent?: ComponentNode | HookNode;
  children?: {
    value: t.Expression;
    dependencies?: string[];
    dependenciesNode?: t.ArrayExpression;
  };
}

export interface AnalyzeContext {
  builder: IRBuilder;
  analyzers: Analyzer[];
}

export type Visitor<S = AnalyzeContext> = {
  [Type in t.Statement['type']]?: (path: NodePath<Extract<t.Statement, { type: Type }>>, state: S) => void;
} & {
  Prop?: (path: NodePath<t.RestElement | t.ObjectProperty>, state: S) => void;
  Props?: (path: NodePath<t.Identifier>, state: S) => void;
};
export type Analyzer = () => Visitor;

export interface FnComponentDeclaration extends t.FunctionDeclaration {
  id: t.Identifier;
}
