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
 * 该文件负责把更新应用到界面上 以及 和生命周期的相关调用
 */

import type { Container } from '../../dom/DOMOperator';
import type { RefType, VNode } from '../Types';

import { listenToPromise, SuspenseChildStatus } from '../render/SuspenseComponent';
import {
  FunctionComponent,
  ForwardRef,
  ClassComponent,
  TreeRoot,
  DomComponent,
  DomText,
  DomPortal,
  SuspenseComponent,
  MemoComponent,
} from '../vnode/VNodeTags';
import { FlagUtils, ResetText, Clear, Update, DirectAddition } from '../vnode/VNodeFlags';
import { mergeDefaultProps } from '../render/LazyComponent';
import {
  submitDomUpdate,
  clearText,
  appendChildElement,
  insertDomBefore,
  removeChildDom,
  hideDom,
  unHideDom,
} from '../../dom/DOMOperator';
import {
  callEffectRemove,
  callUseEffects,
  callUseLayoutEffectCreate,
  callUseLayoutEffectRemove,
} from './HookEffectHandler';
import { handleSubmitError } from '../ErrorHandler';
import { travelVNodeTree, clearVNode, isDomVNode, getSiblingDom } from '../vnode/VNodeUtils';
import { shouldAutoFocus } from '../../dom/utils/Common';
import { BELONG_CLASS_VNODE_KEY } from '../vnode/VNode';

function callComponentWillUnmount(vNode: VNode, instance: any) {
  try {
    instance.componentWillUnmount();
  } catch (error) {
    handleSubmitError(vNode, error);
  }
}

// 调用界面变化前的生命周期
function callBeforeSubmitLifeCycles(vNode: VNode): void {
  if (vNode.tag === ClassComponent && !vNode.isCreated) {
    // 调用instance.getSnapshotBeforeUpdate
    const prevProps = vNode.isLazyComponent ? mergeDefaultProps(vNode.type, vNode.oldProps) : vNode.oldProps;
    const prevState = vNode.oldState;
    const instance = vNode.realNode;

    const snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);

    // __snapshotResult会在调用componentDidUpdate的时候作为第三个参数
    instance.__snapshotResult = snapshot;
  }
}

// 调用vNode.stateCallbacks
function callStateCallback(vNode: VNode, obj: any): void {
  const stateCallbacks = vNode.stateCallbacks;
  vNode.stateCallbacks = null;
  if (stateCallbacks !== null) {
    stateCallbacks.forEach(callback => {
      if (typeof callback === 'function') {
        callback.call(obj);
      }
    });
  }
}

// 调用界面变化后的生命周期
function callAfterSubmitLifeCycles(vNode: VNode): void {
  switch (vNode.tag) {
    case FunctionComponent:
    case ForwardRef: {
      // 执行useLayoutEffect的create方法
      callUseLayoutEffectCreate(vNode);

      callUseEffects(vNode);
      return;
    }
    case ClassComponent: {
      const instance = vNode.realNode;
      if ((vNode.flags & Update) === Update) {
        if (vNode.isCreated) {
          instance.componentDidMount();
        } else {
          const prevProps = vNode.isLazyComponent ? mergeDefaultProps(vNode.type, vNode.oldProps) : vNode.oldProps;
          const prevState = vNode.oldState;

          instance.componentDidUpdate(prevProps, prevState, instance.__snapshotResult);
        }
      }

      callStateCallback(vNode, instance);
      return;
    }
    case TreeRoot: {
      const instance = vNode.child !== null ? vNode.child.realNode : null;
      callStateCallback(vNode, instance);
      return;
    }
    case DomComponent: {
      if (vNode.isCreated && (vNode.flags & Update) === Update) {
        // button、input、select、textarea、如果有 autoFocus 属性需要focus
        if (shouldAutoFocus(vNode.type, vNode.props)) {
          vNode.realNode.focus();
        }
      }
    }

    // No Default
  }
}

function hideOrUnhideAllChildren(vNode, isHidden) {
  travelVNodeTree(
    vNode,
    (node: VNode) => {
      const instance = node.realNode;

      if (node.tag === DomComponent || node.tag === DomText) {
        if (isHidden) {
          hideDom(node.tag, instance);
        } else {
          unHideDom(node.tag, instance, node.props);
        }
      }
    },
    null,
    vNode,
    null
  );
}

