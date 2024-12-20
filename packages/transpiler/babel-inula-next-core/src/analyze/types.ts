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
import { ViewParticle } from '@openinula/reactivity-parser';
import { IRBuilder } from './IRBuilder';
import { Dependency } from '@openinula/reactivity-parser';

export type CompOrHook = typeof COMPONENT | typeof HOOK;
export type LifeCycle = typeof WILL_MOUNT | typeof DID_MOUNT | typeof WILL_UNMOUNT | typeof DID_UNMOUNT;

export type FunctionalExpression = t.FunctionExpression | t.ArrowFunctionExpression;
export interface BaseVariable<V> {
  id: NodePath<t.Identifier | t.ObjectPattern | t.ArrayPattern>;
  value: V;
  kind: t.VariableDeclaration['kind'];
  node: t.VariableDeclarator;
}

export const PARAM_PROPS = 'props';
export const CTX_PROPS = 'ctx';
export type PropsSource = typeof PARAM_PROPS | typeof CTX_PROPS;

export interface SinglePropStmt {
  name: string;
  value: t.LVal;
  reactiveId: number;
  type: PropType.SINGLE;
  isDestructured: boolean;
  node: t.ObjectProperty;
  defaultValue?: t.Expression | null;
  source: PropsSource;
  ctxName?: string;
}
export interface RestPropStmt {
  name: string;
  type: PropType.REST;
  reactiveId: number;
  source: PropsSource;
  ctxName?: string;
}

export interface WholePropStmt {
  name: string;
  value: t.Identifier;
  reactiveId: number;
  type: PropType.WHOLE;
  source: PropsSource;
  ctxName?: string;
}

export type RawStmt = {
  type: 'raw';
  value: t.Statement;
};

export type WatchStmt = {
  type: 'watch';
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  dependency: Dependency | null;
};

export type LifecycleStmt = {
  type: 'lifecycle';
  callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  lifeCycle: LifeCycle;
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
  reactiveId: number;
  node: t.VariableDeclarator;
};

export type DerivedStmt = {
  type: 'derived';
  ids: string[];
  lVal: t.Identifier | t.ArrayPattern | t.ObjectPattern;
  reactiveId: number;
  dependency: Dependency;
  value: t.Expression;
};

export type ViewReturnStmt = {
  type: 'viewReturn';
  value: ViewParticle;
};

export type UseContextStmt = {
  type: 'useContext';
  ids: string[];
  lVal: t.Identifier | t.ArrayPattern | t.ObjectPattern;
  context: t.Identifier;
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
  | WholePropStmt
  | ViewReturnStmt
  | UseContextStmt;

export interface IRScope {
  waveMap: Map<string, number>;
  /**
   * The map to find the reactive id bit by name
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
  Props?: (path: NodePath<t.RestElement | t.Identifier | t.Pattern>, state: S) => void;
};
export type Analyzer = () => Visitor;

export interface FnComponentDeclaration extends t.FunctionDeclaration {
  id: t.Identifier;
}
