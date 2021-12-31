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
  submitResetTextContent, submitUpdate, detachRef,
} from './LifeCycleHandler';
import {tryRenderRoot, setProcessing, getStartVNode} from '../TreeBuilder';
import {
  BySync,
  InRender,
  copyExecuteMode,
  setExecuteMode,
  checkMode,
  changeMode,
} from '../ExecuteMode';
import {
  isSchedulingEffects,
  setSchedulingEffects, setHookEffectRoot,
} from './HookEffectHandler';

let rootThrowError = null;

// 防止死循环调用update
const LOOPING_UPDATE_LIMIT = 50;
let loopingUpdateCount: number = 0;
let lastRoot: VNode | null = null;

export function submitToRender(treeRoot) {
  treeRoot.shouldUpdate = treeRoot.childShouldUpdate;

  const startVNode = getStartVNode();

  // 置空task，让才能加入新的render任务
  treeRoot.task = null;

  setProcessing(null);

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

    // 记录root，说明这个root有副作用要执行
    setHookEffectRoot(treeRoot);
  } else {
    clearDirtyNodes(dirtyNodes);
  }

  // 统计root同步重渲染的次数，如果太多可能是无线循环
  countLoopingUpdate(treeRoot);

  // 在退出`submit` 之前始终调用此函数，以确保任何已计划在此根上执行的update被执行。
  tryRenderRoot(treeRoot);

  if (rootThrowError) {
    const error = rootThrowError;
    rootThrowError = null;
    throw error;
  }

  // 非批量：即同步执行的，没有必要去执行RenderQueue，RenderQueue放的是异步的
  if (!checkMode(BySync)) { // 非批量
    callRenderQueueImmediate();
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
      throwIfTrue(node === null, 'Should be working on an effect.');
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

      const {Addition, Update, Deletion} = node.flags;
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
      }
    } catch (error) {
      throwIfTrue(node === null, 'Should be working on an effect.');
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
      throwIfTrue(node === null, 'Should be working on an effect.');
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

// 清理dirtyNodes
export function clearDirtyNodes(dirtyNodes) {
  dirtyNodes.forEach(node => {
    if (node.flags.Deletion) {
      node.realNode = null;
      node.next = null;
    }
  });
}
