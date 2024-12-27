import { InulaNodeType } from '../../consts';
import { addWillUnmount, addDidUnmount, runDidMount } from '../../lifecycle';
import { InulaStore } from '../../store';
import { Bits, InulaBaseNode, Value } from '../../types';
import {
  appendNodesWithIndex,
  appendNodesWithSibling,
  arrayEqual,
  getFlowIndexFromNodes,
  insertNodesBefore,
  toDOMElements,
  update,
} from '../utils';
import { MutableContextNode } from './context';

type ForNodeFunc = (
  node: ForNode,
  updateItemFuncArr: UpdateItemFunc[],
  item: Value,
  key: Value,
  idx: number
) => InulaBaseNode[];
type UpdateItemFunc = (item: Value, idx: number) => void;

// TODO For node with only one child node

class ForNode extends MutableContextNode implements InulaBaseNode {
  inulaType = InulaNodeType.For;

  dirtyBits?: Bits;

  dataReactBits: Bits;

  nodesMap = new Map();

  nodeFunc;

  dataFunc;
  data;

  keysFunc;
  keys?: Value[];

  /**
   * @brief Getter for nodes
   */
  cachedNodes?: InulaBaseNode[];
  nodesDirty = true;
  get nodes() {
    if (!this.nodesDirty) return this.cachedNodes;
    const nodes = [];
    for (let idx = 0; idx < this.data.length; idx++) {
      nodes.push(...this.nodesMap.get(this.keys?.[idx] ?? idx));
    }
    this.cachedNodes = nodes;
    this.nodesDirty = false;
    return nodes;
  }

  setNodesMap(key: Value, nodes: InulaBaseNode[]) {
    this.nodesMap.set(key, nodes);
    this.nodesDirty = true;
  }

  /**
   * @brief Constructor, For type
   * @param data
   * @param nodeFunc
   * @param keys
   */
  constructor(dataFunc: () => Value[], keysFunc: null | (() => Value[]), nodeFunc: ForNodeFunc, dataReactBits: Bits) {
    super();
    this.dataFunc = dataFunc;
    this.keysFunc = keysFunc;
    this.nodeFunc = nodeFunc;
    this.data = [...dataFunc()];
    if (keysFunc) this.keys = [...keysFunc()];
    this.update();

    this.dataReactBits = dataReactBits;
  }

  updateItemFuncArr: UpdateItemFunc[] = [];

  /**
   * @brief Update the view related to one item in the data
   * @param nodes
   * @param item
   */
  updateItem(idx: number, data: Value[]) {
    // ---- The update function of ForNode's childNodes is stored in the first child node
    this.updateItemFuncArr[idx]?.(data[idx], idx);
    // ---- Update the nodes
    for (const node of this.nodesMap.get(this.keys?.[idx] ?? idx)) {
      update(node, this.dirtyBits!);
    }
  }

  updateItems() {
    for (let idx = 0; idx < this.data.length; idx++) {
      this.updateItem(idx, this.data);
    }
  }

  notInitialized? = true;
  /**
   * @brief Non-data update function
   * @param changed
   */
  update() {
    // TODO: extract
    if (this.notInitialized) {
      for (let idx = 0; idx < this.data.length; idx++) {
        let item = this.data[idx];
        this.initUnmountStore();
        const key = this.keys?.[idx] ?? idx;
        const nodes = this.nodeFunc(this, this.updateItemFuncArr, item, key, idx);
        this.setNodesMap(key, nodes);
        this.setUnmountMap(key);
      }
      // ---- For nested ForNode, the whole strategy is just like EnvStore
      //      we use data of function data to create "environment", popping and pushing
      addWillUnmount(this.runAllWillUnmount.bind(this));
      addDidUnmount(this.runAllDidUnmount.bind(this));
      delete this.notInitialized;

      for (const nodes of this.nodesMap.values()) {
        for (const node of nodes) {
          update(node, this.dirtyBits!);
        }
      }
      runDidMount();
      return;
    }

    // ---- e.g. this.depNum -> 1110 changed-> 1010
    //      ~this.depNum & changed -> ~1110 & 1010 -> 0000
    //      no update because depNum contains all the changed
    // ---- e.g. this.depNum -> 1110 changed-> 1101
    //      ~this.depNum & changed -> ~1110 & 1101 -> 0001
    //      update because depNum doesn't contain all the changed
    if (!(~this.dataReactBits & this.dirtyBits!)) {
      this.updateArray();
      return;
    }
    this.updateItems();
  }

