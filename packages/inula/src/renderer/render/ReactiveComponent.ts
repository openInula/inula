/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
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
import { newTextDom } from '../../dom/DOMOperator';
import { subscribeReactiveComponent } from '../../reactive/RContextCreator';
import { getRNode, getValue, isPrimitive } from '../../reactive/Utils';

export function captureRender(): VNode | null {
  return null;
}

export function bubbleRender(processing: VNode) {
  const text = processing.props;
  const newText = getValue(text);

  if (!processing.isCreated && processing.realNode != null) {
    // 更新不需要处理
  } else {
    // 初始化
    if (!isPrimitive(newText)) {
      // 如果存在bug，可能出现这种情况
      throwIfTrue(processing.realNode === null, 'The reactive obj value must be a primitive.');
    }

    // 获得对应节点
    processing.realNode = newTextDom(newText, processing);

    // 监听Reactive
    subscribeReactiveComponent(processing.realNode, getRNode(text));
  }
}
