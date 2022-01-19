import type { VNode } from './Types';
import type { Update } from './UpdateHandler';

import {
  asyncUpdates,
  syncUpdates,
  runDiscreteUpdates,
  launchUpdateFromVNode,
} from './TreeBuilder';
import { runAsyncEffects } from './submit/HookEffectHandler';
import { Callback, newUpdate, pushUpdate } from './UpdateHandler';
import { getFirstChild } from './vnode/VNodeUtils';

export { createVNode } from './vnode/VNodeCreator';
export { createPortal } from './components/CreatePortal';
export {
  asyncUpdates,
  syncUpdates,
  runDiscreteUpdates,
  runAsyncEffects,
};

export function startUpdate(
  element: any,
  treeRoot: VNode,
  callback?: Callback,
) {
  const update: Update = newUpdate();
  update.content = { element };

  if (typeof callback === 'function') {
    update.callback = callback;
  }

  pushUpdate(treeRoot, update);

  launchUpdateFromVNode(treeRoot);
}

export function getFirstCustomDom(treeRoot: VNode): Element | Text | null {
  if (treeRoot?.child) {
    return treeRoot.child.realNode;
  }
  return null;
}