  /**
   * @brief Array-related update function
   * @param newData
   * @param newKeys
   */
  updateArray() {
    if (this.keysFunc) {
      this.updateWithKey();
      return;
    }
    this.updateWithOutKey();
  }

  /**
   * @brief Shortcut to generate new nodes with idx and key
   */
  getNewNodes(idx: number, key: Value, data: Value[], updateItemFuncArr?: UpdateItemFunc[]) {
    this.initUnmountStore();
    const nodes = this.newNodesInContext(() =>
      this.nodeFunc(this, updateItemFuncArr ?? this.updateItemFuncArr, data[idx], key, idx)
    );
    for (const node of nodes) {
      update(node, this.dirtyBits!);
    }
    this.setUnmountMap(key);
    this.setNodesMap(key, nodes);
    return nodes;
  }

  willUnmountMap = new Map();
  didUnmountMap = new Map();

  /**
   * @brief Set the unmount map by getting the last unmount map from the global store
   * @param key
   */
  setUnmountMap(key: Value) {
    const willUnmountStore = InulaStore.global.WillUnmountScopedStore.pop();
    if (willUnmountStore && willUnmountStore.length > 0) {
      if (!this.willUnmountMap) this.willUnmountMap = new Map();
      this.willUnmountMap.set(key, willUnmountStore);
    }
    const didUnmountStore = InulaStore.global.DidUnmountScopedStore.pop();
    if (didUnmountStore && didUnmountStore.length > 0) {
      if (!this.didUnmountMap) this.didUnmountMap = new Map();
      this.didUnmountMap.set(key, didUnmountStore);
    }
  }

  /**
   * @brief Run all the unmount functions and clear the unmount map
   */
  runAllWillUnmount() {
    if (!this.willUnmountMap || this.willUnmountMap.size === 0) return;
    this.willUnmountMap.forEach(funcs => {
      for (let i = 0; i < funcs.length; i++) funcs[i]?.();
    });
    this.willUnmountMap.clear();
  }

  /**
   * @brief Run all the unmount functions and clear the unmount map
   */
  runAllDidUnmount() {
    if (!this.didUnmountMap || this.didUnmountMap.size === 0) return;
    this.didUnmountMap.forEach(funcs => {
      for (let i = funcs.length - 1; i >= 0; i--) funcs[i]?.();
    });
    this.didUnmountMap.clear();
  }

  /**
   * @brief Run the unmount functions of the given key
   * @param key
   */
  runWillUnmount(key: Value) {
    if (!this.willUnmountMap || this.willUnmountMap.size === 0) return;
    const funcs = this.willUnmountMap.get(key);
    if (!funcs) return;
    for (let i = 0; i < funcs.length; i++) funcs[i]?.();
    this.willUnmountMap.delete(key);
  }

  /**
   * @brief Run the unmount functions of the given key
   */
  runDidUnmount(key: Value) {
    if (!this.didUnmountMap || this.didUnmountMap.size === 0) return;
    const funcs = this.didUnmountMap.get(key);
    if (!funcs) return;
    for (let i = funcs.length - 1; i >= 0; i--) funcs[i]?.();
    this.didUnmountMap.delete(key);
  }

  /**
   * @brief Remove nodes from parentEl and run willUnmount and didUnmount
   * @param nodes
   * @param key
   */
  removeNodesInLifeCycle(nodes: InulaBaseNode[], key: Value) {
    this.runWillUnmount(key);
    super.removeNodes(nodes);
    this.runDidUnmount(key);
    this.nodesMap.delete(key);
  }

