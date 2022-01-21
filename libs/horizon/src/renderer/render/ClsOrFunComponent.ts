import type {VNode} from '../Types';

import {FunctionComponent} from '../vnode/VNodeTags';
import {resetDepContexts} from '../components/context/Context';
import {getOldContext} from '../components/context/CompatibleContext';
import {FlagUtils} from '../vnode/VNodeFlags';
import {exeFunctionHook} from '../hooks/HookMain';
import {createVNodeChildren} from './BaseComponent';

function captureIndeterminateComponent(
  processing: VNode,
): VNode | null {
  const funcComp = processing.type;

  if (!processing.isCreated) {
    processing.isCreated = true;
    FlagUtils.markAddition(processing);
  }

  const props = processing.props;
  const context = getOldContext(processing, funcComp, false);

  resetDepContexts(processing);

  const newElements = exeFunctionHook(funcComp, props, context, processing);

  processing.tag = FunctionComponent;
  processing.child = createVNodeChildren(processing, newElements);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return captureIndeterminateComponent(processing);
}

export function bubbleRender() {}
