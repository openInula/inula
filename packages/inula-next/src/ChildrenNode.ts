import { addWillUnmount } from './lifecycle';
import { ChildrenNode, VNode, Updater } from './types';
import { InulaNodeType } from '@openinula/next-shared';

export function createChildrenNode(childrenFunc: (addUpdate: (updater: Updater) => void) => VNode[]): ChildrenNode {
  return {
    __type: InulaNodeType.Children,
    childrenFunc,
    updaters: new Set(),
  };
}

/**
 * @brief Build the prop view by calling the childrenFunc and add every single instance of the returned InulaNode to updaters
 * @returns An array of InulaNode instances returned by childrenFunc
 */
export function buildChildren(childrenNode: ChildrenNode) {
  let update;
  const addUpdate = (updateFunc: Updater) => {
    update = updateFunc;
    childrenNode.updaters.add(updateFunc);
  };
  const newNodes = childrenNode.childrenFunc(addUpdate);
  if (newNodes.length === 0) return [];
  if (update) {
    // Remove the updateNode from dlUpdateNodes when it unmounts
    addWillUnmount(newNodes[0], childrenNode.updaters.delete.bind(childrenNode.updaters, update));
  }

  return newNodes;
}

/**
 * @brief Update every node in dlUpdateNodes
 * @param changed - A parameter indicating what changed to trigger the update
 */
export function updateChildrenNode(childrenNode: ChildrenNode, changed: number) {
  childrenNode.updaters.forEach(update => {
    update(changed);
  });
}
