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

import type { VNode } from '../Types';

import { FlagUtils, Addition, Snapshot, ResetText, Ref, Update, Deletion, Clear, Callback } from '../vnode/VNodeFlags';
import { prepareForSubmit, resetAfterSubmit } from '../../dom/DOMOperator';
import { handleSubmitError } from '../ErrorHandler';
import {
  attachRef,
  callAfterSubmitLifeCycles,
  callBeforeSubmitLifeCycles,
  submitDeletion,
  submitAddition,
  submitResetTextContent,
  submitUpdate,
  detachRef,
  submitClear,
} from './LifeCycleHandler';
import { tryRenderFromRoot } from '../TreeBuilder';
import { InRender, copyExecuteMode, setExecuteMode, changeMode } from '../ExecuteMode';
import { isSchedulingEffects, setSchedulingEffects } from './HookEffectHandler';
import { getStartVNode } from '../GlobalVar';

let rootThrowError = null;

// 防止死循环调用update
const LOOPING_UPDATE_LIMIT = 50;
let loopingUpdateCount = 0;
let lastRoot: VNode | null = null;

function beforeSubmit(dirtyNodes: Array<VNode>) {
  let node;
  const nodesLength = dirtyNodes.length;
  for (let i = 0; i < nodesLength; i++) {
    node = dirtyNodes[i];
    try {
      if ((node.flags & Snapshot) === Snapshot) {
        callBeforeSubmitLifeCycles(node);
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  }
}

function submit(dirtyNodes: Array<VNode>) {
  let node;
  const nodesLength = dirtyNodes.length;
  let isAdd;
  let isUpdate;
  let isDeletion;
  let isClear;
  for (let i = 0; i < nodesLength; i++) {
    node = dirtyNodes[i];
    try {
      if ((node.flags & ResetText) === ResetText) {
        submitResetTextContent(node);
      }

      if ((node.flags & Ref) === Ref) {
        if (!node.isCreated) {
          // 需要执行
          detachRef(node, true);
        }
      }

      isAdd = (node.flags & Addition) === Addition;
      isUpdate = (node.flags & Update) === Update;
      if (isAdd && isUpdate) {
        // Addition
        submitAddition(node);
        FlagUtils.removeFlag(node, Addition);

        // Update
        submitUpdate(node);
      } else {
        isDeletion = (node.flags & Deletion) === Deletion;
        isClear = (node.flags & Clear) === Clear;
        if (isAdd) {
          submitAddition(node);
          FlagUtils.removeFlag(node, Addition);
        } else if (isUpdate) {
          submitUpdate(node);
        } else if (isDeletion) {
          submitDeletion(node);
        }
        if (isClear) {
          submitClear(node);
        }
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  }
}

function afterSubmit(dirtyNodes: Array<VNode>) {
  let node;
  const nodesLength = dirtyNodes.length;
  for (let i = 0; i < nodesLength; i++) {
    node = dirtyNodes[i];
    try {
      if ((node.flags & Update) === Update || (node.flags & Callback) === Callback) {
        callAfterSubmitLifeCycles(node);
      }

      if ((node.flags & Ref) === Ref) {
        attachRef(node);
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  }
}

export function setRootThrowError(error: any) {
  if (!rootThrowError) {
    rootThrowError = error;
  }
}

// 统计root同步重渲染的次数，如果太多可能是无限循环
function countLoopingUpdate(root: VNode) {
  if (root.shouldUpdate) {
    if (root === lastRoot) {
      loopingUpdateCount++;
    } else {
      loopingUpdateCount = 0;
      lastRoot = root;
    }
  } else {
    loopingUpdateCount = 0;
  }
}

export function checkLoopingUpdateLimit() {
  if (loopingUpdateCount > LOOPING_UPDATE_LIMIT) {
    loopingUpdateCount = 0;
    lastRoot = null;

    throw Error(
      `The number of updates exceeds the upper limit ${LOOPING_UPDATE_LIMIT}.
      A component maybe repeatedly invokes setState on componentWillUpdate or componentDidUpdate.`
    );
  }
}

export function submitToRender(treeRoot) {
  treeRoot.shouldUpdate = treeRoot.childShouldUpdate;
  // 置空task，让才能加入新的render任务
  treeRoot.task = null;

  const startVNode = getStartVNode();

  if (FlagUtils.hasAnyFlag(startVNode)) {
    // 把自己加上
    if (startVNode.dirtyNodes === null) {
      startVNode.dirtyNodes = [startVNode];
    } else {
      startVNode.dirtyNodes.push(startVNode);
    }
  }

  const dirtyNodes = startVNode.dirtyNodes;
  if (dirtyNodes !== null && dirtyNodes.length) {
    const preMode = copyExecuteMode();
    changeMode(InRender, true);

    prepareForSubmit();
    // before submit阶段
    beforeSubmit(dirtyNodes);

    // submit阶段
    submit(dirtyNodes);

    resetAfterSubmit();

    // after submit阶段
    afterSubmit(dirtyNodes);

    setExecuteMode(preMode);
    dirtyNodes.length = 0;
    startVNode.dirtyNodes = null;
  }

  if (isSchedulingEffects()) {
    setSchedulingEffects(false);
  }

  // 统计root同步重渲染的次数，如果太多可能是无线循环
  countLoopingUpdate(treeRoot);

  // 在退出`submit` 之前始终调用此函数，以确保任何已计划在此根上执行的update被执行。
  tryRenderFromRoot(treeRoot);

  if (rootThrowError) {
    const error = rootThrowError;
    rootThrowError = null;
    throw error;
  }

  return null;
}
