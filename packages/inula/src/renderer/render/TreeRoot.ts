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
import { throwIfTrue } from '../utils/throwIfTrue';
import { processUpdates } from '../UpdateHandler';
import { resetNamespaceCtx, setNamespaceCtx } from '../ContextSaver';
import { onlyUpdateChildVNodes } from '../vnode/VNodeCreator';
import { createChildrenByDiff } from '../diff/nodeDiffComparator';

export function bubbleRender(processing: VNode) {
  resetNamespaceCtx(processing);
}

function updateTreeRoot(processing) {
  setNamespaceCtx(processing, processing.realNode);

  const updates = processing.updates;
  throwIfTrue(
    processing.isCreated || updates === null,
    'If the root does not have an updates, we should have already ' +
      'bailed out. This error is likely caused by a bug. Please ' +
      'file an issue.'
  );

  const newProps = processing.props;
  const oldState = processing.state;
  const oldElement = oldState !== null ? oldState.element : null;
  processUpdates(processing, null, newProps);

  const newState = processing.state;
  // 为了保持对Dev Tools的兼容，这里还是使用element
  const newElement = newState.element;
  if (newElement === oldElement) {
    return onlyUpdateChildVNodes(processing);
  }
  processing.child = createChildrenByDiff(processing, processing.child, newElement, !processing.isCreated);
  return processing.child;
}

export function captureRender(processing: VNode): VNode | null {
  return updateTreeRoot(processing);
}
