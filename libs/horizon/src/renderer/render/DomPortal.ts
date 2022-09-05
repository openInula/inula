import type { VNode } from '../Types';
import { resetNamespaceCtx, setNamespaceCtx } from '../ContextSaver';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';
import { popCurrentRoot, pushCurrentRoot } from '../RootStack';

export function bubbleRender(processing: VNode) {
  resetNamespaceCtx(processing);
  popCurrentRoot();
}

function capturePortalComponent(processing: VNode) {
  setNamespaceCtx(processing, processing.realNode);
  pushCurrentRoot(processing);

  const newElements = processing.props;
  if (processing.isCreated) {
    processing.child = createChildrenByDiff(processing, null, newElements, true);
  } else {
    processing.child = createChildrenByDiff(processing, processing.child, newElements, !processing.isCreated);
  }
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return capturePortalComponent(processing);
}
