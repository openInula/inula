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

/**
 * 提供：vNode的“遍历”，“查找”，“判断”的相关工具方法
 */

import type {VNode} from '../Types';

import {DomComponent, DomPortal, DomText, TreeRoot} from './VNodeTags';
import {getNearestVNode} from '../../dom/DOMInternalKeys';
import {Addition, InitFlag} from './VNodeFlags';
import { BELONG_CLASS_VNODE_KEY } from './VNode';

export function travelChildren(
  beginVNode: VNode | null,
  handleVNode: (node: VNode) => void,
  isFinish?: (node: VNode) => boolean
) {
  let node = beginVNode;

  while (node !== null) {
    if (isFinish && isFinish(node)) {
      return;
    }

    handleVNode(node);

    node = node.next;
  }
}

// 从beginVNode开始深度遍历vNode树，对每个vNode调用handleVNode方法
export function travelVNodeTree(
  beginVNode: VNode,
  handleVNode: (node: VNode) => VNode | boolean | null | void,
  childFilter: ((node: VNode) => boolean) | null, // 返回true不处理child
  finishVNode: VNode, // 结束遍历节点，有时候和beginVNode不相同
  handleWhenToParent: ((node: VNode) => void) | null
): VNode | boolean | null | void {
  let node = beginVNode;

  while (true) {
    const ret = handleVNode(node);

    // 如果处理一个vNode时有返回值，则中断遍历
    if (ret) {
      return ret;
    }

    // 找子节点
    const childVNode = node.child;
    if (childVNode !== null && (childFilter === null || !childFilter(node))) {
      childVNode.parent = node;
      node = childVNode;
      continue;
    }

    // 回到开始节点
    if (node === finishVNode) {
      return null;
    }

    const isFun = typeof handleWhenToParent === 'function';

    // 找兄弟，没有就往上再找兄弟
    while (node.next === null) {
      if (node.parent === null || node.parent === finishVNode) {
        return null;
      }
      node = node.parent;

      if (isFun) {
        handleWhenToParent!(node);
      }
    }
    // 找到兄弟
    const siblingVNode = node.next;
    siblingVNode.parent = node.parent;
    node = siblingVNode;
  }
}

// 置空vNode
export function clearVNode(vNode: VNode) {
  vNode.isCleared = true;

  // 孩子节点的parent也置空
  travelChildren(vNode.child, (node) => {
    node.parent = null;
  });
  vNode.child = null;

  vNode.parent = null;
  vNode.next = null;
  vNode.depContexts = null;
  vNode.dirtyNodes = null;
  vNode.state = null;
  vNode.hooks = null;
  vNode.props = null;
  vNode.suspenseState = null;
  vNode.changeList = null;
  vNode.effectList = null;
  vNode.updates = null;
  vNode.realNode = null;

  vNode.oldProps = null;
  vNode.oldHooks = null;
  vNode.oldState = null;
  vNode.oldRef = null;
  vNode.oldChild = null;

  vNode.toUpdateNodes = null;

  vNode[BELONG_CLASS_VNODE_KEY] = null;
  if (window.__INULA_DEV_HOOK__) {
    const hook = window.__INULA_DEV_HOOK__;
    hook.deleteVNode(vNode);
  }
}

// 是dom类型的vNode
export function isDomVNode(node: VNode) {
  return node.tag === DomComponent || node.tag === DomText;
}

// 是容器类型的vNode
function isDomContainer(vNode: VNode): boolean {
  return vNode.tag === DomComponent || vNode.tag === TreeRoot || vNode.tag === DomPortal;
}

export function findDomVNode(vNode: VNode): VNode | null {
  const ret = travelVNodeTree(
    vNode,
    node => {
      if (node.tag === DomComponent || node.tag === DomText) {
        return node;
      }
      return null;
    },
    null,
    vNode,
    null
  );

  return ret as VNode | null;
}

export function findDOMByClassInst(inst) {
  const vNode = inst._vNode;
  if (vNode === undefined) {
    throw new Error('Unable to find the vNode by class instance.');
  }

  const domVNode = findDomVNode(vNode);

  return domVNode !== null ? domVNode.realNode : null;
}

function getTreeRootVNode(vNode) {
  let node = vNode;
  while (node.parent) {
    node = node.parent;
  }
  return node;
}

// 判断dom树是否已经挂载
export function isMounted(vNode: VNode) {
  const rootNode = getTreeRootVNode(vNode);
  // 如果根节点是 Dom 类型节点，表示已经挂载
  return rootNode.tag === TreeRoot;
}

// 找到相邻的DOM
export function getSiblingDom(vNode: VNode): Element | null {
  let node: VNode = vNode;

  findSibling: while (true) {
    // 没有兄弟节点，找父节点
    while (node.next === null) {
      // 没父节点，或父节点已经是根节点，则返回
      if (node.parent === null || isDomContainer(node.parent)) {
        return null;
      }
      node = node.parent;
    }

    const siblingVNode = node.next;
    siblingVNode.parent = node.parent;
    node = siblingVNode;

    // 如果不是dom节点，往下找
    while (!isDomVNode(node)) {
      // 如果节点也是Addition
      if ((node.flags & Addition) === Addition) {
        continue findSibling;
      }

      // 没有子节点，或是DomPortal
      if (!node.child || node.tag === DomPortal) {
        continue findSibling;
      } else {
        const childVNode = node.child;
        childVNode.parent = node;
        node = childVNode;
      }
    }

    if ((node.flags & Addition) === InitFlag) {
      // 找到
      return node.realNode;
    }
  }
}

function isPortalRoot(vNode, targetContainer) {
  if (vNode.tag === DomPortal) {
    let topVNode = vNode.parent;
    while (topVNode !== null) {
      const grandTag = topVNode.tag;
      if (grandTag === TreeRoot || grandTag === DomPortal) {
        const topContainer = topVNode.realNode;
        // 如果topContainer是targetContainer，不需要在这里处理
        if (topContainer === targetContainer) {
          return true;
        }
      }
      topVNode = topVNode.parent;
    }
    return false;
  }
  return false;
}

// 获取根vNode节点
export function findRoot(targetVNode, targetDom) {
  // 确认vNode节点是否准确，portal场景下可能祖先节点不准确
  let vNode = targetVNode;
  while (vNode !== null) {
    if (vNode.tag === TreeRoot || vNode.tag === DomPortal) {
      let dom = vNode.realNode;
      if (dom === targetDom) {
        break;
      }
      if (isPortalRoot(vNode, targetDom)) {
        return null;
      }

      while (dom !== null) {
        const parentNode = getNearestVNode(dom);
        if (parentNode === null) {
          return null;
        }
        if (parentNode.tag === DomComponent || parentNode.tag === DomText) {
          return findRoot(parentNode, targetDom);
        }
        dom = dom.parentNode;
      }
    }
    vNode = vNode.parent;
  }
  if (vNode === null) {
    return null;
  }
  return targetVNode;
}
