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

import * as BaseComponentRender from './BaseComponent';
import * as ClassComponentRender from './ClassComponent';
import * as ContextConsumerRender from './ContextConsumer';
import * as ContextProviderRender from './ContextProvider';
import * as ForwardRefRender from './ForwardRef';
import * as FragmentRender from './Fragment';
import * as FunctionComponentRender from './FunctionComponent';
import * as DomComponentRender from './Component';
import * as DomPortalRender from './Portal';
import * as TreeRootRender from './TreeRoot';
import * as DomTextRender from './Text';
import * as LazyComponentRender from './LazyComponent';
import * as MemoComponentRender from './MemoComponent';
import * as SuspenseComponentRender from './SuspenseComponent';

import {
  ClassComponent,
  ContextConsumer,
  ContextProvider,
  ForwardRef,
  Fragment,
  FunctionComponent,
  Component,
  Portal,
  TreeRoot,
  Text,
  LazyComponent,
  MemoComponent,
  SuspenseComponent,
} from '../vnode/VNodeTags';

export { BaseComponentRender };

export default {
  [ClassComponent]: ClassComponentRender,
  [ContextConsumer]: ContextConsumerRender,
  [ContextProvider]: ContextProviderRender,
  [ForwardRef]: ForwardRefRender,
  [Fragment]: FragmentRender,
  [FunctionComponent]: FunctionComponentRender,
  [Component]: DomComponentRender,
  [Portal]: DomPortalRender,
  [TreeRoot]: TreeRootRender,
  [Text]: DomTextRender,
  [LazyComponent]: LazyComponentRender,
  [MemoComponent]: MemoComponentRender,
  [SuspenseComponent]: SuspenseComponentRender,
};
