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

import type { VNode } from '../Types';

import { ContextProvider, DomComponent, DomPortal, TreeRoot, SuspenseComponent } from '../vnode/VNodeTags';
import { setContext, setNamespaceCtx } from '../ContextSaver';
import { FlagUtils } from '../vnode/VNodeFlags';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import componentRenders from './index';
import { setProcessingVNode } from '../GlobalVar';
import { clearVNodeObservers } from '../../inulax/store/StoreHandler';
import { pushCurrentRoot } from '../RootStack';

// 复用vNode时，也需对树的上下文值处理，如context，portal, namespaceContext
function setTreeContextValue(processing: VNode) {
  switch (processing.tag) {
    case TreeRoot:
      setNamespaceCtx(processing, processing.realNode);
      break;
    case DomComponent:
      setNamespaceCtx(processing);
      break;
    case DomPortal:
      setNamespaceCtx(processing, processing.realNode);
      pushCurrentRoot(processing);
      break;
    case ContextProvider: {
      const newValue = processing.props.value;
      setContext(processing, newValue);
      break;
    }
    // No Default
  }
}

export function captureVNode(processing: VNode): VNode | null {
  const component = componentRenders[processing.tag];

  if (processing.tag !== SuspenseComponent) {
    // 该vNode没有变化，不用进入capture，直接复用。
    if (!processing.isCreated && processing.oldProps === processing.props && !processing.shouldUpdate) {
      // 复用还需对stack进行处理
      setTreeContextValue(processing);

      return onlyUpdateChildVNodes(processing);
    }
  }

  const shouldUpdate = processing.shouldUpdate;
  processing.shouldUpdate = false;

  setProcessingVNode(processing);

  if (processing.observers) clearVNodeObservers(processing);
  const child = component.captureRender(processing, shouldUpdate);
  setProcessingVNode(null);

  return child;
}

export function markRef(processing: VNode) {
  const ref = processing.ref;
  if ((processing.isCreated && ref !== null) || (!processing.isCreated && processing.oldRef !== ref)) {
    FlagUtils.markRef(processing);
  }
}
