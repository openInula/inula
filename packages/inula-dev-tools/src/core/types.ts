/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

/**
 * 框架版本类型
 */
export enum FrameworkVersion {
  V1 = 'v1', // @inula/ - VNode架构
  V2 = 'v2', // @next-packages/ - CompNode架构
  Unknown = 'unknown',
}

/**
 * 框架信息
 */
export interface FrameworkInfo {
  version: FrameworkVersion;
  detected: boolean;
  versionString?: string;
}

/**
 * 统一的节点类型
 */
export enum NodeType {
  Component = 'Component',
  Element = 'Element',
  Text = 'Text',
  Fragment = 'Fragment',
  Portal = 'Portal',
  Context = 'Context',
  Suspense = 'Suspense',
  Memo = 'Memo',
  ForwardRef = 'ForwardRef',
  Lazy = 'Lazy',
}

/**
 * 统一的组件树节点
 */
export interface ComponentTreeNode {
  id: number | string;
  name: string;
  type: NodeType;
  children?: ComponentTreeNode[];
  key?: string | null;
  displayName?: string;
}

/**
 * 统一的组件属性
 */
export interface ComponentAttributes {
  id: number | string;
  props?: Record<string, any>;
  state?: Record<string, any>;
  hooks?: HookInfo[];
  context?: Record<string, any>;
}

/**
 * Hook信息
 */
export interface HookInfo {
  name: string;
  index: number;
  value: any;
}

/**
 * 修改属性请求
 */
export interface ModifyRequest {
  id: number | string;
  type: 'props' | 'state' | 'hooks';
  path: (string | number)[];
  value: any;
}

/**
 * 高亮信息
 */
export interface HighlightInfo {
  id: number | string;
  bounds?: DOMRect;
}

/**
 * 选择元素信息
 */
export interface PickElementInfo {
  id: number | string;
  element: HTMLElement;
}

