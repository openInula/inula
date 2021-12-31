import type { VNode } from '../Types';
import { resetNamespaceCtx, setNamespaceCtx } from '../ContextSaver';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';
import { createVNodeChildren } from './BaseComponent';
import { prePortal } from '../../dom/DOMOperator';

export function captureRender(processing: VNode): VNode | null {
  return capturePortalComponent(processing);
}

export function bubbleRender(processing: VNode) {
  resetNamespaceCtx(processing);

  if (processing.isCreated) {
    prePortal(processing.outerDom);
  }
}

function capturePortalComponent(processing: VNode) {
  setNamespaceCtx(processing, processing.outerDom);

  const newElements = processing.props;
  if (processing.isCreated) {
    processing.child = createChildrenByDiff(processing, null, newElements);
  } else {
    processing.child = createVNodeChildren(processing, newElements);
  }
  return processing.child;
}
