import { MutableNode, VNode, ScopedLifecycle, InulaNode, ContextNode } from '../types';
import { endUnmountScope, startUnmountScope } from '../lifecycle';
import { getContextNodeMap, replaceContext } from '../ContextNode';
import { addParentEl, loopShallowEls } from '../InulaNode';

export function setUnmountFuncs(node: MutableNode) {
  // pop will not be undefined,cause we push empty array when create node
  const [willUnmountFuncs, didUnmountFuncs] = endUnmountScope();
  node.willUnmountFuncs = willUnmountFuncs!;
  node.didUnmountFuncs = didUnmountFuncs!;
}

export function runLifeCycle(fn: ScopedLifecycle) {
  for (let i = 0; i < fn.length; i++) {
    fn[i]();
  }
}

export function removeNodesWithUnmount(node: MutableNode, children: InulaNode[]) {
  runLifeCycle(node.willUnmountFuncs);
  removeNodes(node, children);
  runLifeCycle(node.didUnmountFuncs);
}

export function geneNewNodesInEnvWithUnmount(node: MutableNode, newNodesFunc: () => VNode[]) {
  startUnmountScope();
  const nodes = geneNewNodesInCtx(node, newNodesFunc);
  setUnmountFuncs(node);
  return nodes;
}
export function getSavedCtxNodes(): Map<symbol, ContextNode<any>> | null {
  const contextNodeMap = getContextNodeMap();
  if (contextNodeMap) {
    return new Map([...contextNodeMap]);
  }
  return null;
}
/**
 * @brief Initialize the new nodes, add parentEl to all nodes
 */
function initNewNodes(node: VNode, children: Array<InulaNode>) {
  // ---- Add parentEl to all children
  addParentEl(children, node._$parentEl!);
}
/**
 * @brief Generate new nodes in the saved context
 * @param node
 * @param newNodesFunc
 * @returns
 */

export function geneNewNodesInCtx(node: MutableNode<any>, newNodesFunc: () => Array<InulaNode>) {
  if (!node.savedContextNodes) {
    // ---- No saved context, just generate new nodes
    const newNodes = newNodesFunc();
    // ---- Only for IfNode's same condition return
    // ---- Initialize the new nodes
    initNewNodes(node, newNodes);
    return newNodes;
  }
  // ---- Save the current context nodes
  const currentContextNodes = getContextNodeMap()!;
  // ---- Replace the saved context nodes
  replaceContext(node.savedContextNodes);
  const newNodes = newNodesFunc();
  // ---- Retrieve the current context nodes
  replaceContext(currentContextNodes);
  // ---- Only for IfNode's same condition return
  // ---- Initialize the new nodes
  initNewNodes(node, newNodes);
  return newNodes;
}

/**
 * @brief Remove nodes from parentEl and run willUnmount and didUnmount
 */
export function removeNodes(node: VNode, children: InulaNode[]) {
  loopShallowEls(children, dom => {
    node._$parentEl!.removeChild(dom);
  });
}
