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
import { newTextDom } from '../../dom/DOMOperator';
import { FlagUtils } from '../vnode/VNodeFlags';
import { isNull } from '../../dom/utils/Common';

export function captureRender(): VNode | null {
  return null;
}

export function bubbleRender(processing: VNode) {
  const newText = processing.props;

  if (!processing.isCreated && processing.realNode !== null) {
    // 更新
    const oldText = processing.oldProps;
    // 如果文本不同，将其标记为更新
    if (oldText !== newText) {
      FlagUtils.markUpdate(processing);
    }
  } else {
    // 初始化
    if (typeof newText !== 'string') {
      // 如果存在bug，可能出现这种情况
      throwIfTrue(
        processing.realNode === null,
        'We must have new text for new mounted node. This error is likely ' +
          'caused by a bug in Inula. Please file an issue.'
      );
    }
    // 获得对应节点
    processing.realNode = newTextDom(newText, processing);
  }
}
