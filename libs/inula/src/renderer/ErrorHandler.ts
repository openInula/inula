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
 * 异常错误处理
 */

import type { PromiseType, VNode } from './Types';
import type { Update } from './UpdateHandler';

import { ClassComponent, TreeRoot } from './vnode/VNodeTags';
import { FlagUtils, Interrupted, DidCapture, InitFlag } from './vnode/VNodeFlags';
import { newUpdate, UpdateState, pushUpdate } from './UpdateHandler';
import { launchUpdateFromVNode, tryRenderFromRoot } from './TreeBuilder';
import { setRootThrowError } from './submit/Submit';
import { handleSuspenseChildThrowError } from './render/SuspenseComponent';
import { updateShouldUpdateOfTree } from './vnode/VNodeShouldUpdate';
import { BuildErrored, setBuildResult } from './GlobalVar';

function consoleError(error: any): void {
  if (isTest) {
    // 只打印message为了让测试用例能pass
    console['error']('The codes throw the error: ' + error.message);
  } else {
    console['error'](error);
  }
}

function handleRootError(error: any) {
  // 注意：如果根节点抛出错误，不会销毁整棵树，只打印日志，抛出异常。
  setRootThrowError(error);
  consoleError(error);
}

function createClassErrorUpdate(vNode: VNode, error: any): Update {
  const update = newUpdate();
  update.type = UpdateState.Error;

  const getDerivedStateFromError = vNode.type.getDerivedStateFromError;
  if (typeof getDerivedStateFromError === 'function') {
    update.content = () => {
      consoleError(error);
      return getDerivedStateFromError(error);
    };
  }

  const inst = vNode.realNode;
  if (inst !== null && typeof inst.componentDidCatch === 'function') {
    update.callback = function callback() {
      if (typeof getDerivedStateFromError !== 'function') {
        // 打印错误
        consoleError(error);
      }

      // @ts-ignore
      this.componentDidCatch(error, {
        componentStack: '',
      });
    };
  }
  return update;
}
export function isPromise(error: any): error is PromiseType<any> {
  return error !== null && typeof error === 'object' && typeof error.then === 'function';
}
// 处理capture和bubble阶段抛出的错误
export function handleRenderThrowError(sourceVNode: VNode, error: any) {
  // vNode抛出了异常，标记Interrupted中断
  FlagUtils.markInterrupted(sourceVNode);
  // dirtyNodes 不再有效
  sourceVNode.dirtyNodes = null;

  // error是个promise
  if (isPromise(error)) {
    // 抛出异常的节点，向上寻找，是否有suspense组件
    const foundSuspense = handleSuspenseChildThrowError(sourceVNode.parent, sourceVNode, error);
    if (foundSuspense) {
      return;
    }
  }

  // 抛出错误无法作为suspense内容处理（或无suspense来处理），这次当成真的错误来处理
  setBuildResult(BuildErrored);

  // 向上遍历寻找ClassComponent组件（同时也是Error Boundaries组件） 或者 TreeRoot
  let vNode = sourceVNode.parent;
  do {
    switch (vNode.tag) {
      case TreeRoot: {
        vNode.shouldUpdate = true;
        launchUpdateFromVNode(vNode);
        handleRootError(error);
        return;
      }
      case ClassComponent:
        const ctor = vNode.type;
        const instance = vNode.realNode;
        if (
          (vNode.flags & DidCapture) === InitFlag &&
          (typeof ctor.getDerivedStateFromError === 'function' ||
            (instance !== null && typeof instance.componentDidCatch === 'function'))
        ) {
          FlagUtils.markShouldCapture(vNode);

          // Class捕捉到异常，触发一次刷新
          const update = createClassErrorUpdate(vNode, error);
          pushUpdate(vNode, update);

          launchUpdateFromVNode(vNode);

          // 有异常处理类，把抛出异常的节点的Interrupted标志去掉，继续走正常的绘制流程
          FlagUtils.removeFlag(sourceVNode, Interrupted);

          return;
        }
        break;
      default:
        break;
    }
    vNode = vNode.parent;
  } while (vNode !== null);
}

// 新增一个update，并且触发调度
function triggerUpdate(vNode, state) {
  const update = newUpdate();
  update.content = state;
  pushUpdate(vNode, update);

  const root = updateShouldUpdateOfTree(vNode);
  if (root !== null) {
    tryRenderFromRoot(root);
  }
}

// 处理submit阶段的异常
export function handleSubmitError(vNode: VNode, error: any) {
  if (vNode.tag === TreeRoot) {
    handleRootError(error);
    return;
  }

  let node = vNode.parent;
  // 向上遍历
  while (node !== null) {
    if (node.tag === TreeRoot) {
      handleRootError(error);
      return;
    } else if (node.tag === ClassComponent) {
      // 只有 class 组件才可以成为错误边界组件
      const ctor = node.type;
      const instance = node.realNode;
      if (typeof ctor.getDerivedStateFromError === 'function' || typeof instance.componentDidCatch === 'function') {
        const getDerivedStateFromError = node.type.getDerivedStateFromError;
        if (typeof getDerivedStateFromError === 'function') {
          // 打印错误
          consoleError(error);

          const retState = getDerivedStateFromError(error);
          if (retState) {
            // 有返回值
            // 触发更新
            triggerUpdate(node, retState);
          }
        }

        // 处理componentDidCatch
        if (instance !== null && typeof instance.componentDidCatch === 'function') {
          if (typeof getDerivedStateFromError !== 'function') {
            // 没有getDerivedStateFromError
            // 打印错误
            consoleError(error);
          }

          instance.componentDidCatch(error, {
            componentStack: '',
          });
        }

        return;
      }
    }
    node = node.parent;
  }
}
