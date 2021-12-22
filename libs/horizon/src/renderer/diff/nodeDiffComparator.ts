import type { VNode } from '../Types';
import { FlagUtils } from '../vnode/VNodeFlags';
import { TYPE_ELEMENT, TYPE_FRAGMENT, TYPE_PORTAL } from '../utils/elementType';
import { DomText, DomPortal, Fragment } from '../vnode/VNodeTags';
import {updateVNode, createVNode, createVNodeFromElement, updateVNodePath} from '../vnode/VNodeCreator';
import {
  isSameType,
  createRef,
  getIteratorFn,
  isTextType,
  isArrayType,
  isIteratorType,
  isObjectType,
} from './DiffTools';
import {getSiblingVNode} from '../vnode/VNodeUtils';

enum DiffCategory {
  TEXT_NODE = 'TEXT_NODE',
  OBJECT_NODE = 'OBJECT_NODE',
  ARR_NODE = 'ARR_NODE',
};

// 检查是不是被 FRAGMENT 包裹
function isNoKeyFragment(child: any) {
  return child != null && child.type === TYPE_FRAGMENT && child.key === null;
}

// 清除单个节点
function deleteVNode(parentNode: VNode, delVNode: VNode): void {
  FlagUtils.setDeletion(delVNode);
  parentNode.dirtyNodes.push(delVNode);
}

// 清除多个节点
function deleteVNodes(parentVNode: VNode, currentChildren: Array<VNode>, startIdx: number, endVNode?: VNode): void {
  if (currentChildren) {
    for (let i = startIdx; i < currentChildren.length; i++) {
      const delVNode = currentChildren[i];
      if (delVNode === endVNode) {
        return;
      }
      deleteVNode(parentVNode, delVNode);
    }
  }
}

function checkCanReuseNode(oldNode: VNode | null, newChild: any): boolean {
  if (newChild === null) {
    return false;
  }

  const oldKey = oldNode !== null ? oldNode.key : null;
  if (isTextType(newChild)) {
    return oldKey === null;
  }

  if (isObjectType(newChild)) {
    if (isArrayType(newChild) || isIteratorType(newChild)) {
      return oldKey === null;
    }
    if (newChild.vtype === TYPE_ELEMENT || newChild.vtype === TYPE_PORTAL) {
      return oldKey === newChild.key;
    }
  }

  return false;
}

function getNodeType(parentNode: VNode, newChild: any): string {
  if (newChild === null) {
    return null;
  }
  if (isTextType(newChild)) {
    return DiffCategory.TEXT_NODE;
  }
  if (isObjectType(newChild)) {
    if (isArrayType(newChild) || isIteratorType(newChild)) {
      return DiffCategory.ARR_NODE;
    }
    if (newChild.vtype === TYPE_ELEMENT || newChild.vtype === TYPE_PORTAL) {
      return DiffCategory.OBJECT_NODE;
    }
  }
  return null;
}

// 设置vNode的flag
function setVNodeAdditionFlag(newNode: VNode, lastPosition: number, isComparing: boolean): number {
  let position = lastPosition;
  if (!isComparing) {
    return position;
  }

  if (newNode.isCreated || newNode.eIndex < lastPosition) { // 位置 小于 上一个复用的位置
    // 标记为新增
    FlagUtils.setAddition(newNode);
  } else { // 复用
    position = newNode.eIndex;
  }

  return position;
}

// 获取新节点
function getNewNode(parentNode: VNode, newChild: any, oldNode: VNode | null) {
  const newNodeType = getNodeType(parentNode, newChild);
  if (newNodeType === null) {
    return null;
  }

  let resultNode = null;
  switch (newNodeType) {
    case DiffCategory.TEXT_NODE: {
      if (oldNode === null || oldNode.tag !== DomText) {
        resultNode = createVNode(DomText, String(newChild));
      } else {
        resultNode = updateVNode(oldNode, String(newChild));
      }
      break;
    }
    case DiffCategory.ARR_NODE: {
      if (oldNode === null || oldNode.tag !== Fragment) {
        resultNode = createVNode(Fragment, null, newChild);
      } else {
        resultNode = updateVNode(oldNode, newChild);
      }
      break;
    }
    case DiffCategory.OBJECT_NODE: {
      if (newChild.vtype === TYPE_ELEMENT) {
        if (newChild.type === TYPE_FRAGMENT) {
          if (oldNode === null || oldNode.tag !== Fragment) {
            const key = oldNode !== null ? oldNode.key : newChild.key;
            resultNode = createVNode(Fragment, key, newChild.props.children);
          } else {
            resultNode = updateVNode(oldNode, newChild);
          }
          break;
        }

        if (oldNode === null || !isSameType(oldNode, newChild)) {
          resultNode = createVNodeFromElement(newChild);
          resultNode.ref = createRef(newChild);
        } else {
          resultNode = updateVNode(oldNode, newChild.props);
          resultNode.ref = createRef(newChild);
        }
        break;
      } else if (newChild.vtype === TYPE_PORTAL) {
        if (oldNode === null || oldNode.tag !== DomPortal || oldNode.outerDom !== newChild.outerDom) {
          resultNode = createVNode(DomPortal, newChild);
        } else {
          resultNode = updateVNode(oldNode, newChild.children || []);
        }
        break;
      }
    }
  }

  if (resultNode) {
    resultNode.parent = parentNode;
  }

  return resultNode;
}

