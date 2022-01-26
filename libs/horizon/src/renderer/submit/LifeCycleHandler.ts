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
import { FlagUtils, ResetText, Clear } from '../vnode/VNodeFlags';
import { mergeDefaultProps } from '../render/LazyComponent';
import {
  submitDomUpdate,
  clearText,
  appendChildElement,
  insertDomBefore,
  removeChildDom,
  hideDom,
  unHideDom,
  clearContainer,
} from '../../dom/DOMOperator';
import {
  callEffectRemove,
  callUseEffects,
  callUseLayoutEffectCreate,
  callUseLayoutEffectRemove
} from './HookEffectHandler';
import { handleSubmitError } from '../ErrorHandler';
import {
  travelVNodeTree,
  clearVNode,
  isDomVNode,
  findDomParent, getSiblingDom,
} from '../vnode/VNodeUtils';
import { shouldAutoFocus } from '../../dom/utils/Common';

function callComponentWillUnmount(vNode: VNode, instance: any) {
  try {
    instance.componentWillUnmount();
  } catch (error) {
    handleSubmitError(vNode, error);
  }
}

// 调用界面变化前的生命周期
function callBeforeSubmitLifeCycles(
  vNode: VNode,
): void {
  switch (vNode.tag) {
    case ClassComponent: { // 调用instance.getSnapshotBeforeUpdate
      if (!vNode.isCreated) {
        const prevProps = vNode.isLazyComponent
          ? mergeDefaultProps(vNode.type, vNode.oldProps)
          : vNode.oldProps;
        const prevState = vNode.oldState;
        const instance = vNode.realNode;

        const snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState);

        // __snapshotResult会在调用componentDidUpdate的时候作为第三个参数
        instance.__snapshotResult = snapshot;
      }
      return;
    }
    case TreeRoot: {
      const root = vNode.realNode;
      clearContainer(root.outerDom);
    }

    // No Default
  }
}

// 调用vNode.stateCallbacks
function callStateCallback(vNode: VNode, obj: any): void {
  const stateCallbacks = vNode.stateCallbacks;
  vNode.stateCallbacks = [];

  stateCallbacks.forEach(callback => {
    if (typeof callback === 'function') {
      callback.call(obj);
    }
  });
}

// 调用界面变化后的生命周期
function callAfterSubmitLifeCycles(
  vNode: VNode,
): void {
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
      if (vNode.flags.Update) {
        if (vNode.isCreated) {
          instance.componentDidMount();
        } else {
          const prevProps =
            vNode.isLazyComponent
              ? mergeDefaultProps(vNode.type, vNode.oldProps)
              : vNode.oldProps;
          const prevState = vNode.oldState;

          instance.componentDidUpdate(
            prevProps,
            prevState,
            instance.__snapshotResult,
          );
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
      if (vNode.isCreated && vNode.flags.Update) {
        // button、input、select、textarea、如果有 autoFocus 属性需要focus
        if (shouldAutoFocus(vNode.type, vNode.props)) {
          // button、input、select、textarea、如果有 autoFocus 属性需要focus
          vNode.realNode.focus();
        }
      }
    }

    // No Default
  }
}

function hideOrUnhideAllChildren(vNode, isHidden) {
  travelVNodeTree(vNode, (node: VNode) => {
    const instance = node.realNode;

    if (node.tag === DomComponent || node.tag === DomText) {
      if (isHidden) {
        hideDom(node.tag, instance);
      } else {
        unHideDom(node.tag, instance, node.props);
      }
    }
  });
}

function attachRef(vNode: VNode) {
  const ref = vNode.ref;

  handleRef(vNode, ref, vNode.realNode);
}

function detachRef(vNode: VNode, isOldRef?: boolean) {
  let ref = (isOldRef ? vNode.oldRef : vNode.ref);

  handleRef(vNode, ref, null);
}

function handleRef(vNode: VNode, ref, val) {
  if (ref !== null && ref !== undefined) {
    const refType = typeof ref;

    if (refType === 'function') {
      ref(val);
    } else if (refType === 'object') {
      (<RefType>ref).current = val;
    } else {
      if (vNode.belongClassVNode && vNode.belongClassVNode.realNode) {
        vNode.belongClassVNode.realNode.refs[String(ref)] = val;
      }
    }
  }
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
      if (instance && typeof instance.componentWillUnmount === 'function') {
        callComponentWillUnmount(vNode, instance);
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
  }
}

