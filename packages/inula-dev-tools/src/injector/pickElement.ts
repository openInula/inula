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

import { PickElement, StopPickElement } from '../utils/constants';
import { getElement, helper, postMessage } from './index';
import { queryVNode, VNodeToIdMap } from '../parser/parseVNode';
import { isUserComponent } from '../parser/parseVNode';
import { throttle } from 'lodash';
import { hideHighlight, showHighlight } from '../highlight';

// 判断鼠标移入节点是否为 dev tools 上的节点，如果不是则找父节点
function getUserComponent(target) {
  if (target.tag && isUserComponent(target.tag)) {
    return target;
  }
  while (target.tag && !isUserComponent(target.tag)) {
    if (target.parent) {
      target = target.parent;
    }
  }
  return target;
}

function onMouseEvent(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

function onMouseMove(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();

  const target = (event.target as any)._inula_VNode;
  if (target) {
    const id = VNodeToIdMap.get(getUserComponent(target));
    const vNode = queryVNode(id);
    if (vNode == null) {
      console.warn(`Could not find vNode with id "${id}"`);
      return null;
    }
    const info = getElement(helper.travelVNodeTree, vNode);
    if (info) {
      showHighlight(info);
    }

    // 0.5 秒内在节流结束后只触发一次
    throttle(
      () => {
        postMessage(PickElement, id);
      },
      500,
      { leading: false, trailing: true }
    )();
  }
}

export function pickElement(window: Window) {
  function onClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    stopPick();
    postMessage(StopPickElement, null);
  }

  const startPick = () => {
    if (window && typeof window.addEventListener === 'function') {
      window.addEventListener('click', onClick, true);
      window.addEventListener('mousedown', onMouseEvent, true);
      window.addEventListener('mousemove', onMouseMove, true);
      window.addEventListener('mouseup', onMouseEvent, true);
    }
  };

  const stopPick = () => {
    hideHighlight();
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('mousedown', onMouseEvent, true);
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('mouseup', onMouseEvent, true);
  };

  return { startPick, stopPick };
}