function transLeftChildrenToMap(
  parentVNode: VNode,
  currentChildren: Array<VNode>,
  startIdx: number,
  rightEndVNode: VNode | null
): Map<string | number, VNode> {
  const leftChildrenMap: Map<string | number, VNode> = new Map();
  for (let i = startIdx; i < currentChildren.length; i++) {
    const currentChild = currentChildren[i];
    if (currentChild === rightEndVNode) {
      return leftChildrenMap;
    }
    leftChildrenMap.set(currentChild.key !== null ? currentChild.key : currentChild.eIndex, currentChild);
  }
  return leftChildrenMap;
}

function getOldNodeFromMap(parentNode: VNode, nodeMap: Map<string | number, VNode>, newIdx: number, newChild: any) {
  if (isTextType(newChild)) {
    return nodeMap.get(newIdx) || null;
  }
  if (isObjectType(newChild)) {
    if (isArrayType(newChild) || isIteratorType(newChild)) {
      return nodeMap.get(newIdx) || null;
    }
    if (newChild.vtype === TYPE_ELEMENT || newChild.vtype === TYPE_PORTAL) {
      return nodeMap.get(newChild.key === null ? newIdx : newChild.key) || null;
    }
  }
  return null;
}

// diff数组类型的节点，核心算法
function diffArrayNodes(
  parentNode: VNode,
  currentChildren: Array<VNode> | null,
  newChildren: Array<any>,
  isComparing: boolean = true
): Array<VNode> | null {
  const resultChildren: Array<VNode> = [];
  let oldNode = (currentChildren.length > 0) ? currentChildren[0] : null;
  let theLastPosition = 0;
  // 从左边开始的位置
  let leftIdx = 0;
  let nextOldNode = null;

  // 1. 从左侧开始比对currentVNode和newChildren，若不能复用则跳出循环
  for (; oldNode !== null && leftIdx < newChildren.length; leftIdx++) {
    if (oldNode.eIndex > leftIdx) {
      // 当新旧节点位置不一，则将缓存当前的旧节点，放到下一次对比
      nextOldNode = oldNode;
      oldNode = null;
    } else {
      nextOldNode = getSiblingVNode(oldNode);
    }

    const canBeReuse = checkCanReuseNode(oldNode, newChildren[leftIdx]);
    // 不能复用，break
    if (!canBeReuse) {
      oldNode = oldNode ?? nextOldNode;
      break;
    }

    const newNode = getNewNode(parentNode, newChildren[leftIdx], oldNode);
    // 没有生成新节点，break
    if (!newNode) {
      oldNode = oldNode ?? nextOldNode;
      break;
    }

    // diff过程中，需要将现有的节点清除掉，如果是创建，则不需要处理（因为没有现存节点）
    if (isComparing && oldNode && newNode.isCreated) {
      deleteVNode(parentNode, oldNode);
    }

    theLastPosition = setVNodeAdditionFlag(newNode, theLastPosition, isComparing);
    newNode.eIndex = leftIdx;
    resultChildren.push(newNode);
    oldNode = nextOldNode;
  }

  let rightIdx = newChildren.length;
  let rightEndOldNode; // 老节点中最右边不匹配的节点引用 abcde --> abfde 则rightEndOldNode = f;
  const rightNewNodes: Array<VNode> = []; // 最右边匹配的节点引用 abcde --> abfde rightNewNode = [d, e];
  // 从后往前，新资源的位置还没有到最末端，旧的vNode也还没遍历完，则可以考虑从后往前开始
  if (rightIdx > leftIdx && oldNode !== null) {
    const rightRemainingOldChildren = currentChildren.slice(leftIdx);
    let rightOldIndex = rightRemainingOldChildren.length - 1;

    // 2. 从右侧开始比对currentVNode和newChildren，若不能复用则跳出循环
    for (; rightIdx > leftIdx; rightIdx--) {
      const rightOldNode = rightRemainingOldChildren[rightOldIndex];
      if (rightOldIndex < 0 || rightOldNode === null) {
        break;
      }

      const canBeReuse = checkCanReuseNode(rightOldNode, newChildren[rightIdx - 1]);
      // 不能复用，break
      if (!canBeReuse) {
        break;
      }

      const newNode = getNewNode(parentNode, newChildren[rightIdx - 1], rightOldNode);
      // 没有生成新节点，break
      if (newNode === null) {
        break;
      }

      rightNewNodes.unshift(newNode);

      if (isComparing && rightOldNode && newNode.isCreated) {
        deleteVNode(parentNode, rightOldNode);
      }

      setVNodeAdditionFlag(newNode, theLastPosition, isComparing);
      newNode.eIndex = rightIdx - 1;
      rightOldIndex--;
      rightEndOldNode = rightOldNode;
    }
  }

  // 3. 新节点已经处理完成
  if (leftIdx === rightIdx) {
    if (isComparing) {
      deleteVNodes(parentNode, currentChildren, leftIdx, rightEndOldNode);
    }

    return mergeResultChildren(resultChildren, rightNewNodes);
  }

  // 4. 新节点还有一部分，但是老节点已经没有了
  if (oldNode === null) {
    for (; leftIdx < rightIdx; leftIdx++) {
      const newNode = getNewNode(parentNode, newChildren[leftIdx], null);

      if (newNode !== null) {
        theLastPosition = setVNodeAdditionFlag(newNode, theLastPosition, isComparing);
        newNode.eIndex = leftIdx;
        resultChildren.push(newNode);
      }
    }

    return mergeResultChildren(resultChildren, rightNewNodes);
  }

  // 5. 新节点还有一部分，但是老节点也还有一部分
  // 把剩下的currentVNode转成Map
  const leftChildrenMap = transLeftChildrenToMap(parentNode, currentChildren, currentChildren.indexOf(oldNode), rightEndOldNode);
  for (; leftIdx < rightIdx; leftIdx++) {
    const oldNodeFromMap = getOldNodeFromMap(parentNode, leftChildrenMap, leftIdx, newChildren[leftIdx]);
    const newNode = getNewNode(parentNode, newChildren[leftIdx], oldNodeFromMap);
    if (newNode !== null) {
      if (isComparing && !newNode.isCreated) {
        // 从Map删除，后面不会deleteVNode
        leftChildrenMap.delete(newNode.key || leftIdx);
      }

      theLastPosition = setVNodeAdditionFlag(newNode, theLastPosition, isComparing);
      newNode.eIndex = leftIdx;
      resultChildren.push(newNode);
    }
  }

  if (isComparing) {
    leftChildrenMap.forEach(child => deleteVNode(parentNode, child));
  }

  return mergeResultChildren(resultChildren, rightNewNodes);
}