  /**
   * @brief Update the nodes without keys
   * @param newData
   */
  updateWithOutKey() {
    const newData = this.dataFunc();
    const preLength = this.data.length;
    const currLength = newData.length;

    if (preLength === currLength) {
      // ---- If the length is the same, we only need to update the nodes
      for (let idx = 0; idx < this.data.length; idx++) {
        this.updateItem(idx, newData);
      }
      this.data = [...newData];
      return;
    }
    const parentEl = this.parentEl!;
    // ---- If the new data is longer, add new nodes directly
    if (preLength < currLength) {
      let flowIndex = getFlowIndexFromNodes(parentEl.nodes!, this);
      // ---- Calling parentEl.childNodes.length is time-consuming,
      //      so we use a length variable to store the length
      const length = parentEl.childNodes.length;
      for (let idx = 0; idx < currLength; idx++) {
        if (idx < preLength) {
          flowIndex += getFlowIndexFromNodes(this.nodesMap.get(idx));
          this.updateItem(idx, newData);
          continue;
        }
        const newNodes = this.getNewNodes(idx, idx, newData);
        appendNodesWithIndex(newNodes, parentEl, flowIndex, length);
      }
      runDidMount();
      this.data = [...newData];
      return;
    }

    // ---- Update the nodes first
    for (let idx = 0; idx < currLength; idx++) {
      this.updateItem(idx, newData);
    }
    // ---- If the new data is shorter, remove the extra nodes
    for (let idx = currLength; idx < preLength; idx++) {
      const nodes = this.nodesMap.get(idx);
      this.removeNodesInLifeCycle(nodes, idx);
    }
    this.updateItemFuncArr.splice(currLength, preLength - currLength);
    this.data = [...newData];
  }