// 卸载vNode，递归遍历子vNode
function unmountNestedVNodes(vNode: VNode): void {
  travelVNodeTree(vNode, (node) => {
    unmountVNode(node);
  }, (node) => {
    // 如果是DomPortal，不需要遍历child
    return node.tag === DomPortal;
  });
}

function submitAddition(vNode: VNode): void {
  const { parent, parentDom } = findDomParent(vNode);

  if (parent.flags.ResetText) {
    // 在insert之前先reset
    clearText(parentDom);
    FlagUtils.removeFlag(parent, ResetText);
  }

  const before = getSiblingDom(vNode);
  insertOrAppendPlacementNode(vNode, before, parentDom);
}

function insertOrAppendPlacementNode(
  node: VNode,
  beforeDom: Element | null,
  parent: Element | Container,
): void {
  const { tag, realNode } = node;

  if (isDomVNode(node)) {
    if (beforeDom) {
      insertDomBefore(parent, realNode, beforeDom);
    } else {
      appendChildElement(parent, realNode);
    }
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

// 遍历所有子节点：删除dom节点，detach ref 和 调用componentWillUnmount()
function unmountDomComponents(vNode: VNode): void {
  let currentParentIsValid = false;

  // 这两个变量要一起更新
  let currentParent;

  travelVNodeTree(vNode, (node) => {
    if (!currentParentIsValid) {
      const parentObj = findDomParent(node);
      currentParent = parentObj.parentDom;
      currentParentIsValid = true;
    }

    if (node.tag === DomComponent || node.tag === DomText) {
      // 卸载vNode，递归遍历子vNode
      unmountNestedVNodes(node);

      // 在所有子项都卸载后，删除dom树中的节点
      removeChildDom(currentParent, node.realNode);
    } else if (node.tag === DomPortal) {
      if (node.child !== null) {
        currentParent = node.outerDom;
      }
    } else {
      unmountVNode(node);
    }
  }, (node) => {
    // 如果是dom不用再遍历child
    return node.tag === DomComponent || node.tag === DomText;
  }, null, (node) => {
    if (node.tag === DomPortal) {
      // 当离开portal，需要重新设置parent
      currentParentIsValid = false;
    }
  });
}

function submitClear(vNode: VNode): void {
  const realNode = vNode.realNode;
  const cloneDom = realNode.cloneNode(false); // 复制节点后horizon添加给dom的属性未能复制
  // 真实 dom 获取的keys只包含新增的属性
  // 比如真实 dom 拿到的 keys 一般只有两个 horizon 自定义属性
  // 但考虑到用户可能自定义其他属性，所以采用遍历赋值的方式
  const customizeKeys = Object.keys(realNode);
  const keyLength = customizeKeys.length;
  for(let i = 0; i < keyLength; i++) {
    const key = customizeKeys[i];
    // 测试代码 mock 实例的全部可遍历属性都会被Object.keys方法读取到
    // children 属性被复制意味着复制了子节点，因此要排除
    if (key !== 'children') {
      cloneDom[key] = realNode[key]; // 复制cloneNode未能复制的属性
    }
  }

  const parentObj = findDomParent(vNode);
  const currentParent = parentObj.parentDom;
  let clearChild = vNode.clearChild as VNode; // 上次渲染的child保存在clearChild属性中
  // 卸载 clearChild 和 它的兄弟节点
  while(clearChild) {
    // 卸载子vNode，递归遍历子vNode
    unmountNestedVNodes(clearChild);
    clearVNode(clearChild);
    clearChild = clearChild.next as VNode;
  }
  
  // 在所有子项都卸载后，删除dom树中的节点
  removeChildDom(currentParent, vNode.realNode);
  currentParent.append(cloneDom);
  vNode.realNode = cloneDom;
  FlagUtils.removeFlag(vNode, Clear);
  vNode.clearChild = null;
}

function submitDeletion(vNode: VNode): void {
  // 遍历所有子节点：删除dom节点，detach ref 和 调用componentWillUnmount()
  unmountDomComponents(vNode);

  // 置空vNode
  clearVNode(vNode);
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
  }
}

function submitSuspenseComponent(vNode: VNode) {
  const suspenseChildStatus = vNode.suspenseChildStatus;
  if (suspenseChildStatus !== SuspenseChildStatus.Init) {
    hideOrUnhideAllChildren(vNode.child, suspenseChildStatus === SuspenseChildStatus.ShowFallback);
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
