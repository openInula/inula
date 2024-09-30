import { appendNodesWithSibling, getFlowIndexFromNodes } from '../InulaNode.js';
import { addDidUnmount, addWillUnmount, runDidMount } from '../lifecycle.js';
import {
  geneNewNodesInEnvWithUnmount,
  removeNodesWithUnmount,
  runLifeCycle,
  setUnmountFuncs,
} from './mutableHandler.js';
import { CondNode, VNode } from '../types';
import { geneNewNodesInCtx, getSavedCtxNodes, removeNodes } from './mutableHandler.js';
import { startUnmountScope } from '../lifecycle.js';
import { InulaNodeType } from '@openinula/next-shared';

export function createCondNode(depNum: number, condFunc: (condNode: CondNode) => VNode[]) {
  startUnmountScope();

  const condNode: CondNode = {
    __type: InulaNodeType.Cond,
    cond: -1,
    didntChange: false,
    depNum,
    condFunc,
    savedContextNodes: getSavedCtxNodes(),
    _$nodes: [],
    willUnmountFuncs: [],
    didUnmountFuncs: [],
  };

  condNode._$nodes = condFunc(condNode);
  setUnmountFuncs(condNode);

  if (condNode.willUnmountFuncs) {
    // ---- Add condNode willUnmount func to the global UnmountStore
    addWillUnmount(condNode, runLifeCycle.bind(condNode, condNode.willUnmountFuncs));
  }
  if (condNode.didUnmountFuncs) {
    // ---- Add condNode didUnmount func to the global UnmountStore
    addDidUnmount(condNode, runLifeCycle.bind(condNode, condNode.didUnmountFuncs));
  }

  return condNode;
}

/**
 * @brief the condition changed, update children of current branch
 */
export function updateCondChildren(condNode: CondNode, changed: number) {
  if (condNode.depNum & changed) {
    //  If the depNum of the condition has changed, directly return because node already updated in the `updateBranch`
    return;
  }
  condNode.updateFunc?.(changed);
}

/**
 * @brief The update function of CondNode's childNodes when the condition changed
 */
export function updateCondNode(condNode: CondNode) {
  //  ---- Need to save prev unmount funcs because we can't put removeNodes before geneNewNodesInEnv
  //      The reason is that if it didn't change, we don't need to unmount or remove the nodes
  const prevFuncs = [condNode.willUnmountFuncs, condNode.didUnmountFuncs];
  const newNodes = geneNewNodesInEnvWithUnmount(condNode, () => condNode.condFunc(condNode));

  // ---- If the new nodes are the same as the old nodes, we only need to update  children
  if (condNode.didntChange) {
    [condNode.willUnmountFuncs, condNode.didUnmountFuncs] = prevFuncs;
    condNode.didntChange = false;
    condNode.updateFunc?.(condNode.depNum);
    return;
  }
  // ---- Remove old nodes
  const newFuncs = [condNode.willUnmountFuncs, condNode.didUnmountFuncs];
  [condNode.willUnmountFuncs, condNode.didUnmountFuncs] = prevFuncs;
  condNode._$nodes && condNode._$nodes.length > 0 && removeNodesWithUnmount(condNode, condNode._$nodes);
  [condNode.willUnmountFuncs, condNode.didUnmountFuncs] = newFuncs;

  if (newNodes.length === 0) {
    // ---- No branch has been taken
    condNode._$nodes = [];
    return;
  }
  // ---- Add new nodes
  const parentEl = condNode._$parentEl!;
  // ---- Faster append with nextSibling rather than flowIndex
  const flowIndex = getFlowIndexFromNodes(parentEl._$nodes, condNode);

  const nextSibling = parentEl.childNodes[flowIndex];
  appendNodesWithSibling(newNodes, parentEl, nextSibling);
  runDidMount();
  condNode._$nodes = newNodes;
}
