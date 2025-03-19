import { CompNode, getCurrentCompNode } from '../..';
import { InulaNodeType } from '../../consts';
import { InulaStore } from '../../store';
import { InulaBaseNode } from '../../types';
import { InulaHTMLNode } from '../HTMLNode/types';
import { ContextNode, PortalNode } from '../UtilNodes';
import { addParentElement, loopShallowElements } from '../utils';

export class MutableContextNode {
  savedContextNodes: ContextNode[] = [];

  parentEl?: InulaHTMLNode;
  owner: CompNode;

  /**
   * @brief Mutable node is a node that this._$nodes can be changed, things need to pay attention:
   *  1. The environment of the new nodes should be the same as the old nodes
   *  2. The new nodes should be added to the parentEl
   *  3. The old nodes should be removed from the parentEl
   * @param type
   */
  constructor() {
    this.owner = getCurrentCompNode();

    // ---- Save the current environment nodes, must be a new reference
    if (InulaStore.global.CurrentContextStore && InulaStore.global.CurrentContextStore.length > 0) {
      this.savedContextNodes = [...InulaStore.global.CurrentContextStore];
    }
  }

  /**
   * @brief Initialize the new nodes, add parentEl to all nodes
   * @param nodes
   */
  initNewNodes(nodes: InulaBaseNode[]) {
    addParentElement(nodes, this.parentEl!);
  }

  /**
   * @brief Generate new nodes in the saved environment
   * @param newNodesFunc
   * @returns
   */
  newNodesInContext(newNodesFunc: () => InulaBaseNode[]) {
    if (!this.savedContextNodes) {
      // ---- No saved environment, just generate new nodes
      const newNodes = newNodesFunc();
      // ---- Only for IfNode's same condition return
      // ---- Initialize the new nodes
      this.initNewNodes(newNodes);
      return newNodes;
    }
    // ---- Save the current environment nodes
    const currentEnvNodes = InulaStore.global.CurrentContextStore;
    // ---- Replace the saved environment nodes
    InulaStore.global.CurrentContextStore = [...this.savedContextNodes];
    const newNodes = newNodesFunc();
    // ---- Retrieve the current environment nodes
    InulaStore.global.CurrentContextStore = currentEnvNodes;
    // ---- Only for IfNode's same condition return
    // ---- Initialize the new nodes
    this.initNewNodes(newNodes);
    return newNodes;
  }

  /**
   * @brief Remove nodes from parentEl and run willUnmount and didUnmount
   * @param nodes
   * @param removeEl Only remove outermost element
   */
  removeNodes(nodes: InulaBaseNode[], parentEl?: InulaHTMLNode) {
    if (!parentEl) parentEl = this.parentEl!;
    removeNodes(nodes, parentEl);
  }

  initUnmountStore() {
    if (!InulaStore.global.WillUnmountScopedStore) InulaStore.global.WillUnmountScopedStore = [];
    if (!InulaStore.global.DidUnmountScopedStore) InulaStore.global.DidUnmountScopedStore = [];
    InulaStore.global.WillUnmountScopedStore.push([]);
    InulaStore.global.DidUnmountScopedStore.push([]);
  }
}

function removeNodes(nodes: InulaBaseNode[], parentEl: InulaHTMLNode) {
  const stack: Array<InulaBaseNode> = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node == null) continue;
    if (node instanceof HTMLElement || node instanceof Text) {
      parentEl.removeChild(node);
    } else if (node.inulaType === InulaNodeType.Portal) {
      const portalNode = node as PortalNode;
      removeNodes(portalNode.nodes, portalNode.target);
    } else if (node.nodes) {
      // @ts-expect-error to be removed
      if (node.willUnmountScopedStore?.length > 0) {
        // @ts-expect-error to be removed
        node.runWillUnmount();
      }
      stack.push(...[...node.nodes].reverse());
    }
  }
}
