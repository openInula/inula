import type {VNode, ContextType} from '../Types';

import {resetDepContexts, getNewContext} from '../components/context/Context';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

function captureContextConsumer(processing: VNode) {
  const context: ContextType<any> = processing.type;
  const props = processing.props;
  const renderFunc = props.children;

  resetDepContexts(processing);
  const contextVal = getNewContext(processing, context);
  const newChildren = renderFunc(contextVal);

  processing.child = createChildrenByDiff(processing, processing.child, newChildren, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return captureContextConsumer(processing);
}

export function bubbleRender() {}

