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

import { NodePath, types as t } from '@babel/core';
import { Node } from '@babel/traverse';

// --- Node shape ---
export type InulaNode = ComponentNode | CondNode | JSXNode;
export type JSX = t.JSXElement | t.JSXFragment;

type defaultVal = any | null;
type Bitmap = number;
interface Reactive {
  name: string;
  value: t.Expression | null;
  // indicate the value is a state or computed or watch
  listeners: string[];
  bitmap: Bitmap;
  // need a flag for computed to gen a getter
  // watch is a static computed
  isComputed: boolean;
}

export interface ComponentNode {
  type: 'comp';
  name: string;
  props: Record<string, defaultVal>;
  // A valuable could be a state or computed
  valuable: Reactive;
  methods: NodePath<t.FunctionDeclaration>[];
  child?: InulaNode;
  subComponents: ComponentNode[];
  parent?: ComponentNode;
  /**
   * The function body of the fn component code
   */
  // fnBody: NodePath<t.Statement>[];
  // a map to find the state
  reactiveMap: Record<string, Bitmap>;
  level: number;
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
  index: number;
  currentComponent: ComponentNode;
  restStmt: NodePath<t.Statement>[];
  // --- flow control ---
  /**
   * ignore the rest of the statements
   */
  skipRest: () => void;
  traverse: (p: NodePath<t.Statement>, ctx: AnalyzeContext) => void;
}

export type Visitor<S = AnalyzeContext> = {
  [Type in Node['type']]?: (path: NodePath<Extract<Node, { type: Type }>>, state: S) => void;
};
export type Analyzer = () => Visitor;

export interface FnComponentDeclaration extends t.FunctionDeclaration {
  id: t.Identifier;
}
