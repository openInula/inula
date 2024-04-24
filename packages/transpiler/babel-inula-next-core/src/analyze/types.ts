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
import { Node } from '@babel/traverse';
import { ON_MOUNT, ON_UNMOUNT, PropType, WILL_MOUNT, WILL_UNMOUNT } from '../constants';

// --- Node shape ---
export type InulaNode = ComponentNode | CondNode | JSXNode;
export type JSX = t.JSXElement | t.JSXFragment;
export type LifeCycle = typeof WILL_MOUNT | typeof ON_MOUNT | typeof WILL_UNMOUNT | typeof ON_UNMOUNT;
type defaultVal = any | null;
type Bitmap = number;
interface Property {
  name: string;
  value: t.Expression | null;
  // indicate the value is a state or computed or watch
  listeners?: string[];
  bitmap?: Bitmap;
  // need a flag for computed to gen a getter
  // watch is a static computed
  isComputed: boolean;
  isMethod: boolean;
}
interface Prop {
  name: string;
  type: PropType;
  alias: string | null;
  default: t.Expression | null;
  nestedProps: string[] | null;
  nestedRelationship: t.ObjectPattern | t.ArrayPattern | null;
}
export interface ComponentNode {
  type: 'comp';
  name: string;
  props: Prop[];
  // A properties could be a state or computed
  properties: Property[];
  availableProperties: string[];
  /**
   * The map to find the dependencies
   */
  dependencyMap: {
    [key: string]: string[];
  };
  child?: InulaNode;
  subComponents?: ComponentNode[];
  parent?: ComponentNode;
  /**
   * The function body of the fn component code
   */
  fnBody: NodePath<t.Statement>[];
  /**
   * The map to find the state
   */
  reactiveMap: Record<string, Bitmap>;
  lifecycle: Partial<Record<LifeCycle, NodePath<t.Statement>[]>>;
  watch?: {
    deps: NodePath<t.ArrayExpression> | null;
    callback: NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;
  }[];
}

export interface SubCompNode {
  type: 'subComp';
  name: string;
  parent: ComponentNode;
  child: JSX;
}

export interface JSXNode {
  type: 'jsx';
  parent: ComponentNode;
  child: NodePath<JSX>;
}

export interface CondNode {
  type: 'cond';
  branches: Branch[];
  parent: ComponentNode;
  /**
   * The default branch
   */
  child: InulaNode;
}

export interface Branch {
  conditions: NodePath<t.Expression>[];
  content: InulaNode;
}

export interface AnalyzeContext {
  level: number;
  t: typeof t;
  current: ComponentNode;
  traverse: (p: NodePath<t.Statement>, ctx: AnalyzeContext) => void;
}

export type Visitor<S = AnalyzeContext> = {
  [Type in Node['type']]?: (path: NodePath<Extract<Node, { type: Type }>>, state: S) => void;
} & {
  Prop?: (path: NodePath<t.ObjectProperty | t.RestElement>, state: S) => void;
};
export type Analyzer = () => Visitor;

export interface FnComponentDeclaration extends t.FunctionDeclaration {
  id: t.Identifier;
}
