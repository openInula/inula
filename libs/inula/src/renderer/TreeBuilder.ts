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

import type { VNode } from './Types';

import { callRenderQueueImmediate, pushRenderCallback } from './taskExecutor/RenderQueue';
import { updateVNode } from './vnode/VNodeCreator';
import { ContextProvider, DomComponent, DomPortal, TreeRoot } from './vnode/VNodeTags';
import { FlagUtils, InitFlag, Interrupted } from './vnode/VNodeFlags';
import { captureVNode } from './render/BaseComponent';
import { checkLoopingUpdateLimit, submitToRender } from './submit/Submit';
import { runAsyncEffects } from './submit/HookEffectHandler';
import { handleRenderThrowError } from './ErrorHandler';
import componentRenders from './render';
import {
  BuildCompleted,
  BuildFatalErrored,
  BuildInComplete,
  getBuildResult,
  getStartVNode,
  setBuildResult,
  setProcessingClassVNode,
  setStartVNode,
} from './GlobalVar';
import {
  ByAsync,
  BySync,
  changeMode,
  checkMode,
  copyExecuteMode,
  InEvent,
  InRender,
  isExecuting,
  setExecuteMode,
} from './ExecuteMode';
import { resetContext, resetNamespaceCtx, setContext, setNamespaceCtx } from './ContextSaver';
import {
  updateChildShouldUpdate,
  updateParentsChildShouldUpdate,
  updateShouldUpdateOfTree,
} from './vnode/VNodeShouldUpdate';
import { getPathArr } from './utils/vNodePath';
import { injectUpdater } from '../external/devtools';
import { popCurrentRoot, pushCurrentRoot } from './RootStack';

// 不可恢复错误
let unrecoverableErrorDuringBuild: any = null;

// 当前运行的vNode节点
let processing: VNode | null = null;

export function setProcessing(vNode: VNode | null) {
  processing = vNode;
}

// 为重新进行深度遍历做准备
function resetProcessingVariables(startUpdateVNode: VNode) {
  // 创建processing
  processing = updateVNode(startUpdateVNode, startUpdateVNode?.props);
  setBuildResult(BuildInComplete);
  unrecoverableErrorDuringBuild = null;
}

// 收集有变化的节点，在submit阶段继续处理
function collectDirtyNodes(vNode: VNode, parent: VNode): void {
  // 将子树和此vNode的所有效果附加到父树的效果列表中，子项的完成顺序会影响副作用顺序。
  const dirtyNodes = vNode.dirtyNodes;
  if (dirtyNodes !== null && dirtyNodes.length) {
    if (parent.dirtyNodes === null) {
      parent.dirtyNodes = dirtyNodes;
    } else {
      parent.dirtyNodes.push(...vNode.dirtyNodes);
      dirtyNodes.length = 0;
    }
    vNode.dirtyNodes = null;
  }

  if (FlagUtils.hasAnyFlag(vNode)) {
    if (parent.dirtyNodes === null) {
      parent.dirtyNodes = [vNode];
    } else {
      parent.dirtyNodes.push(vNode);
    }
  }
}

// ============================== 向上冒泡 ==============================

// 尝试完成当前工作单元，然后移动到下一个兄弟工作单元。如果没有更多的同级，请返回父vNode。
function bubbleVNode(vNode: VNode): void {
  let node = vNode;

  do {
    const parent = node.parent;

    if ((node.flags & Interrupted) === InitFlag) {
      // vNode没有抛出异常
      componentRenders[node.tag].bubbleRender(node);

      // 设置node的childShouldUpdate属性
      updateChildShouldUpdate(node);

      if (parent !== null && node !== getStartVNode() && (parent.flags & Interrupted) === InitFlag) {
        collectDirtyNodes(node, parent);
      }
    }

    // 回到了开始遍历的节点
    if (node === getStartVNode()) {
      if (node.tag !== TreeRoot) {
        // 设置父node的childShouldUpdate属性
        updateParentsChildShouldUpdate(node);
      }

      processing = null;
      break;
    }

    const siblingVNode = node.next;
    if (siblingVNode !== null) {
      // 有兄弟vNode
      processing = siblingVNode;
      return;
    }

    // 继续遍历parent
    node = parent;
    // 更新processing，抛出异常时可以使用
    processing = node;
  } while (node);

  // 修改结果
  if (getBuildResult() === BuildInComplete) {
    setBuildResult(BuildCompleted);
  }
}

