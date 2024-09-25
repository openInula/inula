import { InulaNodeType } from '@openinula/next-shared';
import {
  appendNodesWithIndex,
  appendNodesWithSibling,
  getFlowIndexFromNodes,
  insertNodesBefore,
  toEls,
} from '../InulaNode';
import { addDidUnmount, addWillUnmount, endUnmountScope, runDidMount } from '../lifecycle';
import { ForNode, InulaNode, VNode } from '../types';
import { geneNewNodesInCtx, getSavedCtxNodes } from './mutableHandler';
import { startUnmountScope } from '../lifecycle';
import { removeNodes as removeMutableNodes } from './mutableHandler';

export function createForNode<T>(
  array: T[],
  depNum: number,
  keys: number[],
  nodeFunc: (item: T, idx: number, updateArr: any[]) => VNode[]
) {
  const forNode: ForNode<T> = {
    __type: InulaNodeType.For,
    array: [...array],
    depNum,
    keys,
    nodeFunc,
    nodesMap: new Map(),
    updateArr: [],
    didUnmountFuncs: new Map(),
    willUnmountFuncs: new Map(),
    savedContextNodes: getSavedCtxNodes(),
    get _$nodes() {
      const nodes = [];
      for (let idx = 0; idx < forNode.array.length; idx++) {
        nodes.push(...forNode.nodesMap.get(forNode.keys?.[idx] ?? idx)!);
      }
      return nodes;
    },
  };
  addNodeFunc(forNode, nodeFunc);
  return forNode;
}

/**
 * @brief To be called immediately after the constructor
 * @param forNode
 * @param nodeFunc
 */
function addNodeFunc<T>(forNode: ForNode<T>, nodeFunc: (item: T, idx: number, updateArr: any[]) => VNode[]) {
  forNode.array.forEach((item, idx) => {
    startUnmountScope();
    const key = forNode.keys?.[idx] ?? idx;
    const nodes = nodeFunc(item, idx, forNode.updateArr);
    forNode.nodesMap.set(key, nodes);
    setUnmountMap(forNode, key);
  });

  // ---- For nested ForNode, the whole strategy is just like EnvStore
  //      we use array of function array to create "environment", popping and pushing
  addWillUnmount(forNode, () => runLifecycleMap(forNode.willUnmountFuncs));
  addDidUnmount(forNode, () => runLifecycleMap(forNode.didUnmountFuncs));
}

function runLifecycleMap<T>(map: Map<number, any[]>, key?: number) {
  if (!map || map.size === 0) {
    return;
  }
  if (typeof key === 'number') {
    const funcs = map.get(key);
    if (!funcs) return;
    for (let i = 0; i < funcs.length; i++) funcs[i]?.();
    map.delete(key);
  } else {
    map.forEach(funcs => {
      for (let i = funcs.length - 1; i >= 0; i--) funcs[i]?.();
    });
    map.clear();
  }
}

/**
 * @brief Set the unmount map by getting the last unmount map from the global store
 * @param key
 */
function setUnmountMap<T>(forNode: ForNode<T>, key: number) {
  const [willUnmountMap, didUnmountMap] = endUnmountScope();
  if (willUnmountMap && willUnmountMap.length > 0) {
    if (!forNode.willUnmountFuncs) forNode.willUnmountFuncs = new Map();
    forNode.willUnmountFuncs.set(key, willUnmountMap);
  }
  if (didUnmountMap && didUnmountMap.length > 0) {
    if (!forNode.didUnmountFuncs) forNode.didUnmountFuncs = new Map();
    forNode.didUnmountFuncs.set(key, didUnmountMap);
  }
}

/**
 * @brief Non-array update function, invoke children's update function
 * @param changed
 */
export function updateForChildren<T>(forNode: ForNode<T>, changed: number) {
  // ---- e.g. this.depNum -> 1110 changed-> 1010
  //      ~this.depNum & changed -> ~1110 & 1010 -> 0000
  //      no update because depNum contains all the changed
  // ---- e.g. this.depNum -> 1110 changed-> 1101
  //      ~this.depNum & changed -> ~1110 & 1101 -> 000f1
  //      update because depNum doesn't contain all the changed
  if (!(~forNode.depNum & changed)) return;
  for (let idx = 0; idx < forNode.array.length; idx++) {
    updateItem(forNode, idx, forNode.array, changed);
  }
}

/**
 * @brief Update the view related to one item in the array
 * @param forNode - The ForNode
 * @param idx - The index of the item in the array
 * @param array - The array of items
 * @param changed - The changed bit
 */
function updateItem<T>(forNode: ForNode<T>, idx: number, array: T[], changed?: number) {
  // ---- The update function of ForNode's childNodes is stored in the first child node
  forNode.updateArr[idx]?.(changed ?? forNode.depNum, array[idx]);
}

/**
 * @brief Array-related update function
 */
export function updateForNode<T>(forNode: ForNode<T>, newArray: T[], newKeys: number[]) {
  if (newKeys) {
    updateWithKey(forNode, newArray, newKeys);
    return;
  }
  updateWithOutKey(forNode, newArray);
}

