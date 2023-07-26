/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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
 * 定义vNode的类型
 */
export type VNodeTag = string;

export const TreeRoot = 'TreeRoot'; // tree的根节点，用于存放一些tree级的变量
export const FunctionComponent = 'FunctionComponent';
export const ClassComponent = 'ClassComponent';
export const DomPortal = 'DomPortal';
export const DomComponent = 'DomComponent';
export const DomText = 'DomText';
export const Fragment = 'Fragment';
export const ContextConsumer = 'ContextConsumer';
export const ContextProvider = 'ContextProvider';
export const ForwardRef = 'ForwardRef';
export const Profiler = 'Profiler';
export const SuspenseComponent = 'SuspenseComponent';
export const MemoComponent = 'MemoComponent';
export const LazyComponent = 'LazyComponent';
export const IncompleteClassComponent = 'IncompleteClassComponent';
