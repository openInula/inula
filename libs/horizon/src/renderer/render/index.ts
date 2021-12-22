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
import * as IncompleteClassComponentRender from './IncompleteClassComponent';
import * as ClsOrFunComponentRender from './ClsOrFunComponent';
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
  IncompleteClassComponent,
  ClsOrFunComponent,
  LazyComponent,
  MemoComponent,
  SuspenseComponent,
} from '../vnode/VNodeTags';

export {
  BaseComponentRender
}

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
  [IncompleteClassComponent]: IncompleteClassComponentRender,
  [ClsOrFunComponent]: ClsOrFunComponentRender,
  [LazyComponent]: LazyComponentRender,
  [MemoComponent]: MemoComponentRender,
  [SuspenseComponent]: SuspenseComponentRender,
}
