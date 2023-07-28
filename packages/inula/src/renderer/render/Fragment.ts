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
