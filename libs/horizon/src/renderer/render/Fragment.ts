import type {VNode} from '../Types';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

export function bubbleRender() {}

function captureFragment(processing: VNode) {
  const newElement = processing.props;
  processing.child = createChildrenByDiff(processing, processing.child, newElement, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return captureFragment(processing);
}