function handleError(root, error): void {
  if (processing === null || processing.parent === null) {
    // 这是一个致命的错误，因为没有祖先可以处理它
    setBuildResult(BuildFatalErrored);
    unrecoverableErrorDuringBuild = error;

    processing = null;
    return;
  }

  // 处理capture和bubble阶段抛出的错误
  handleRenderThrowError(processing, error);

  bubbleVNode(processing);
}

// 判断数组中节点的path的idx元素是否都相等
function isEqualByIndex(idx: number, pathArrays: string[][]) {
  const first = pathArrays[0][idx];
  for (let i = 1; i < pathArrays.length; i++) {
    const pathArr = pathArrays[i];
    if (idx >= pathArr.length || first !== pathArr[idx]) {
      return false;
    }
  }

  return true;
}

function getChildByIndex(vNode: VNode, idx: number) {
  let node = vNode.child;
  for (let i = 0; i < idx; i++) {
    // 场景：当组件被销毁，业务若异步（定时器）调用setState修改状态，可能出现路径错误，此处进行保护。
    if (node === null || node === undefined) {
      return null;
    }

    node = node.next;
  }
  return node;
}

// 从多个更新节点中，计算出开始节点。即：找到最近的共同的父辈节点
export function calcStartUpdateVNode(treeRoot: VNode) {
  const toUpdateNodes = Array.from(treeRoot.toUpdateNodes);

  if (toUpdateNodes.length === 0) {
    return treeRoot;
  }

  if (toUpdateNodes.length === 1) {
    const toUpdateNode = toUpdateNodes[0];
    if (toUpdateNode.isCleared) {
      return treeRoot;
    } else {
      return toUpdateNodes[0];
    }
  }

  // 要计算的节点过多，直接返回根节点
  if (toUpdateNodes.length > 100) {
    return treeRoot;
  }

  const pathArrays = toUpdateNodes.map(node => getPathArr(node));
  // 找出开始不相等的idx
  let commonPathEndIndex = 0;
  while (isEqualByIndex(commonPathEndIndex, pathArrays)) {
    commonPathEndIndex++;
  }
  // 得到相等的路径
  const startNodePath = pathArrays[0].slice(0, commonPathEndIndex);

  let node = treeRoot;
  for (let i = 1; i < startNodePath.length; i++) {
    const pathIndex = Number(startNodePath[i]);
    node = getChildByIndex(node, pathIndex)!;
    // 路径错误时，回退到从根更新
    if (node === null) {
      return treeRoot;
    }
  }

  return node;
}

// 在局部更新时，从上到下恢复父节点的context和PortalStack
function recoverTreeContext(vNode: VNode) {
  const contextProviders: VNode[] = [];
  let parent = vNode.parent;
  while (parent !== null) {
    if (parent.tag === ContextProvider) {
      contextProviders.unshift(parent);
    }
    if (parent.tag === DomPortal) {
      pushCurrentRoot(parent);
    }
    parent = parent.parent;
  }

  contextProviders.forEach(node => {
    setContext(node, node.props.value);
  });
}

// 在局部更新时，从下到上重置父节点的context
function resetTreeContext(vNode: VNode) {
  let parent = vNode.parent;

  while (parent !== null) {
    if (parent.tag === ContextProvider) {
      resetContext(parent);
    }
    if (parent.tag === DomPortal) {
      popCurrentRoot();
    }
    parent = parent.parent;
  }
}

// ============================== 深度遍历 ==============================
function buildVNodeTree(treeRoot: VNode) {
  const preMode = copyExecuteMode();
  changeMode(InRender, true);

  // 计算出开始节点
  const startVNode = calcStartUpdateVNode(treeRoot);
  // 缓存起来
  setStartVNode(startVNode);

  // 清空toUpdateNodes
  treeRoot.toUpdateNodes.clear();

  if (startVNode.tag !== TreeRoot) {
    // 不是根节点
    // 设置namespace，用于createElement
    let parent = startVNode.parent;
    while (parent !== null) {
      const tag = parent.tag;
      if (tag === DomComponent) {
        break;
      } else if (tag === TreeRoot || tag === DomPortal) {
        break;
      }
      parent = parent.parent;
    }

    // 当在componentWillUnmount中调用setState，parent可能是null，因为startVNode会被clear
    if (parent !== null) {
      resetNamespaceCtx(parent);
      setNamespaceCtx(parent, parent.realNode);
    }

    // 恢复父节点的context
    recoverTreeContext(startVNode);
  }

  // 重置环境变量，为重新进行深度遍历做准备
  resetProcessingVariables(startVNode);
  // devProps 用于插件手动更新props值
  if (startVNode.devProps !== undefined) {
    startVNode.props = startVNode.devProps;
    startVNode.devProps = undefined;
  }

  while (processing !== null) {
    try {
      // 捕获创建 vNodes
      const next = captureVNode(processing);

      if (next === null) {
        // 如果没有子节点，那么就完成当前节点，开始冒泡
        bubbleVNode(processing);
      } else {
        processing = next;
      }
    } catch (thrownValue) {
      handleError(treeRoot, thrownValue);
    }
  }
  if (startVNode.tag !== TreeRoot) {
    // 不是根节点
    // 恢复父节点的context
    resetTreeContext(startVNode);
  }

  setProcessingClassVNode(null);

  setExecuteMode(preMode);
}

