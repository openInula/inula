import type {VNode, ContextType} from '../Types';

import {resetDepContexts, getNewContext} from '../components/context/Context';
import {createVNodeChildren} from './BaseComponent';

export function captureRender(processing: VNode): VNode | null {
  return captureContextConsumer(processing);
}

export function bubbleRender() {}

function captureContextConsumer(processing: VNode) {
  const context: ContextType<any> = processing.type;
  const props = processing.props;
  const renderFunc = props.children;

  resetDepContexts(processing);
  const contextVal = getNewContext(processing, context);
  const newChildren = renderFunc(contextVal);

  processing.child = createVNodeChildren(processing, newChildren);
  return processing.child;
}
