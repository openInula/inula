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
import { ViewParticle, PrevMap } from '@openinula/reactivity-parser';

export type LifeCycle = typeof WILL_MOUNT | typeof ON_MOUNT | typeof WILL_UNMOUNT | typeof ON_UNMOUNT;
type Bitmap = number;

export type FunctionalExpression = t.FunctionExpression | t.ArrowFunctionExpression;

interface BaseVariable<V> {
  name: string;
  value: V;
}

export interface ReactiveVariable extends BaseVariable<t.Expression | null> {
  type: 'reactive';
  level: number;
  bitmap?: Bitmap;
  // need a flag for computed to gen a getter
  // watch is a static computed
  isComputed: boolean;
}

export interface MethodVariable extends BaseVariable<FunctionalExpression> {
  type: 'method';
}

export interface SubCompVariable extends BaseVariable<ComponentNode> {
  type: 'subComp';
}

export type Variable = ReactiveVariable | MethodVariable | SubCompVariable;

export interface Prop {
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
  level: number;
  // The variables defined in the component
  variables: Variable[];
  /**
   * The used properties in the component
   */
  usedPropertySet?: Set<string>;
  /**
   * The available props for the component, including the nested props
   */
  availableProps: string[];
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
    bit: Bitmap;
    deps: NodePath<t.ArrayExpression> | null;
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
