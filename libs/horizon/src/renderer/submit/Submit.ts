import type {VNode} from '../Types';

import {callRenderQueueImmediate} from '../taskExecutor/RenderQueue';
import {throwIfTrue} from '../utils/throwIfTrue';
import {FlagUtils, Addition as AdditionFlag} from '../vnode/VNodeFlags';
import {prepareForSubmit, resetAfterSubmit} from '../../dom/DOMOperator';
import {handleSubmitError} from '../ErrorHandler';
import {
  attachRef,
  callAfterSubmitLifeCycles,
  callBeforeSubmitLifeCycles, submitDeletion, submitAddition,
  submitResetTextContent, submitUpdate, detachRef, submitClear,
} from './LifeCycleHandler';
import {tryRenderFromRoot} from '../TreeBuilder';
import {
  InRender,
  copyExecuteMode,
  setExecuteMode,
  changeMode,
} from '../ExecuteMode';
import {
  isSchedulingEffects,
  setSchedulingEffects,
} from './HookEffectHandler';
import {getStartVNode} from '../GlobalVar';

let rootThrowError = null;

// 防止死循环调用update
const LOOPING_UPDATE_LIMIT = 50;
let loopingUpdateCount: number = 0;
let lastRoot: VNode | null = null;

export function submitToRender(treeRoot) {
  treeRoot.shouldUpdate = treeRoot.childShouldUpdate;
  // 置空task，让才能加入新的render任务
  treeRoot.task = null;

  const startVNode = getStartVNode();

  if (FlagUtils.hasAnyFlag(startVNode)) {
    // 把自己加上
    startVNode.dirtyNodes.push(startVNode);
  }

  const dirtyNodes = startVNode.dirtyNodes;
  if (dirtyNodes.length) {
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

    setExecuteMode(preMode)
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

function beforeSubmit(dirtyNodes: Array<VNode>) {
  dirtyNodes.forEach(node => {
    try {
      if (node.flags.Snapshot) {
        callBeforeSubmitLifeCycles(node);
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  });
}

function submit(dirtyNodes: Array<VNode>) {
  dirtyNodes.forEach(node => {
    try {
      if (node.flags.ResetText) {
        submitResetTextContent(node);
      }

      if (node.flags.Ref) {
        if (!node.isCreated) {
          // 需要执行
          detachRef(node, true);
        }
      }

      const {Addition, Update, Deletion, Clear} = node.flags;
      if (Addition && Update) {
        // Addition
        submitAddition(node);
        FlagUtils.removeFlag(node, AdditionFlag);

        // Update
        submitUpdate(node);
      } else {
        if (Addition) {
          submitAddition(node);
          FlagUtils.removeFlag(node, AdditionFlag);
        } else if (Update) {
          submitUpdate(node);
        } else if (Deletion) {
          submitDeletion(node);
        }
        if (Clear) {
          submitClear(node);
        }
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  });
}

function afterSubmit(dirtyNodes: Array<VNode>) {
  dirtyNodes.forEach(node => {
    try {
      if (node.flags.Update || node.flags.Callback) {
        callAfterSubmitLifeCycles(node);
      }

      if (node.flags.Ref) {
        attachRef(node);
      }
    } catch (error) {
      handleSubmitError(node, error);
    }
  });
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
