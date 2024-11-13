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

import { BELONG_CLASS_VNODE_KEY, VNode } from './vnode/VNode';
import { Component, Text } from './vnode/VNodeTags';

export { VNode } from './vnode/VNode';
// import { Props } from './utils/InternalKeys';
export type Props = Record<string, any> & {
  autoFocus?: boolean;
  children?: any;
  disabled?: boolean;
  hidden?: boolean;
  style?: { display?: string };
};

/* eslint-disable @typescript-eslint/no-unused-vars */
type Trigger<A> = (A) => void;

export type UseStateHookType = {
  useState<S>(initialState: (() => S) | S): [S, Trigger<((S) => S) | S>];
};
export type UseReducerHookType = {
  useReducer<S, P, A>(reducer: (S, A) => S, initArg: P, init?: (P) => S): [S, Trigger<A>];
};
export type UseContextHookType = { useContext<T>(context: ContextType<T>): T };

export type JSXElement = {
  vtype: any;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
  // @ts-ignore
  [BELONG_CLASS_VNODE_KEY]: any;
};

export type ProviderType<T> = {
  vtype: number;
  _context: ContextType<T>;
};

export type ContextType<T> = {
  vtype: number;
  Consumer: ContextType<T> | null;
  Provider: ProviderType<T> | null;
  value: T;
};

export type PortalType = {
  vtype: number;
  key: null | string;
  realNode: any;
  children: any;
};

export type RefType = {
  current: any;
};

export interface PromiseType<R> {
  then<U>(
    onFulfill: (value: R) => void | PromiseType<U> | U,
    onReject: (error: any) => void | PromiseType<U> | U
  ): void | PromiseType<U>;
}

export interface SuspenseState {
  promiseSet: Set<PromiseType<any>> | null; // suspense组件的promise列表
  childStatus: string;
  oldChildStatus: string; // 上一次Suspense的Children是否显示
  didCapture: boolean; // suspense是否捕获了异常
  promiseResolved: boolean; // suspense的promise是否resolve
}

export type Source = {
  fileName: string;
  lineNumber: number;
};

export type Callback = () => void;

export type Container = any;

export interface ReconcilerType {
  render: (...args: any) => void;
}

export type ElementType = {
  parentNode?: ElementType | null;
  nodeName?: string;
  nodeType?: number;
  [key: string]: any;
};
export type CommonTagType = typeof Component | typeof Text;
export enum CommonTags {
  ComponentElement = Component,
  TextElement = Text,
}
// `hostConfig` 接口定义了与 DOM 操作相关的方法
export interface HostConfigType {
  // 定义元素的name和type值
  elementConfig: {
    common: ElementType;
    text: ElementType;
    input: ElementType;
    button: ElementType;
    select: ElementType;
    textarea: ElementType;
    [key: string]: ElementType;
  };
  // 节点操作
  createElement(tagName: string, props: Props, parentNamespace: string, rootElement: ElementType): ElementType;
  createText(text: string): ElementType;
  isTextChild(type: string, props: Props): boolean;
  hideElement(tag: CommonTagType, element: ElementType): void;
  unHideElement(tag: CommonTagType, element: ElementType, props?: Props): void;
  removeChildElement(parent: ElementType | Container, child: ElementType): void;
  insertElementBefore(parent: ElementType | Container, child: ElementType, beforeChild: ElementType): void;
  appendChildElement(parent: ElementType | Container, child: ElementType): void;
  clearText(element: ElementType): void;

  // 监听器相关
  addEventListener(element: ElementType, eventName: string, handler: (...args) => void, isCapture: boolean): void;
  removeEventListener(element: ElementType, eventName: string, handler: (...args) => void): void;

  // 生命周期相关
  prepareForSubmit(): void;
  resetAfterSubmit(): void;
  /* submit 前对元素预处理，常用于 input 类元素将value值去掉避免重复刷新 */
  onSubmit(tag: CommonTagType, type: any, element: ElementType, newProps: any, changeList: any): void;

  // input 相关
  updateInputValue(type: string, element: ElementType, props: Props): void;
  shouldTriggerChangeEvent(targetElement: ElementType, elementTag: string, evtName: string): boolean;
  /* 受控 input 传值处理 */
  handleControledInputElements(target: ElementType, type: string, props: Props): void;

  // prop 相关
  /* 如何更新 props */
  setProps(element: ElementType, propName: string, value: any, isNativeTag: boolean, isInit: boolean): void;
  /* 如何处理 props */
  getProps(type: string, element: ElementType, rawProps: Record<string, any>): Record<string, any>;
  onPropInit(element: ElementType, tagName: string, Props: Record<string, any>): void;
}
export interface InulaReconcilerType {
  hostConfig: HostConfigType;
  setHostConfig(config: Partial<HostConfigType>): void;
}
