import type {VNode} from '../Types';

import {mergeDefaultProps} from './LazyComponent';
import {ClassComponent} from '../vnode/VNodeTags';
import {resetDepContexts} from '../components/context/Context';
import {getIncompleteClassComponent} from './ClassComponent';
import {
  isOldProvider,
  resetOldCtx,
  cacheOldCtx,
} from '../components/context/CompatibleContext';

function captureIncompleteClassComponent(processing, Component, nextProps) {
  processing.tag = ClassComponent;

  const hasOldContext = isOldProvider(Component);
  cacheOldCtx(processing, hasOldContext);

  resetDepContexts(processing);

  return getIncompleteClassComponent(Component, processing, nextProps);
}

export function captureRender(processing: VNode): VNode | null {
  const Component = processing.type;
  const unresolvedProps = processing.props;
  const resolvedProps =
    processing.isLazyComponent
      ? mergeDefaultProps(Component, unresolvedProps)
      : unresolvedProps;

  return captureIncompleteClassComponent(processing, Component, resolvedProps);
}

export function bubbleRender(processing: VNode) {
  // 处理与类组件相同。
  const Component = processing.type;
  if (isOldProvider(Component)) {
    resetOldCtx(processing);
  }
}
