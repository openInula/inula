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

import * as BaseComponentRender from './BaseComponent';
import * as ClassComponentRender from './ClassComponent';
import * as ContextConsumerRender from './ContextConsumer';
import * as ContextProviderRender from './ContextProvider';
import * as ForwardRefRender from './ForwardRef';
import * as FragmentRender from './Fragment';
import * as FunctionComponentRender from './FunctionComponent';
import * as DomComponentRender from './DomComponent';
import * as DomPortalRender from './DomPortal';
import * as TreeRootRender from './TreeRoot';
import * as DomTextRender from './DomText';
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
  DomComponent,
  DomPortal,
  TreeRoot,
  DomText,
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
  [DomComponent]: DomComponentRender,
  [DomPortal]: DomPortalRender,
  [TreeRoot]: TreeRootRender,
  [DomText]: DomTextRender,
  [LazyComponent]: LazyComponentRender,
  [MemoComponent]: MemoComponentRender,
  [SuspenseComponent]: SuspenseComponentRender,
};
