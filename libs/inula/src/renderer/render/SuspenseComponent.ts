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

import type { VNode, PromiseType } from '../Types';

import { FlagUtils, Interrupted } from '../vnode/VNodeFlags';
import { onlyUpdateChildVNodes, updateVNode, createFragmentVNode } from '../vnode/VNodeCreator';
import { ClassComponent, ForwardRef, FunctionComponent, SuspenseComponent } from '../vnode/VNodeTags';
import { pushForceUpdate } from '../UpdateHandler';
import { launchUpdateFromVNode, tryRenderFromRoot } from '../TreeBuilder';
import { updateShouldUpdateOfTree } from '../vnode/VNodeShouldUpdate';
import { markVNodePath } from '../utils/vNodePath';

export enum SuspenseChildStatus {
  Init = '',
  ShowChild = 'showChild',
  ShowFallback = 'showFallback',
}

// 创建fallback子节点
function createFallback(processing: VNode, fallbackChildren) {
  const childFragment: VNode = processing.child!;
  let fallbackFragment;
  childFragment.childShouldUpdate = false;

  if (!processing.isCreated) {
    const oldFallbackFragment: VNode | null = processing.oldChild ? processing.oldChild.next : null;

    if (oldFallbackFragment !== null) {
      fallbackFragment = updateVNode(oldFallbackFragment, fallbackChildren);
    } else {
      fallbackFragment = createFragmentVNode(null, fallbackChildren);
      FlagUtils.markAddition(fallbackFragment);
    }
  } else {
    // 创建
    fallbackFragment = createFragmentVNode(null, fallbackChildren);
  }

  processing.child = childFragment;
  childFragment.next = fallbackFragment;
  childFragment.parent = processing;
  fallbackFragment.parent = processing;
  fallbackFragment.eIndex = 1;
  fallbackFragment.cIndex = 1;
  markVNodePath(fallbackFragment);
  processing.suspenseState.childStatus = SuspenseChildStatus.ShowFallback;

  return fallbackFragment;
}

// 创建子节点
function createSuspenseChildren(processing: VNode, newChildren) {
  let childFragment: VNode;
  if (!processing.isCreated) {
    const oldChildFragment: VNode = processing.child;
    const oldFallbackFragment: VNode | null = oldChildFragment.next;

    childFragment = updateVNode(oldChildFragment);
    childFragment.next = null;
    // 将Suspense新的子参数传给子Fragment
    childFragment.props = processing.props.children;
    childFragment.shouldUpdate = true;

    // 删除fallback
    if (oldFallbackFragment !== null) {
      FlagUtils.setDeletion(oldFallbackFragment);
      processing.dirtyNodes = [oldFallbackFragment];
    }
    // SuspenseComponent 中使用
    processing.suspenseState.childStatus = SuspenseChildStatus.ShowChild;
  } else {
    childFragment = createFragmentVNode(null, newChildren);
  }

  childFragment.parent = processing;
  childFragment.cIndex = 0;
  markVNodePath(childFragment);
  processing.child = childFragment;
  processing.suspenseState.promiseResolved = false;
  return processing.child;
}

export function captureSuspenseComponent(processing: VNode) {
  const nextProps = processing.props;

  // suspense被捕获后需要展示fallback
  const showFallback = processing.suspenseState.didCapture;

  if (showFallback) {
    processing.suspenseState.didCapture = false;
    const nextFallbackChildren = nextProps.fallback;
    return createFallback(processing, nextFallbackChildren);
  } else {
    const newChildren = nextProps.children;
    return createSuspenseChildren(processing, newChildren);
  }
}

function updateFallback(processing: VNode): Array<VNode> | VNode | null {
  const childFragment: VNode | null = processing.child;

  if (childFragment?.childShouldUpdate) {
    if (processing.suspenseState.promiseResolved) {
      // promise已完成，展示promise返回的新节点
      return captureSuspenseComponent(processing);
    } else {
      // promise未完成，继续显示fallback，不需要继续刷新子节点
      const fallbackFragment: VNode = processing.child!.next!;
      childFragment.childShouldUpdate = false;
      fallbackFragment.childShouldUpdate = false;
      return null;
    }
  } else {
    const children = onlyUpdateChildVNodes(processing);

    if (children !== null) {
      // child不需要更新，跳过child处理fallback
      return children[1];
    } else {
      return null;
    }
  }
}