// 设置vNode中的cIndex属性，cIndex是节点在children中的位置
function setVNodeCIndex(resultChildren) {
  resultChildren.forEach((node, idx) => {
    node.cIndex = idx;
    updateVNodePath(node);
  });
}

function mergeResultChildren(resultChildren: Array<VNode>, rightNewNodes: Array<VNode>): Array<VNode> {
  if (rightNewNodes) {
    resultChildren.push(...rightNewNodes);
  }

  // 设置vNode中的cIndex属性，cIndex是节点在children中的位置
  setVNodeCIndex(resultChildren);

  return resultChildren;
}

// 新节点是数组类型
function diffArrayNodesHandler(
  parentNode: VNode,
  currentVNode: Array<VNode> | null,
  newChildren: Array<any>,
  isComparing: boolean = true
): Array<VNode> | null {
  return diffArrayNodes(parentNode, currentVNode, newChildren, isComparing);
}

// 新节点是迭代器类型
function diffIteratorNodesHandler(
  parentNode: VNode,
  currentVNode: Array<VNode> | null,
  newChildrenIterable: Iterable<any>,
  isComparing: boolean = true
): Array<VNode> | null {
  const iteratorFn = getIteratorFn(newChildrenIterable);
  const iteratorObj = iteratorFn.call(newChildrenIterable);

  // 把iterator转测数组
  const childrenArray = [];
  let result = iteratorObj.next();
  while (!result.done) {
    childrenArray.push(result.value);
    result = iteratorObj.next();
  }

  return diffArrayNodes(parentNode, currentVNode, childrenArray, isComparing);
}

