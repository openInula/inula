/* 获得key到树节点的映射, 并打上深度标签和当前层最后一个元素的标签 */
export function getKeyToTreeMap(treeData) {
  const map = new Map();
  let maxDepth = 1;
  if (treeData.length === 0) return { map, depth: 0 };

  const traverseTree = (currentTree, depth = 1, parent = null) => {
    currentTree.forEach((node, index) => {
      const nodeInfo = {
        node: node,
        parent: parent,
        depth: depth,
        isLast: index === currentTree.length - 1,
      };

      maxDepth = Math.max(maxDepth, depth);
      map.set(node.key, nodeInfo);
      if (node.children) {
        traverseTree(node.children, depth + 1, node);
      }
    });
  };

  traverseTree(treeData, 1, null);
  return { map: map, depth: maxDepth };
}

/* 获得节点所有孩子 */
export function getAllChildKeys(curNode) {
  const keys = [];

  const traverseTree = (curr) => {
    curr.forEach((node) => {
      if (!keys.includes(node.key)) keys.push(node.key);
      if (node.children) {
        traverseTree(node.children);
      }
    });
  };

  if (curNode.children) {
    traverseTree(curNode.children);
  }

  return keys;
}

/* 获得节点所有不包含disabled的节点及其子节点的孩子 */
export function getAllRelatedChildKeys(curNode) {
  const keys = [];

  const traverseTree = (curr) => {
    curr.forEach((node) => {
      if (!keys.includes(node.key) && !node.disabled && !node.disableCheckbox)
        keys.push(node.key);
      if (node.children && !node.disabled && !node.disableCheckbox) {
        traverseTree(node.children);
      }
    });
  };

  if (curNode.children) {
    traverseTree(curNode.children);
  }

  return keys;
}

/* 获得节点到其父节点的映射 */
export function getChildToParentMap(treeData) {
  const map = new Map();
  if (treeData.length === 0) return map;

  const traverseTree = (curr) => {
    curr.forEach((node) => {
      if (node.children) {
        node.children.forEach((child) => {
          map.set(child.key, node);
        });
        traverseTree(node.children);
      }
    });
  };

  traverseTree(treeData);
  return map;
}