  /**
   * @brief Update the nodes with keys
   * @param newData
   * @param newKeys
   */
  updateWithKey() {
    const newData = this.dataFunc();
    const newKeys = this.keysFunc!();
    if (newKeys.length !== new Set(newKeys).size) {
      throw new Error('Inula: Duplicate keys in for loop are not allowed');
    }
    const prevKeys = this.keys!;
    this.keys = newKeys;

    if (arrayEqual(prevKeys, this.keys)) {
      // ---- If the keys are the same, we only need to update the nodes
      for (let idx = 0; idx < newData.length; idx++) {
        this.updateItem(idx, newData);
      }
      this.data = [...newData];
      return;
    }

    const parentEl = this.parentEl!;

    // ---- No nodes after, delete all nodes
    if (this.keys.length === 0) {
      const parentNodes = parentEl.nodes ?? [];
      if (parentNodes.length === 1 && parentNodes[0] === this) {
        // ---- ForNode is the only node in the parent node
        //      Frequently used in real life scenarios because we tend to always wrap for with a div element,
        //      so we optimize it here
        this.runAllWillUnmount();
        parentEl.innerHTML = '';
        this.runAllDidUnmount();
      } else {
        for (let prevIdx = 0; prevIdx < prevKeys.length; prevIdx++) {
          const prevKey = prevKeys[prevIdx];
          this.removeNodesInLifeCycle(this.nodesMap.get(prevKey), prevKey);
        }
      }
      this.nodesMap.clear();
      this.updateItemFuncArr = [];
      this.data = [];
      return;
    }

    // ---- Record how many nodes are before this ForNode with the same parentNode
    const flowIndex = getFlowIndexFromNodes(parentEl.nodes!, this);

    // ---- No nodes before, append all nodes
    if (prevKeys.length === 0) {
      const nextSibling = parentEl.childNodes[flowIndex];
      for (let idx = 0; idx < this.keys.length; idx++) {
        const newNodes = this.getNewNodes(idx, this.keys[idx], newData);
        appendNodesWithSibling(newNodes, parentEl, nextSibling);
      }
      runDidMount();
      this.data = [...newData];
      return;
    }

    const shuffleKeys = [];
    const newUpdateArr = [];

    // ---- 1. Delete the nodes that are no longer in the data
    for (let prevIdx = 0; prevIdx < prevKeys.length; prevIdx++) {
      const prevKey = prevKeys[prevIdx];
      if (this.keys.includes(prevKey)) {
        shuffleKeys.push(prevKey);
        newUpdateArr.push(this.updateItemFuncArr[prevIdx]);
        continue;
      }
      this.removeNodesInLifeCycle(this.nodesMap.get(prevKey), prevKey);
    }

    // ---- 2. Add the nodes that are not in the data but in the new data
    // ---- Calling parentEl.childNodes.length is time-consuming,
    //      so we use a length variable to store the length
    let length = parentEl.childNodes.length;
    let newFlowIndex = flowIndex;
    for (let idx = 0; idx < this.keys.length; idx++) {
      const key = this.keys[idx];
      const prevIdx = shuffleKeys.indexOf(key);
      if (prevIdx !== -1) {
        // ---- These nodes are already in the parentEl,
        //      and we need to keep track of their flowIndex
        newFlowIndex += getFlowIndexFromNodes(this.nodesMap.get(key));
        newUpdateArr[prevIdx]?.(this.dirtyBits, newData[idx]);
        continue;
      }
      // ---- Insert updateItemFuncArr first because in getNewNode the updateFunc will replace this null
      newUpdateArr.splice(idx, 0, null as Value);
      const newNodes = this.getNewNodes(idx, key, newData, newUpdateArr);
      // ---- Add the new nodes
      shuffleKeys.splice(idx, 0, key);

      const count = appendNodesWithIndex(newNodes, parentEl, newFlowIndex, length);
      newFlowIndex += count;
      length += count;
    }
    runDidMount();

    // ---- After adding and deleting, the only thing left is to reorder the nodes,
    //      but if the keys are the same, we don't need to reorder
    if (arrayEqual(this.keys, shuffleKeys)) {
      this.data = [...newData];
      this.updateItemFuncArr = newUpdateArr;
      return;
    }

    newFlowIndex = flowIndex;
    const bufferNodes = new Map();
    // ---- 3. Replace the nodes in the same position using Fisher-Yates shuffle algorithm
    for (let idx = 0; idx < this.keys.length; idx++) {
      const key = this.keys[idx];
      const prevIdx = shuffleKeys.indexOf(key);

      const bufferedNode = bufferNodes.get(key);
      if (bufferedNode) {
        // ---- We need to add the flowIndex of the bufferedNode,
        //      because the bufferedNode is in the parentEl and the new position is ahead of the previous position
        const bufferedFlowIndex = getFlowIndexFromNodes(bufferedNode);
        const lastEl = toDOMElements(bufferedNode).pop();
        const nextSibling = parentEl.childNodes[newFlowIndex + bufferedFlowIndex];
        if (lastEl !== nextSibling && lastEl!.nextSibling !== nextSibling) {
          // ---- If the node is buffered, we need to add it to the parentEl
          insertNodesBefore(bufferedNode, parentEl, nextSibling);
        }
        // ---- So the added length is the length of the bufferedNode
        newFlowIndex += bufferedFlowIndex;
        bufferNodes.delete(key);
      } else if (prevIdx === idx) {
        // ---- If the node is in the same position, we don't need to do anything
        newFlowIndex += getFlowIndexFromNodes(this.nodesMap.get(key));
        continue;
      } else {
        // ---- If the node is not in the same position, we need to buffer it
        //      We buffer the node of the previous position, and then replace it with the node of the current position
        const prevKey = shuffleKeys[idx];
        bufferNodes.set(prevKey, this.nodesMap.get(prevKey));
        // ---- Length would never change, and the last will always be in the same position,
        //      so it'll always be insertBefore instead of appendChild
        const childNodes = this.nodesMap.get(key);
        const lastEl = toDOMElements(childNodes).pop();
        const nextSibling = parentEl.childNodes[newFlowIndex];
        if (lastEl !== nextSibling && lastEl!.nextSibling !== nextSibling) {
          newFlowIndex += insertNodesBefore(childNodes, parentEl, nextSibling);
        }
      }
      // ---- Swap the keys
      const tempKey: Value = shuffleKeys[idx];
      shuffleKeys[idx] = shuffleKeys[prevIdx];
      shuffleKeys[prevIdx] = tempKey;
      const tempUpdateFunc: UpdateItemFunc = newUpdateArr[idx];
      newUpdateArr[idx] = newUpdateArr[prevIdx];
      newUpdateArr[prevIdx] = tempUpdateFunc;
    }
    this.data = [...newData];
    this.updateItemFuncArr = newUpdateArr;
  }
}

export const createForNode = (
  dataFunc: () => Value[],
  keysFunc: null | (() => Value[]),
  nodeFunc: ForNodeFunc,
  dataReactBits: Bits
) => {
  return new ForNode(dataFunc, keysFunc, nodeFunc, dataReactBits);
};
