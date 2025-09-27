/**
 * 初始化展开节点
 * 优先级：受控 > all > default
 */
export function initialAllExpandedKeys(currentTree) {
  let keys = [];
  currentTree.forEach((node) => {
    keys.push(node.key);
    if (node.children) {
      keys = keys.concat(initialAllExpandedKeys(node.children));
    }
  });
  return keys;
}

/**
 *  受控或默认初始化处理：
 *  1.父节点是否展开不影响子节点
 *  2.在isAutoExpandParent为true的情况下，直系子节点有展开的情况下父节点展开
 *  3.从上到下两级两级互相影响，即没有传递影响，也就是参照物始终为initialKeys
 */
export function initialCustomExpandedKeys(
  treeData,
  initialKeys = [],
  isAutoExpandParent = true
) {
  const keys = [];

  const traverseTree = (curr) => {
    curr.forEach((node) => {
      if (initialKeys.includes(node.key) && !keys.includes(node.key))
        keys.push(node.key);
      if (node.children) {
        if (isAutoExpandParent) {
          const isChildrenAllExpand = node.children.some((child) =>
            initialKeys.includes(child.key)
          );
          if (isChildrenAllExpand && !keys.includes(node.key))
            keys.push(node.key);
        }
        traverseTree(node.children);
      }
    });
  };

  traverseTree(treeData);

  return keys;
}

/**
 * 树节点check选中控制
 * 优先级：受控>默认
 */

/**
 * 受控或默认初始化处理
 * 1. 在非严格模式下：
 *    · 父节点选择，其所有子节点选择
 *    · 其所有子节点选择， 父节点选择
 *    · 从上到下所有级影响，即存在传递影响，也就是参照物为initialKeys和keys
 *    · 上述三规则不影响disabled节点
 * 2. 在严格模式下：父子不互相影响
 */
export function initialCustomCheckedKeys(
  treeData,
  initialKeys = [],
  isCheckStrictly = false
) {
  let keys = [];

  const traverseTree = (curr) => {
    curr.forEach((node) => {
      if (!isCheckStrictly) {
        if (initialKeys.includes(node.key) && !keys.includes(node.key))
          keys.push(node.key);

        //先处理子节点，因为父节点如果不在initialKeys中，要通过子节点是否选中来选择
        if (node.children) {
          if (keys.includes(node.key)) {
            node.children.forEach((child) => {
              const related =
                !node.disabled &&
                !node.disabledCheckbox &&
                !child.disabled &&
                !child.disabledCheckbox;
              //非严格模式不包含disabled属性节点
              if (related && !keys.includes(child.key)) {
                keys.push(child.key);
              }
            });
          }
          traverseTree(node.children);
        }

        /**
         * 此时由于上面先处理子节点，所以：
         * 1.其直系子节点如果全选中，则后续子节点一定全选中，所以只需看直系
         * 2.非严格模式规则不包含disabled的节点
         */
        if (
          node.children &&
          !node.disabled &&
          !node.disabledCheckbox &&
          node.children.every((child) => {
            return (
              keys.includes(child.key) ||
              child.disabled ||
              child.disabledCheckbox
            );
          }) &&
          !keys.includes(node.key)
        ) {
          keys.push(node.key);
        }
      } else {
        //严格模式，父子不干扰
        if (initialKeys.includes(node.key) && !keys.includes(node.key))
          keys.push(node.key);
        if (node.children) {
          traverseTree(node.children);
        }
      }
    });
  };

  traverseTree(treeData);
  return keys;
}

/**
 * 树节点selected选中控制
 * 优先级：受控>默认
 */

/**
 * 受控或默认初始化处理
 * 1. 在多选模式下：直接返回initialKeys
 * 2. 在单选模式下：返回第一个元素
 */
export function initialCustomSelectedKeys(
  initialKeys = [],
  isMultipleMode = false
) {
  if (!isMultipleMode) {
    return [initialKeys[0]];
  } else {
    return initialKeys;
  }
}