// 新节点是字符串类型
function diffStringNodeHandler(
  parentNode: VNode,
  currentChildren: Array<VNode> | null,
  newChild: any,
  firstChildVNode: VNode,
  isComparing: boolean
) {
  let newTextNode = null;

  // 第一个vNode是Text，则复用
  if (firstChildVNode !== null && firstChildVNode.tag === DomText) {
    newTextNode = updateVNode(firstChildVNode, String(newChild));
    deleteVNodes(parentNode, currentChildren, 1);
  } else {
    newTextNode = createVNode(DomText, String(newChild));
    deleteVNodes(parentNode, currentChildren, 0);
  }

  if (isComparing && newTextNode.isCreated) {
    FlagUtils.setAddition(newTextNode);
  }
  newTextNode.parent = parentNode;
  newTextNode.cIndex = 0;
  updateVNodePath(newTextNode);

  return [newTextNode];
}

// 新节点是对象类型
function diffObjectNodeHandler(
  parentNode: VNode,
  currentChildren: Array<VNode> | null,
  newChild: any,
  firstChildVNode: VNode,
  isComparing: boolean
) {
  let canReuseNode = null;

  // 通过key比对是否有可以reuse
  const newKey = newChild.key;
  for (let i = 0; i < currentChildren.length; i++) {
    const oldNode = currentChildren[i];
    if (oldNode.key === newKey) {
      canReuseNode = oldNode;
      break;
    } else {
      deleteVNode(parentNode, oldNode);
    }
  }

  let resultNode = null;
  let startDelVNode = firstChildVNode;
  if (newChild.vtype === TYPE_ELEMENT) {
    if (canReuseNode) {
      // 可以复用
      if (canReuseNode.tag === Fragment && newChild.type === TYPE_FRAGMENT) {
        resultNode = updateVNode(canReuseNode, newChild.props.children);
        startDelVNode = getSiblingVNode(canReuseNode);
      } else if (isSameType(canReuseNode, newChild)) {
        resultNode = updateVNode(canReuseNode, newChild.props);
        resultNode.ref = createRef(newChild);
        startDelVNode = getSiblingVNode(canReuseNode);
      }
    }

    if (resultNode === null) {
      // 新建
      if (newChild.type === TYPE_FRAGMENT) {
        resultNode = createVNode(Fragment, newChild.key, newChild.props.children);
      } else {
        resultNode = createVNodeFromElement(newChild);
        resultNode.ref = createRef(newChild);
      }
    }
  } else if (newChild.vtype === TYPE_PORTAL) {
    if (canReuseNode) {
      // 可以复用
      if (canReuseNode.tag === DomPortal && canReuseNode.outerDom === newChild.outerDom) {
        resultNode = updateVNode(canReuseNode, newChild.children || []);
        startDelVNode = getSiblingVNode(canReuseNode);
      }
    }
    if (resultNode === null) {
      // 新建
      resultNode = createVNode(DomPortal, newChild);
    }
  }

  if (resultNode) {
    if (isComparing && resultNode.isCreated) {
      FlagUtils.setAddition(resultNode);
    }

    resultNode.parent = parentNode;
    resultNode.cIndex = 0;
    updateVNodePath(resultNode);
    if (startDelVNode) {
      deleteVNodes(parentNode, currentChildren, startDelVNode.cIndex);
    }
    return [resultNode];
  }

  return null;
}

// Diff算法的对外接口
export function createChildrenByDiff(
  parentNode: VNode,
  currentChildren: Array<VNode> | null,
  newChild: any,
  isComparing: boolean = true
): Array<VNode> | null {
  const isFragment = isNoKeyFragment(newChild);
  newChild = isFragment ? newChild.props.children : newChild;

  // 1. 没有新节点，直接把vNode标记为删除
  if (newChild == null) {
    if (isComparing) {
      deleteVNodes(parentNode, currentChildren, 0);
    }
    return null;
  }

  const firstChildVNode = currentChildren.length ? currentChildren[0] : null;
  // 2. newChild是字串类型
  if (isTextType(newChild)) {
    return diffStringNodeHandler(parentNode, currentChildren, newChild, firstChildVNode, isComparing);
  }

  // 3. newChild是数组类型
  if (isArrayType(newChild)) {
    return diffArrayNodesHandler(parentNode, currentChildren, newChild, isComparing);
  }

  // 4. newChild是迭代器类型
  if (isIteratorType(newChild)) {
    return diffIteratorNodesHandler(parentNode, currentChildren, newChild, isComparing);
  }

  // 5. newChild是对象类型
  if (isObjectType(newChild)) {
    const newVNodes = diffObjectNodeHandler(parentNode, currentChildren, newChild, firstChildVNode, isComparing);
    if (newVNodes) {
      return newVNodes;
    }
  }

  // 6. 其它情况删除所有节点
  if (firstChildVNode) {
    deleteVNodes(parentNode, currentChildren, firstChildVNode.cIndex);
  }

  return null;
}
