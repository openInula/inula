export const flattenTreeData = (
  treeData,
  expandedKeys,
  keyToNodeInfoMap,
  level = 0,
  index = 0
) => {
  if (!treeData || treeData.length === 0) return [];

  let flattenedItems = [];
  let currentIndex = index;

  treeData.forEach((node) => {
    const nodeInfo = keyToNodeInfoMap.get(node.key) || {};
    flattenedItems.push({ ...node, level, index: currentIndex++, ...nodeInfo });

    if (
      expandedKeys.includes(node.key) &&
      node.children &&
      node.children.length > 0
    ) {
      const childItems = flattenTreeData(
        node.children,
        expandedKeys,
        keyToNodeInfoMap,
        level + 1,
        currentIndex
      );
      flattenedItems = flattenedItems.concat(childItems);
      currentIndex = childItems[childItems.length - 1].index + 1;
    }
  });

  return flattenedItems;
};
