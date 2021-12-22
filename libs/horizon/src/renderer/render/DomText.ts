import type {VNode} from '../Types';

import {throwIfTrue} from '../utils/throwIfTrue';
import {newTextDom} from '../../dom/DOMOperator';
import {FlagUtils} from '../vnode/VNodeFlags';

export function captureRender(): VNode | null {
  return null;
}

export function bubbleRender(processing: VNode) {
  const newText = processing.props;

  if (!processing.isCreated && processing.realNode != null) { // 更新
    const oldText = processing.oldProps;
    // 如果文本不同，将其标记为更新
    if (oldText !== newText) {
      FlagUtils.markUpdate(processing);
    }
  } else { // 初始化
    if (typeof newText !== 'string') {
      // 如果存在bug，可能出现这种情况
      throwIfTrue(
        processing.realNode === null,
        'We must have new text for new mounted node. This error is likely ' +
        'caused by a bug in Horizon. Please file an issue.',
      );
    }
    // 获得对应节点
    processing.realNode = newTextDom(
      newText,
      processing,
    );
  }
}