/**
 * @brief Shortcut to generate new nodes with idx and key
 */
function getNewNodes<T>(forNode: ForNode<T>, idx: number, key: number, array: T[], updateArr?: any[]) {
  startUnmountScope();
  const nodes = geneNewNodesInCtx(forNode, () => forNode.nodeFunc(array[idx], idx, updateArr ?? forNode.updateArr));
  setUnmountMap(forNode, key);
  forNode.nodesMap.set(key, nodes);
  return nodes;
}

/**
 * @brief Remove nodes from parentEl and run willUnmount and didUnmount
 * @param nodes
 * @param key
 */
function removeNodes<T>(forNode: ForNode<T>, nodes: InulaNode[], key: number) {
  runLifecycleMap(forNode.willUnmountFuncs, key);
  removeMutableNodes(forNode, nodes);
  runLifecycleMap(forNode.didUnmountFuncs, key);
  forNode.nodesMap.delete(key);
}

/**
 * @brief Update the nodes without keys
 * @param newArray
 */
function updateWithOutKey<T>(forNode: ForNode<T>, newArray: T[]) {
  const preLength = forNode.array.length;
  const currLength = newArray.length;

  if (preLength === currLength) {
    // ---- If the length is the same, we only need to update the nodes
    for (let idx = 0; idx < forNode.array.length; idx++) {
      updateItem(forNode, idx, newArray);
    }
    forNode.array = [...newArray];
    return;
  }
  const parentEl = forNode._$parentEl!;
  // ---- If the new array is longer, add new nodes directly
  if (preLength < currLength) {
    let flowIndex = getFlowIndexFromNodes(parentEl._$nodes, forNode);
    // ---- Calling parentEl.childNodes.length is time-consuming,
    //      so we use a length variable to store the length
    const length = parentEl.childNodes.length;
    for (let idx = 0; idx < currLength; idx++) {
      if (idx < preLength) {
        flowIndex += getFlowIndexFromNodes(forNode.nodesMap.get(idx)!);
        updateItem(forNode, idx, newArray);
        continue;
      }
      const newNodes = getNewNodes(forNode, idx, idx, newArray);
      appendNodesWithIndex(newNodes, parentEl, flowIndex, length);
    }
    runDidMount();
    forNode.array = [...newArray];
    return;
  }

  // ---- Update the nodes first
  for (let idx = 0; idx < currLength; idx++) {
    updateItem(forNode, idx, newArray);
  }
  // ---- If the new array is shorter, remove the extra nodes
  for (let idx = currLength; idx < preLength; idx++) {
    const nodes = forNode.nodesMap.get(idx);
    removeNodes(forNode, nodes!, idx);
  }
  forNode.updateArr.splice(currLength, preLength - currLength);
  forNode.array = [...newArray];
}

function arrayEqual<T>(arr1: T[], arr2: T[]) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, idx) => item === arr2[idx]);
}

/**
 * @brief Update the nodes with keys
 * @param newArray
 * @param newKeys
 */
