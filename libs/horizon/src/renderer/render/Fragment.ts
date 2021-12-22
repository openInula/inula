import type {VNode} from '../Types';
import {createVNodeChildren} from './BaseComponent';

export function captureRender(processing: VNode): Array<VNode> | null {
  return captureFragment(processing);
}

export function bubbleRender() {}

function captureFragment(processing: VNode) {
  const newElement = processing.props;
  processing.children = createVNodeChildren(processing, newElement);
  return processing.children;
}
