import { Bits, InulaBaseNode, Value } from '../../types';
import { getFlowIndexFromNodes, appendNodesWithIndex, addParentElement, appendNodes, cached, willReact } from '../utils';
import { InulaHTMLNode, InulaTextNode } from './types';

/**
 * @brief Insert any DLNode into an element, set the nodes and append the element to the element's children
 * @param el
 * @param node
 * @param position
 */
export const insertNode = (el: InulaHTMLNode, node: InulaBaseNode, position: number) => {
  if (node == null) return;
  // ---- Set nodes
  if (!el.nodes) el.nodes = Array.from(el.childNodes) as InulaHTMLNode[];
  el.nodes.splice(position, 0, node);

  // ---- Insert nodes' elements
  const flowIdx = getFlowIndexFromNodes(el.nodes, node);
  appendNodesWithIndex([node], el, flowIdx);
  // ---- Set parentEl
  addParentElement([node], el);
}


/**
 * @brief Check if the node should update
 * @param node
 * @param key
 * @param dependencies
 * @param reactBits
 * @returns
 */
export const shouldUpdate = (node: InulaHTMLNode | InulaTextNode, key: string, dependencies: Value[], reactBits: Bits) => {
  // ---- If not reacting to the change
  if (!willReact(node.__$owner!.dirtyBits!, reactBits)) return false;
  // ---- If not cached
  if (cached(dependencies, node[`c$${key}`])) return false;
  node[`c$${key}`] = dependencies;

  return true;
}


export const getElementByPosition = (element: HTMLElement, ...positions: number[]) => {
  let current = element;
  
  for (let i = 0; i < positions.length; i++) {
    const pos = positions[i];
    if (i < 2) {
      // Use firstChild/nextSibling for first two levels
      if (pos === 0) {
        current = current.firstChild as HTMLElement;
      } else {
        let temp = current.firstChild as HTMLElement;
        for (let j = 0; j < pos; j++) {
          temp = temp.nextSibling as HTMLElement;
        }
        current = temp;
      }
    } else {
      // Use childNodes[index] for deeper levels
      current = current.childNodes[pos] as HTMLElement;
    }
  }
  
  return current;
}
