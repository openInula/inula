/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import type { VNode } from './Types';
import type { Update } from './UpdateHandler';

import { asyncUpdates, syncUpdates, runDiscreteUpdates, launchUpdateFromVNode } from './TreeBuilder';
import { runAsyncEffects } from './submit/HookEffectHandler';
import { Callback, newUpdate, pushUpdate } from './UpdateHandler';

export { createVNode, createTreeRootVNode } from './vnode/VNodeCreator';
export { createPortal } from './components/CreatePortal';
export { asyncUpdates, syncUpdates, runDiscreteUpdates, runAsyncEffects };

export function startUpdate(element: any, treeRoot: VNode, callback?: Callback) {
  const update: Update = newUpdate();
  update.content = { element };

  if (typeof callback === 'function') {
    update.callback = callback;
  }

  pushUpdate(treeRoot, update);

  launchUpdateFromVNode(treeRoot);
}

export function getFirstCustomDom(treeRoot?: VNode | null): Element | Text | null {
  if (treeRoot?.child) {
    return treeRoot.child.realNode;
  }
  return null;
}
