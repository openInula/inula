/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import { VNode } from '../renderer/Types';
import { Atom } from './Atom';
import { RContextSet } from './RContext';
import { DiffOperator } from './DiffUtils';

export enum ArrayState {
  Fresh = 0,
  NotFresh = 1,
}

export interface Root<T> {
  $?: T;

  /**
   * 下面属性computed使用
   * @param {readOnly} 标识computed 是否处于写入状态
   */
  readOnly?: boolean;
}

export type PrimitiveType = string | number | boolean;

export type ValueType<T> = { [K in keyof T]: any } | Record<string, any> | PrimitiveType;

export interface BaseNodeFns<T> {
  /**
   * 返回响应式对象的值，自动追踪依赖
   */
  get(): T;

  /**
   * 返回响应式对象的值，不追踪依赖
   */
  read(): T;
}

export interface ProxyRNodeFn<T> extends BaseNodeFns<T> {
  set<V = ValueType<T>>(value: V | ((prev: T) => V));
}

export interface AtomNodeFn<T> extends BaseNodeFns<T> {
  set<V extends PrimitiveType>(value: V | ((prev: T) => V));
}

type PropsRecursive<T, K extends keyof T, RecurseType> = T[K] extends PrimitiveType
  ? AtomNode<T[K]>
  : T[K] extends any[]
  ? any[] & ProxyRNodeFn<T[K]>
  : T extends Record<string, any>
  ? RecurseType
  : T[K];

export type ProxyRNodeProps<T> = {
  [K in keyof T]: PropsRecursive<T, K, ProxyRNode<T[K]>>;
};

export type ComputedProps<T> = {
  [K in keyof T]: PropsRecursive<T, K, BaseNodeFns<T[K]>>;
};

export type ProxyRNode<T> = ProxyRNodeFn<T> & ProxyRNodeProps<T>;

export type AtomNode<T> = AtomNodeFn<T>;

export type Computed<T> = BaseNodeFns<T> & ComputedProps<T>;

export type ReactiveProxy<T> = T extends PrimitiveType ? AtomNode<T> : ProxyRNode<T>;

export interface BaseRNode<T> {
  // 标识Node类型 atomSymbol,nodeSymbol,computedSymbol
  type: symbol;
  root: Root<T>;
  children?: Map<string | symbol, RNode<T> | Atom<T>>;
  usedRContexts?: RContextSet;
  proxy?: any;

  diffOperator?: DiffOperator;
  diffOperators?: DiffOperator[];
  states?: ArrayState[];
}

export interface RootRNode<T> extends BaseRNode<T> {
  parentKey: null;
  parent: null;
}

export interface ChildrenRNode<T> extends BaseRNode<T> {
  parentKey: string | symbol;
  parent: RNode;
}

export type RNode<T = any> = RootRNode<T> | ChildrenRNode<T>;

export type Reactive<T = any> = RNode<T> | Atom<T>;

export interface RContextParam {
  vNode?: VNode;
  reactive?: Reactive;
}

export type RContextCallback = (params: RContextParam, reactive: Reactive) => void;