// 总体任务入口
function renderFromRoot(treeRoot) {
  runAsyncEffects();
  pushCurrentRoot(treeRoot);

  // 1. 构建vNode树
  buildVNodeTree(treeRoot);

  // 致命错误直接抛出
  if (getBuildResult() === BuildFatalErrored) {
    throw unrecoverableErrorDuringBuild;
  }

  // 2. 提交变更
  submitToRender(treeRoot);

  popCurrentRoot();
  if (window.__INULA_DEV_HOOK__) {
    const hook = window.__INULA_DEV_HOOK__;
    // injector.js 可能在 Inula 代码之后加载，此时无 __INULA_DEV_HOOK__ 全局变量
    // Inula 代码初次加载时不会初始化 helper
    if (!hook.isInit) {
      injectUpdater();
    }
    hook.addIfNotInclude(treeRoot);
    hook.send(treeRoot);
  }
  return null;
}

// 尝试去渲染，已有任务就跳出
export function tryRenderFromRoot(treeRoot: VNode) {
  if (treeRoot.shouldUpdate && treeRoot.task === null) {
    // 任务放进queue，但是调度开始还是异步的
    treeRoot.task = pushRenderCallback(renderFromRoot.bind(null, treeRoot));
  }
}

// 发起更新
export function launchUpdateFromVNode(vNode: VNode) {
  // 检查循环调用
  checkLoopingUpdateLimit();

  // 从当前vNode向上遍历到根节点，修改vNode.shouldUpdate和parent.childShouldUpdate
  const treeRoot = updateShouldUpdateOfTree(vNode);
  if (treeRoot === null) {
    // 可能场景是：the componentWillUnmount method 或 useEffect cleanup function 方法中写异步任务，并且修改state。
    // 因为异步回调的时候root都可能被清除了。
    return;
  }

  // 保存待刷新的节点
  treeRoot.toUpdateNodes?.add(vNode);

  if (
    checkMode(BySync) && // 非批量
    !checkMode(InRender)
  ) {
    // 不是渲染阶段触发

    // 业务直接调用Inula.render的时候会进入这个分支，同步渲染。
    // 不能改成下面的异步，否则会有时序问题，因为业务可能会依赖这个渲染的完成。
    renderFromRoot(treeRoot);
  } else {
    tryRenderFromRoot(treeRoot);

    if (!isExecuting()) {
      // 同步执行
      callRenderQueueImmediate();
    }
  }
}

// ============================== InulaDOM使用 ==============================
export function runDiscreteUpdates() {
  if (checkMode(ByAsync) || checkMode(InRender)) {
    // 已经渲染，不能再同步执行待工作的任务，有可能是被生命周期或effect触发的事件导致的，如el.focus()
    return;
  }

  runAsyncEffects();
}

export function asyncUpdates(fn, ...param) {
  const preMode = copyExecuteMode();
  changeMode(InEvent, true);
  try {
    return fn(...param);
  } finally {
    setExecuteMode(preMode);
    if (!isExecuting()) {
      // 同步执行
      callRenderQueueImmediate();
    }
  }
}

export function syncUpdates(fn) {
  const preMode = copyExecuteMode();
  // 去掉异步状态，添加同步状态
  changeMode(ByAsync, false);
  changeMode(BySync, true);

  try {
    return fn();
  } finally {
    setExecuteMode(preMode);
    if (!isExecuting()) {
      // 同步执行
      callRenderQueueImmediate();
    }
  }
}