function handleRef(vNode: VNode, ref, val) {
  if (ref !== null && ref !== undefined) {
    const refType = typeof ref;

    if (refType === 'function') {
      ref(val);
    } else if (refType === 'object') {
      (<RefType>ref).current = val;
    } else {
      if (vNode[BELONG_CLASS_VNODE_KEY] && vNode[BELONG_CLASS_VNODE_KEY].realNode) {
        vNode[BELONG_CLASS_VNODE_KEY].realNode.refs[String(ref)] = val;
      }
    }
  }
}

function attachRef(vNode: VNode) {
  const ref = vNode.ref;

  handleRef(vNode, ref, vNode.realNode);
}

function detachRef(vNode: VNode, isOldRef?: boolean) {
  const ref = isOldRef ? vNode.oldRef : vNode.ref;

  handleRef(vNode, ref, null);
}

// 卸载vNode，递归遍历子vNode
function unmountNestedVNodes(vNode: VNode): void {
  travelVNodeTree(
    vNode,
    node => {
      unmountVNode(node);
    },
    node =>
      // 如果是DomPortal，不需要遍历child
      node.tag === DomPortal,
    vNode,
    null
  );
}

// 遍历所有子节点：删除dom节点，detach ref 和 调用componentWillUnmount()
function unmountDomComponents(vNode: VNode): void {
  let currentParentIsValid = false;

  // 这两个变量要一起更新
  let currentParent;

  travelVNodeTree(
    vNode,
    node => {
      if (!currentParentIsValid) {
        let parent = node.parent;
        let tag;
        while (parent !== null) {
          tag = parent.tag;
          if (tag === DomComponent || tag === TreeRoot || tag === DomPortal) {
            currentParent = parent.realNode;
            break;
          }
          parent = parent.parent;
        }
        currentParentIsValid = true;
      }

      if (node.tag === DomComponent || node.tag === DomText) {
        // 卸载vNode，递归遍历子vNode
        unmountNestedVNodes(node);

        // 在所有子项都卸载后，删除dom树中的节点
        removeChildDom(currentParent, node.realNode);
      } else if (node.tag === DomPortal) {
        if (node.child !== null) {
          currentParent = node.realNode;
        }
      } else {
        unmountVNode(node);
      }
    },
    node =>
      // 如果是dom不用再遍历child
      node.tag === DomComponent || node.tag === DomText,
    vNode,
    node => {
      if (node.tag === DomPortal) {
        // 当离开portal，需要重新设置parent
        currentParentIsValid = false;
      }
    }
  );
}

// 卸载一个vNode，不会递归
function unmountVNode(vNode: VNode): void {
  switch (vNode.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent: {
      callEffectRemove(vNode);
      break;
    }
    case ClassComponent: {
      detachRef(vNode);

      const instance = vNode.realNode;
      // 当constructor中抛出异常时，instance会是null，这里判断一下instance是否为空
      // suspense打断时不需要触发WillUnmount
      if (instance && typeof instance.componentWillUnmount === 'function' && !vNode.isSuspended) {
        callComponentWillUnmount(vNode, instance);
      }

      // InulaX会在classComponentWillUnmount中清除对VNode的引入用
      if (vNode.classComponentWillUnmount) {
        vNode.classComponentWillUnmount(vNode);
        vNode.classComponentWillUnmount = null;
      }
      break;
    }
    case DomComponent: {
      detachRef(vNode);
      break;
    }
    case DomPortal: {
      // 这里会递归
      unmountDomComponents(vNode);
      break;
    }
    default: {
      break;
    }
  }
}

function insertDom(parent, realNode, beforeDom) {
  if (beforeDom) {
    insertDomBefore(parent, realNode, beforeDom);
  } else {
    appendChildElement(parent, realNode);
  }
}

function insertOrAppendPlacementNode(node: VNode, beforeDom: Element | null, parent: Element | Container): void {
  const { tag, realNode } = node;

  if (isDomVNode(node)) {
    insertDom(parent, realNode, beforeDom);
  } else if (tag === DomPortal) {
    // 这里不做处理，直接在portal中处理
  } else {
    // 插入子节点们
    let child = node.child;
    while (child !== null) {
      insertOrAppendPlacementNode(child, beforeDom, parent);
      child = child.next;
    }
  }
}