export function captureRender(processing: VNode, shouldUpdate: boolean): Array<VNode> | VNode | null {
  if (!processing.isCreated && processing.oldProps === processing.props && !shouldUpdate) {
    if (processing.suspenseState.childStatus === SuspenseChildStatus.ShowFallback) {
      // 当显示fallback时，suspense的子组件要更新
      return updateFallback(processing);
    }
    return onlyUpdateChildVNodes(processing);
  }

  return captureSuspenseComponent(processing);
}

export function bubbleRender(processing: VNode) {
  const { childStatus, oldChildStatus } = processing.suspenseState;
  if (
    childStatus === SuspenseChildStatus.ShowFallback ||
    (!processing.isCreated && oldChildStatus === SuspenseChildStatus.ShowFallback)
  ) {
    FlagUtils.markUpdate(processing);
  }

  return null;
}

function canCapturePromise(vNode: VNode | null): boolean {
  return vNode?.suspenseState.childStatus !== SuspenseChildStatus.ShowFallback && vNode?.props.fallback !== undefined;
}

// 处理Suspense子组件抛出的promise
export function handleSuspenseChildThrowError(parent: VNode, processing: VNode, promise: PromiseType<any>): boolean {
  let vNode: VNode | null = parent;

  // 向上找到最近的不在fallback状态的Suspense，并触发重新渲染
  do {
    if (vNode.tag === SuspenseComponent && canCapturePromise(vNode)) {
      if (vNode.suspenseState.promiseSet === null) {
        vNode.suspenseState.promiseSet = new Set();
      }
      vNode.suspenseState.promiseSet.add(promise);

      // 移除生命周期flag 和 中断flag
      FlagUtils.removeLifecycleEffectFlags(processing);
      FlagUtils.removeFlag(processing, Interrupted);

      if (processing.tag === ClassComponent) {
        if (processing.isCreated) {
          // 渲染类组件场景，要标志未完成（否则会触发componentWillUnmount）
          processing.isSuspended = true;
        } else {
          // 类组件更新，标记强制更新，否则被memo等优化跳过
          pushForceUpdate(processing);
          launchUpdateFromVNode(processing);
        }
      }

      if (processing.tag === FunctionComponent || processing.tag === ForwardRef) {
        processing.isSuspended = true;
      }
      // 应该抛出promise未完成更新，标志待更新
      processing.shouldUpdate = true;

      vNode.suspenseState.didCapture = true;
      launchUpdateFromVNode(vNode);

      return true;
    }

    vNode = vNode.parent;
  } while (vNode !== null);

  return false;
}

const PossiblyWeakSet = typeof WeakSet === 'function' ? WeakSet : Set;

function resolvePromise(suspenseVNode: VNode, promise: PromiseType<any>) {
  const promiseCache = suspenseVNode.realNode;
  if (promiseCache !== null) {
    promiseCache.delete(promise);
  }
  suspenseVNode.suspenseState.promiseResolved = true;
  const root = updateShouldUpdateOfTree(suspenseVNode);
  if (root !== null) {
    tryRenderFromRoot(root);
  }
}

// 对于每个promise，添加一个侦听器，以便当它resolve时，重新渲染
export function listenToPromise(suspenseVNode: VNode) {
  const promises: Set<PromiseType<any>> | null = suspenseVNode.suspenseState.promiseSet;
  if (promises !== null) {
    suspenseVNode.suspenseState.promiseSet = null;

    // 记录已经监听的 promise
    let promiseCache = suspenseVNode.realNode;
    if (promiseCache === null) {
      promiseCache = new PossiblyWeakSet();
      suspenseVNode.realNode = new PossiblyWeakSet();
    }

    promises.forEach(promise => {
      const resole = resolvePromise.bind(null, suspenseVNode, promise);
      if (!promiseCache.has(promise)) {
        promiseCache.add(promise);
        // 监听promise
        promise.then(resole, resole);
      }
    });
  }
}
