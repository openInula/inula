import { TextNode } from '../../backs/src1/types';
import { InulaNodeType } from '../consts';
import { Bits, InulaBaseNode, Value } from '../types';
import { InulaHTMLNode } from './HTMLNode/types';

/**
 * @brief Get all DOM elements of the first level of the node
 * @param node The node to get elements from
 * @returns Array of HTMLElement or Text nodes
 */
export const getDOMElements = (node: InulaBaseNode): Array<HTMLElement | Text> => {
  return toDOMElements(node.nodes ?? []);
};

// --- Imperative template
export function createElement(tagName: string) {
  return document.createElement(tagName);
}
/**
 * @brief Get all DOM elements of the first level of an array of nodes
 * @param nodes Array of nodes to get elements from
 * @returns Array of HTMLElement or Text nodes
 */
export const toDOMElements = (nodes: InulaBaseNode[]): Array<HTMLElement | Text> => {
  const elements: Array<HTMLElement | Text> = [];
  loopShallowElements(nodes, el => {
    elements.push(el);
  });
  return elements;
};

/**
 * @brief Loop through all the shallow DOM elements of the nodes and run the callback function
 * @param nodes Array of nodes to loop through
 * @param runFunc Callback function to run on each element
 */
export const loopShallowElements = (nodes: InulaBaseNode[], runFunc: (el: HTMLElement | Text) => void) => {
  const stack: Array<InulaBaseNode> = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node instanceof HTMLElement || node instanceof Text) {
      runFunc(node as InulaHTMLNode | TextNode);
    } else if (node.nodes) {
      stack.push(...[...node.nodes].reverse());
    }
  }
};

/**
 * @brief Add parent element reference to all nodes recursively until reaching DOM nodes
 * @param nodes Array of nodes to add parent to
 * @param parentEl Parent HTMLElement to set
 */
export const addParentElement = (nodes: Array<InulaBaseNode>, parentEl: HTMLElement) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if ('inulaType' in node) {
      node.parentEl = parentEl;
      // ---- Recursively add parentEl to all non-html nodes
      //      because they have the same parentEl
      node.nodes && addParentElement(node.nodes, parentEl);
    }
  }
};

/**
 * @brief Get the flattened index position of a node within an array of nodes
 * @param nodes Array of nodes to search through
 * @param stopNode Optional node to stop counting at
 * @returns Index position of the stop node or total count of DOM nodes
 */
export const getFlowIndexFromNodes = (nodes: InulaBaseNode[], stopNode?: InulaBaseNode) => {
  let index = 0;
  const stack: InulaBaseNode[] = [...nodes].reverse();
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === stopNode) break;
    if ('inulaType' in node) {
      node.nodes && stack.push(...[...node.nodes].reverse());
    } else {
      index++;
    }
  }
  return index;
};

/**
 * @brief Insert nodes before a sibling or append them to parent element
 * @param nodes Array of nodes to insert/append
 * @param parentEl Parent element to insert into
 * @param nextSibling Optional next sibling node
 * @returns Number of nodes inserted
 */
export const appendNodesWithSibling = (nodes: Array<InulaBaseNode>, parentEl: HTMLElement, nextSibling?: Node) => {
  if (nextSibling) return insertNodesBefore(nodes, parentEl, nextSibling);
  return appendNodes(nodes, parentEl);
};

/**
 * @brief Insert nodes at a specific index in parent element
 * @param nodes Array of nodes to insert
 * @param parentEl Parent element to insert into
 * @param index Position to insert at
 * @param length Optional pre-calculated length of parent's children
 * @returns Number of nodes inserted
 */
export const appendNodesWithIndex = (nodes: InulaBaseNode[], parentEl: HTMLElement, index: number, length?: number) => {
  // ---- Calling parentEl.childNodes.length is expensive so we'd better pre-calculate it and pass it in
  length = length ?? parentEl.childNodes.length;
  if (length !== index) return insertNodesBefore(nodes, parentEl, parentEl.childNodes[index]);
  return appendNodes(nodes, parentEl);
};

/**
 * @brief Insert nodes before a reference node
 * @param nodes Array of nodes to insert
 * @param parentEl Parent element to insert into
 * @param nextSibling Reference node to insert before
 * @returns Number of nodes inserted
 */
export const insertNodesBefore = (nodes: InulaBaseNode[], parentEl: HTMLElement, nextSibling: Node) => {
  let count = 0;
  loopShallowElements(nodes, el => {
    parentEl.insertBefore(el, nextSibling);
    count++;
  });
  return count;
};

/**
 * @brief Append nodes to the end of a parent element
 * @param nodes Array of nodes to append
 * @param parentEl Parent element to append to
 * @returns Number of nodes appended
 */
export const appendNodes = (nodes: InulaBaseNode[], parentEl: HTMLElement) => {
  let count = 0;
  loopShallowElements(nodes, el => {
    parentEl.appendChild(el);
    count++;
  });
  return count;
};

/**
 * @brief Check if two arrays have identical values
 * @param arr1 First array to compare
 * @param arr2 Second array to compare
 * @returns True if arrays are equal, false otherwise
 */
export const arrayEqual = (arr1: Value[], arr2: Value[]) => {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, idx) => item === arr2[idx]);
};

/**
 * @brief Check if dependencies have changed from previous values
 * @param deps Current dependency values
 * @param prevDeps Previous dependency values
 * @returns True if dependencies are cached (unchanged), false otherwise
 */
export const cached = (deps: Value[], prevDeps?: Value[]) => {
  if (prevDeps && prevDeps.length === 0) return false;
  if (!prevDeps || deps.length !== prevDeps.length) return false;
  // ---- Check if all deps are the same
  //      if any dep is an object, we can't compare it with the previous one
  //      because the reference is the same but the content may be different
  // ---- Q: Why not use a deep comparison?
  //      A: Because it's slow compared to regarding the cache as invalid
  return deps.every((dep, i) => !(dep instanceof Object) && prevDeps[i] === dep);
};

// ---- All ones
export const InitDirtyBitsMask = 0xffffffff;

/**
 * @brief Update a node and all its children with dirty bits
 * @param node Node to update
 * @param dirtyBits Dirty bits indicating what needs updating
 */
export const update = (node: InulaBaseNode) => {
  node.update?.(node);
};

export const willReact = (dirtyBits: Bits, reactBits: Bits) => {
  // ---- 1. reactBits & dirtyBits means the node will react to the change
  //      2. reactBits === 0 means it's a one time update, will be blocked by cached()
  return reactBits === 0 || reactBits & dirtyBits;
};

export const init = (nodes: InulaBaseNode[]) => {
  for (let i = 0; i < nodes.length; i++) {
    update(nodes[i], InitDirtyBitsMask);
  }
};

export function withDefault(value: any, defaultValue: any) {
  return value === undefined ? defaultValue : value;
}
