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

import { InulaNodeType } from '@openinula/next-shared';

export type Lifecycle = () => void;
export type ScopedLifecycle = Lifecycle[];

export { type Properties as CSSProperties } from 'csstype';

export type InulaNode = VNode | TextNode | InulaHTMLNode;

export interface VNode {
  __type: InulaNodeType;
  _$nodes: InulaNode[];
  _$parentEl?: InulaHTMLNode;
  $nonkeyedCache?: Record<string, unknown[]>;
}

export interface TextNode extends Text {
  deps: unknown[];
}

export interface InulaHTMLNode extends HTMLElement {
  _$nodes: InulaNode[];
  _prevStyle?: CSSStyleDeclaration;
  [key: `$on${string}`]: EventListener
  [key: `$$${string}`]: EventListener
}

export interface ComposableNode<Props extends Record<PropertyKey, any> = Record<PropertyKey, any>> extends VNode {
  __type: InulaNodeType;
  parent?: ComposableNode;
  props: Props;
  cache?: Record<string, any>;
  _$nodes: InulaHTMLNode[];
  mounting?: boolean;
  _$unmounted?: boolean;
  _$forwardPropsSet?: Set<HTMLElement | ComposableNode>;
  _$forwardPropsId?: string[];
  _$contentKey?: string;
  _$depNumsToUpdate?: number[];
  updateState: (bit: number) => void;
  updateProp: (...args: any[]) => void;
  updateContext?: (context: any, key: string, value: any) => void;
  getUpdateViews?: () => any;
  didUnmount?: () => void;
  willUnmount?: () => void;
  didMount?: () => void;
  updateView?: (depNum: number) => void;
}

export interface CompNode extends ComposableNode {
  __type: InulaNodeType.Comp;
}

export interface HookNode extends ComposableNode {
  __type: InulaNodeType.Hook;
  bitmap: number;
  parent: HookNode | CompNode;
  value?: () => unknown;
}

/**
 * @brief Mutable node is a node that this._$nodes can be changed, things need to pay attention:
 *  1. The context of the new nodes should be the same as the old nodes
 *  2. The new nodes should be added to the parentEl
 *  3. The old nodes should be removed from the parentEl
 */
export interface MutableNode<UnmountShape = ScopedLifecycle> extends VNode {
  willUnmountFuncs: UnmountShape;
  didUnmountFuncs: UnmountShape;
  savedContextNodes: Map<symbol, ContextNode<any>> | null;
}

export interface CondNode extends MutableNode {
  cond: number;
  didntChange: boolean;
  __type: InulaNodeType.Cond;
  depNum: number;
  condFunc: (condNode: CondNode) => VNode[];
  /**
   * @brief assigned by condNode.condFunc in compile time
   * @param changed
   * @returns
   */
  updateFunc?: (changed: number) => void;
  _$parentEl?: InulaHTMLNode;
}

export interface ExpNode extends MutableNode {
  __type: InulaNodeType.Exp;
  _$nodes: InulaNode[];
  _$parentEl?: InulaHTMLNode;
  deps: unknown[];
}

export interface ForNode<T> extends MutableNode<Map<number, ScopedLifecycle>>, VNode {
  array: T[];
  __type: InulaNodeType.For;
  depNum: number;
  keys: number[];
  nodeFunc: (item: T, idx: number, updateArr: any[]) => VNode[];
  _$nodes: InulaNode[];
  _$parentEl?: InulaHTMLNode;
  nodesMap: Map<number, InulaNode[]>;
  updateArr: any[];
}

export interface Context<V extends Record<PropertyKey, any> | null> {
  id: symbol;
  value: V | null;
}

export interface ContextNode<V extends Record<PropertyKey, any>> {
  value: V;
  context: Context<V>;
  __type: InulaNodeType.Context;
  depMap: Record<keyof V, Array<unknown>>;
  _$nodes: VNode[];
  _$unmounted?: boolean;
  consumers: Set<CompNode | HookNode>;
  prevValue?: V | null;
  prevContextNode?: ContextNode<V> | null;
}

export type Updater = (changed: number) => void;

export interface ChildrenNode {
  __type: InulaNodeType.Children;
  childrenFunc: (addUpdate: (updater: Updater) => void) => VNode[];
  updaters: Set<Updater>;
}
