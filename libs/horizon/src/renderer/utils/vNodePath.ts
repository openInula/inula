import { VNode } from '../vnode/VNode';

const PATH_DELIMITER = ',';

/**
 * 标记VNode在VNode树中的路径
 * @param vNode
 */
export function markVNodePath(vNode: VNode) {
  vNode.path = `${vNode.parent!.path}${PATH_DELIMITER}${vNode.cIndex}`;
}

export function getPathArr(vNode: VNode) {
  return vNode.path.split(PATH_DELIMITER);
}
