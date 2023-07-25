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

import { VNode } from '../renderer/vnode/VNode';
import { Addition, FlagUtils } from '../renderer/vnode/VNodeFlags';
import { TreeRoot } from '../renderer/vnode/VNodeTags';

export function isInputElement(dom?: HTMLElement): boolean {
  return dom instanceof HTMLInputElement || dom instanceof HTMLTextAreaElement;
}

export function setPropertyWritable(obj, propName) {
  const desc = Object.getOwnPropertyDescriptor(obj, propName);
  if (!desc || !desc.writable) {
    Object.defineProperty(obj, propName, {writable: true});
  }
}

// 获取离 vNode 最近的已挂载 vNode，包含它自己
export function getNearestMountedVNode(vNode: VNode): null | VNode {
  let node = vNode;
  let target = vNode;
  // 如果没有alternate，说明是可能是未插入的新树，需要处理插入的副作用。
  while (node.parent) {
    // 存在更新，节点未挂载，查找父节点，但是父节点也可能未挂载，需要继续往上查找无更新节点
    if (FlagUtils.hasFlag(node, Addition)) {
      target = node.parent;
    }
    node = node.parent;
  }
  // 如果根节点是 Dom 类型节点，表示已经挂载
  if (node.tag === TreeRoot) {
    return target;
  }
  // 如果没有找到根节点，意味着Tree已经卸载或者未挂载
  return null;
}
