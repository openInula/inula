import type {VNode} from '../Types';

import {FunctionComponent} from '../vnode/VNodeTags';
import {resetDepContexts} from '../components/context/Context';
import {getOldContext} from '../components/context/CompatibleContext';
import {FlagUtils} from '../vnode/VNodeFlags';
import {exeFunctionHook} from '../hooks/HookMain';
import {createVNodeChildren} from './BaseComponent';

export function captureRender(processing: VNode): Array<VNode> | null {
  return captureIndeterminateComponent(processing);
}

export function bubbleRender() {}

function captureIndeterminateComponent(
  processing: VNode | null,
): Array<VNode> | null {
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
  processing.children = createVNodeChildren(processing, newElements);
  return processing.children;
}
