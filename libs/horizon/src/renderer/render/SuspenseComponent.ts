import type {VNode, PromiseType} from '../Types';

import {FlagUtils, Interrupted} from '../vnode/VNodeFlags';
import {createVNode, onlyUpdateChildVNodes, updateVNode, updateVNodePath} from '../vnode/VNodeCreator';
import {
  ClassComponent,
  IncompleteClassComponent,
  SuspenseComponent,
  Fragment,
} from '../vnode/VNodeTags';
import {pushForceUpdate} from '../UpdateHandler';
import {launchUpdateFromVNode, tryRenderRoot} from '../TreeBuilder';
import {updateShouldUpdateOfTree} from '../vnode/VNodeShouldUpdate';
import {getContextChangeCtx} from '../ContextSaver';

export enum SuspenseChildStatus {
  Init = '',
  ShowChild = 'showChild',
  ShowFallback = 'showFallback',
}

// 创建fallback子节点
function createFallback(processing: VNode, fallbackChildren) {
  const childFragment: VNode = processing.child;
  let fallbackFragment;
  childFragment.childShouldUpdate = false;

  if (!processing.isCreated) {
    const oldFallbackFragment: VNode | null = processing.oldChild ? processing.oldChild.next : null;

    if (oldFallbackFragment !== null) {
      fallbackFragment = updateVNode(oldFallbackFragment, fallbackChildren);
    } else {
      fallbackFragment = createVNode(Fragment, null, fallbackChildren);
      FlagUtils.markAddition(fallbackFragment);
    }
  } else {
    // 创建
    fallbackFragment = createVNode(Fragment, null, fallbackChildren);
  }

  processing.child = childFragment;
  childFragment.next = fallbackFragment;
  childFragment.parent = processing;
  fallbackFragment.parent = processing;
  fallbackFragment.eIndex = 1;
  fallbackFragment.cIndex = 1;
  updateVNodePath(fallbackFragment);
  processing.suspenseChildStatus = SuspenseChildStatus.ShowFallback;

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
    processing.suspenseChildStatus = SuspenseChildStatus.ShowChild;
  } else {
    childFragment = createVNode(Fragment, null, newChildren);
  }

  childFragment.parent = processing;
  childFragment.cIndex = 0;
  updateVNodePath(childFragment);
  processing.child = childFragment;
  processing.promiseResolve = false;
  return processing.child;
}

export function captureSuspenseComponent(processing: VNode) {
  const nextProps = processing.props;

  // suspense被捕获后需要展示fallback
  const showFallback = processing.suspenseDidCapture;

  if (showFallback) {
    processing.suspenseDidCapture = false;
    const nextFallbackChildren = nextProps.fallback;
    return createFallback(processing, nextFallbackChildren);
  } else {
    const newChildren = nextProps.children;
    return createSuspenseChildren(processing, newChildren);
  }
}

function updateFallback(processing: VNode): Array<VNode> | VNode | null {
  const childFragment: VNode | null= processing.child;

  if (childFragment?.childShouldUpdate) {
    if (processing.promiseResolve) {
      // promise已完成，展示promise返回的新节点
      return captureSuspenseComponent(processing);
    } else {
      // promise未完成，继续显示fallback，不需要继续刷新子节点
      const fallbackFragment: VNode = processing.child.next;
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
  if (
    !processing.isCreated &&
    processing.oldProps === processing.props &&
    !getContextChangeCtx() &&
    !shouldUpdate
  ) {
    if (processing.suspenseChildStatus === SuspenseChildStatus.ShowFallback) {
      // 当显示fallback时，suspense的子组件要更新
      return updateFallback(processing);
    }
    return onlyUpdateChildVNodes(processing);
  }

  return captureSuspenseComponent(processing);
}

export function bubbleRender(processing: VNode) {
  if (processing.suspenseChildStatus === SuspenseChildStatus.ShowFallback
    || (!processing.isCreated && processing.oldSuspenseChildStatus === SuspenseChildStatus.ShowFallback)
  ) {
    FlagUtils.markUpdate(processing);
  }

  return null;
}

function canCapturePromise(vNode: VNode | null): boolean {
  return vNode?.suspenseChildStatus !== SuspenseChildStatus.ShowFallback && vNode?.props.fallback !== undefined;
}

// 处理Suspense子组件抛出的promise
export function handleSuspenseChildThrowError(parent: VNode | null, processing: VNode, error: any): boolean {
  let vNode = parent;

  // 向上找到最近的不在fallback状态的Suspense，并触发重新渲染
  do {
    if (vNode?.tag === SuspenseComponent && canCapturePromise(vNode)) {
      if (vNode.suspensePromises === null) {
        vNode.suspensePromises = new Set();
      }
      vNode.suspensePromises.add(error);

      processing.suspenseChildThrow = true;

      // 移除生命周期flag 和 中断flag
      FlagUtils.removeLifecycleEffectFlags(processing);
      FlagUtils.removeFlag(processing, Interrupted);

      if (processing.tag === ClassComponent) {
        if (processing.isCreated) {
          // 渲染类组件场景，要标志未完成（否则会触发componentWillUnmount）
          processing.tag = IncompleteClassComponent;
        } else {
          // 类组件更新，标记强制更新，否则被memo等优化跳过
          pushForceUpdate(processing);
          launchUpdateFromVNode(processing);
        }
      }

      // 应该抛出promise未完成更新，标志待更新
      processing.shouldUpdate = true;

      vNode.suspenseDidCapture = true;
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
  suspenseVNode.promiseResolve = true;
  const root = updateShouldUpdateOfTree(suspenseVNode);
  if (root !== null) {
    tryRenderRoot(root);
  }
}

// 对于每个promise，添加一个侦听器，以便当它resolve时，重新渲染
export function listenToPromise(suspenseVNode: VNode) {
  const promises: Set<PromiseType<any>> | null = suspenseVNode.suspensePromises;
  if (promises !== null) {
    suspenseVNode.suspensePromises = null;

    // 记录已经监听的 promise
    let promiseCache = suspenseVNode.realNode;
    if (promiseCache === null) {
      // @ts-ignore
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