function updateWithKey<T>(forNode: ForNode<T>, newArray: T[], newKeys: number[]) {
  if (newKeys.length !== new Set(newKeys).size) {
    throw new Error('Inula-Next: Duplicate keys in for loop are not allowed');
  }
  const prevKeys = forNode.keys;
  forNode.keys = newKeys;

  if (arrayEqual(prevKeys, newKeys)) {
    // ---- If the keys are the same, we only need to update the nodes
    for (let idx = 0; idx < newArray.length; idx++) {
      updateItem(forNode, idx, newArray);
    }
    forNode.array = [...newArray];
    return;
  }

  const parentEl = forNode._$parentEl!;

  // ---- No nodes after, delete all nodes
  if (newKeys.length === 0) {
    const parentNodes = parentEl._$nodes ?? [];
    if (parentNodes.length === 1 && parentNodes[0] === forNode) {
      // ---- ForNode is the only node in the parent node
      //      Frequently used in real life scenarios because we tend to always wrap for with a div element,
      //      so we optimize it here
      runLifecycleMap(forNode.willUnmountFuncs);
      parentEl.innerHTML = '';
      runLifecycleMap(forNode.didUnmountFuncs);
    } else {
      for (let prevIdx = 0; prevIdx < prevKeys.length; prevIdx++) {
        const prevKey = prevKeys[prevIdx];
        removeNodes(forNode, forNode.nodesMap.get(prevKey)!, prevKey);
      }
    }
    forNode.nodesMap.clear();
    forNode.updateArr = [];
    forNode.array = [];
    return;
  }

  // ---- Record how many nodes are before this ForNode with the same parentNode
  const flowIndex = getFlowIndexFromNodes(parentEl._$nodes, forNode);

  // ---- No nodes before, append all nodes
  if (prevKeys.length === 0) {
    const nextSibling = parentEl.childNodes[flowIndex];
    for (let idx = 0; idx < newKeys.length; idx++) {
      const newNodes = getNewNodes(forNode, idx, newKeys[idx], newArray);
      appendNodesWithSibling(newNodes, parentEl, nextSibling);
    }
    runDidMount();
    forNode.array = [...newArray];
    return;
  }

  const shuffleKeys: number[] = [];
  const newUpdateArr: any[] = [];

  // ---- 1. Delete the nodes that are no longer in the array
  for (let prevIdx = 0; prevIdx < prevKeys.length; prevIdx++) {
    const prevKey = prevKeys[prevIdx];
    if (forNode.keys.includes(prevKey)) {
      shuffleKeys.push(prevKey);
      newUpdateArr.push(forNode.updateArr[prevIdx]);
      continue;
    }
    removeNodes(forNode, forNode.nodesMap.get(prevKey)!, prevKey);
  }

  // ---- 2. Add the nodes that are not in the array but in the new array
  // ---- Calling parentEl.childNodes.length is time-consuming,
  //      so we use a length variable to store the length
  let length = parentEl.childNodes.length;
  let newFlowIndex = flowIndex;
  for (let idx = 0; idx < forNode.keys.length; idx++) {
    const key = forNode.keys[idx];
    const prevIdx = shuffleKeys.indexOf(key);
    if (prevIdx !== -1) {
      // ---- These nodes are already in the parentEl,
      //      and we need to keep track of their flowIndex
      newFlowIndex += getFlowIndexFromNodes(forNode.nodesMap.get(key)!);
      newUpdateArr[prevIdx]?.(forNode.depNum, newArray[idx]);
      continue;
    }
    // ---- Insert updateArr first because in getNewNode the updateFunc will replace this null
    newUpdateArr.splice(idx, 0, null);
    const newNodes = getNewNodes(forNode, idx, key, newArray);
    // ---- Add the new nodes
    shuffleKeys.splice(idx, 0, key);

    const count = appendNodesWithIndex(newNodes, parentEl, newFlowIndex, length);
    newFlowIndex += count;
    length += count;
  }
  runDidMount();

  // ---- After adding and deleting, the only thing left is to reorder the nodes,
  //      but if the keys are the same, we don't need to reorder
  if (arrayEqual(forNode.keys, shuffleKeys)) {
    forNode.array = [...newArray];
    forNode.updateArr = newUpdateArr;
    return;
  }

  newFlowIndex = flowIndex;
  const bufferNodes = new Map();
  // ---- 3. Replace the nodes in the same position using Fisher-Yates shuffle algorithm
  for (let idx = 0; idx < forNode.keys.length; idx++) {
    const key = forNode.keys[idx];
    const prevIdx = shuffleKeys.indexOf(key);

    const bufferedNode = bufferNodes.get(key);
    if (bufferedNode) {
      // ---- We need to add the flowIndex of the bufferedNode,
      //      because the bufferedNode is in the parentEl and the new position is ahead of the previous position
      const bufferedFlowIndex = getFlowIndexFromNodes(bufferedNode);
      const lastEl = toEls(bufferedNode).pop()!;
      const nextSibling = parentEl.childNodes[newFlowIndex + bufferedFlowIndex];
      if (lastEl !== nextSibling && lastEl.nextSibling !== nextSibling) {
        // ---- If the node is buffered, we need to add it to the parentEl
        insertNodesBefore(bufferedNode, parentEl, nextSibling);
      }
      // ---- So the added length is the length of the bufferedNode
      newFlowIndex += bufferedFlowIndex;
      // TODO: ?? delete bufferNodes[idx];
    } else if (prevIdx === idx) {
      // ---- If the node is in the same position, we don't need to do anything
      newFlowIndex += getFlowIndexFromNodes(forNode.nodesMap.get(key)!);
      continue;
    } else {
      // ---- If the node is not in the same position, we need to buffer it
      //      We buffer the node of the previous position, and then replace it with the node of the current position
      const prevKey = shuffleKeys[idx];
      bufferNodes.set(prevKey, forNode.nodesMap.get(prevKey)!);
      // ---- Length would never change, and the last will always be in the same position,
      //      so it'll always be insertBefore instead of appendChild
      const childNodes = forNode.nodesMap.get(key)!;
      const lastEl = toEls(childNodes).pop()!;
      const nextSibling = parentEl.childNodes[newFlowIndex];
      if (lastEl !== nextSibling && lastEl.nextSibling !== nextSibling) {
        newFlowIndex += insertNodesBefore(childNodes, parentEl, nextSibling);
      }
    }
    // ---- Swap the keys
    const tempKey = shuffleKeys[idx];
    shuffleKeys[idx] = shuffleKeys[prevIdx];
    shuffleKeys[prevIdx] = tempKey;
    const tempUpdateFunc = newUpdateArr[idx];
    newUpdateArr[idx] = newUpdateArr[prevIdx];
    newUpdateArr[prevIdx] = tempUpdateFunc;
  }
  forNode.array = [...newArray];
  forNode.updateArr = newUpdateArr;
}