function submitAddition(vNode: VNode): void {
  let parent = vNode.parent;
  let parentDom;
  let tag;
  while (parent !== null) {
    tag = parent.tag;
    if (tag === DomComponent || tag === TreeRoot || tag === DomPortal) {
      parentDom = parent.realNode;
      break;
    }
    parent = parent.parent;
  }

  if ((parent.flags & ResetText) === ResetText) {
    // 在insert之前先reset
    clearText(parentDom);
    FlagUtils.removeFlag(parent, ResetText);
  }

  if ((vNode.flags & DirectAddition) === DirectAddition) {
    insertOrAppendPlacementNode(vNode, null, parentDom);
    FlagUtils.removeFlag(vNode, DirectAddition);
    return;
  }
  const before = getSiblingDom(vNode);
  insertOrAppendPlacementNode(vNode, before, parentDom);
}

function submitClear(vNode: VNode): void {
  const realNode = vNode.realNode;
  const cloneDom = realNode.cloneNode(false); // 复制节点后inula添加给dom的属性未能复制
  // 真实 dom 获取的keys只包含新增的属性
  // 比如真实 dom 拿到的 keys 一般只有两个 inula 自定义属性
  // 但考虑到用户可能自定义其他属性，所以采用遍历赋值的方式
  const customizeKeys = Object.keys(realNode);
  const keyLength = customizeKeys.length;
  for (let i = 0; i < keyLength; i++) {
    const key = customizeKeys[i];
    // 测试代码 mock 实例的全部可遍历属性都会被Object.keys方法读取到
    // children 属性被复制意味着复制了子节点，因此要排除
    if (key !== 'children') {
      cloneDom[key] = realNode[key]; // 复制cloneNode未能复制的属性
    }
  }

  let parent = vNode.parent;
  let parentDom;
  let tag;
  while (parent !== null) {
    tag = parent.tag;
    if (tag === DomComponent || tag === TreeRoot || tag === DomPortal) {
      parentDom = parent.realNode;
      break;
    }
    parent = parent.parent;
  }
  let clearChild = vNode.clearChild as VNode; // 上次渲染的child保存在clearChild属性中
  // 卸载 clearChild 和 它的兄弟节点
  while (clearChild) {
    // 卸载子vNode，递归遍历子vNode
    unmountNestedVNodes(clearChild);
    clearVNode(clearChild);
    clearChild = clearChild.next as VNode;
  }

  // 在所有子项都卸载后，删除dom树中的节点
  removeChildDom(parentDom, vNode.realNode);
  const realNodeNext = getSiblingDom(vNode);
  insertDom(parentDom, cloneDom, realNodeNext);
  vNode.realNode = cloneDom;
  attachRef(vNode);
  FlagUtils.removeFlag(vNode, Clear);
  vNode.clearChild = null;
}

function submitDeletion(vNode: VNode): void {
  // 遍历所有子节点：删除dom节点，detach ref 和 调用componentWillUnmount()
  unmountDomComponents(vNode);

  // 置空vNode
  clearVNode(vNode);
}

function submitSuspenseComponent(vNode: VNode) {
  const { childStatus } = vNode.suspenseState;
  if (childStatus !== SuspenseChildStatus.Init) {
    hideOrUnhideAllChildren(vNode.child, childStatus === SuspenseChildStatus.ShowFallback);
  }
}

function submitUpdate(vNode: VNode): void {
  switch (vNode.tag) {
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent: {
      // 执行useLayoutEffect的remove方法
      callUseLayoutEffectRemove(vNode);
      break;
    }
    case DomComponent:
    case DomText: {
      submitDomUpdate(vNode.tag, vNode);
      break;
    }
    case SuspenseComponent: {
      submitSuspenseComponent(vNode);
      listenToPromise(vNode);
      break;
    }
    default: {
      break;
    }
  }
}

function submitResetTextContent(vNode: VNode) {
  clearText(vNode.realNode);
}

export {
  callBeforeSubmitLifeCycles,
  submitResetTextContent,
  submitAddition,
  submitDeletion,
  submitClear,
  submitUpdate,
  callAfterSubmitLifeCycles,
  attachRef,
  detachRef,
};
