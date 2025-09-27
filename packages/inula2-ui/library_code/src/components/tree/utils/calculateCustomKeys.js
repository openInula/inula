/*--- 用于点击事件计算 ---*/
/**
 * 计算展开节点：
 * 能够点击当前节点，其父节点一定是展开节点，且父子不影响，所以无需考虑父节点
 * 而父节点不影响子节点是否展开，所以直接添加删除即可
 */
export function calculateExpandKeys(cur = {}, preKeys = []) {
  if (preKeys.includes(cur.key)) {
    return preKeys.filter((key) => key !== cur.key);
  } else {
    return [...preKeys, cur.key];
  }
}

/**
 * 计算checked选择节点：
 * 非严格模式：
 * 1. 对于父节点：
 *    · 如果选择当前节点使父节点子节点全选，选择父节点，否则为半选节点
 *    · 如果取消当前节点，如果父节点还有已选择的子节点，则为半选节点，否则不选
 *    · 半选节点无需在意，在渲染时判断即可
 * 2. 对于子节点：
 *    · 如果未全选子节点，则选择该节点及其全部子节点
 *    · 如果全选子节点，则取消该节点及其全部子节点
 * 3. 如果当前节点是叶子节点，看是否在preKey即可
 * 严格模式：看是否在preKey即可
 */
export function calculateCheckedKeys(
  cur = {},
  preKeys = [],
  keyToNodeInfoMap = new Map(),
  childKeys = [],
  isCheckStrictly = false
) {
  let newKeys = [...preKeys];
  /* 先处理子节点，看当前节点时选择还是取消，可以同时处理严格模式 */
  if (!cur.children || isCheckStrictly) {
    //叶子节点情况
    if (newKeys.includes(cur.key)) {
      newKeys = newKeys.filter((key) => key !== cur.key);
    } else {
      newKeys.push(cur.key);
    }
    if (isCheckStrictly) return newKeys; //严格模式直接返回newKeys
  } else {
    //非叶子节点情况
    let isChildAllChecked = preKeys.includes(cur.key);
    /**
     * 等价写法
     * cur.children.every((child) =>
     *  preKeys.includes(child.key)
     * );
     */
    childKeys.push(cur.key); //因为操作都需要cur.key本身，可以先直接push进去
    if (isChildAllChecked) {
      newKeys = newKeys.filter((key) => !childKeys.includes(key));
    } else {
      childKeys.forEach((key) => {
        if (!newKeys.includes(key)) {
          newKeys.push(key);
        }
      });
    }
  }

  /* 然后根据newKeys处理父节点：*/
  let curr = cur;
  while (true) {
    const parent = keyToNodeInfoMap.get(curr.key).parent ?? null;
    if (!parent) break; //代表第一层都处理完了，结束。
    if (parent.disableCheckbox || parent.disabled) break; //disabled节点不会改变状态，也直接结束

    let isChangeParent = false; //记录父节点状态是否变化，变化了则继续向上，否则结束
    if (
      parent.children.every(
        (child) =>
          newKeys.includes(child.key) || child.disabled || child.disableCheckbox
      ) &&
      !newKeys.includes(parent.key)
    ) {
      isChangeParent = true;
      newKeys.push(parent.key);
    } else if (!newKeys.includes(curr.key) && newKeys.includes(parent.key)) {
      isChangeParent = true;
      newKeys = newKeys.filter((key) => key !== parent.key);
    }

    if (isChangeParent) {
      curr = parent;
    } else {
      break;
    }
  }

  return newKeys;
}

/**
 * 判断半选节点
 * 所有不是disabled的及其子节点的子节点中有选中的即为半选节点
 */
export function judgeHalfCheckedKeys(cur = {}, nowKeys = [], childKeys = []) {
  if (!cur.children) return false;
  return childKeys.some((key) => nowKeys.includes(key));
}

/**
 * 计算select选择节点：
 * 多选模式：看是否在preKeys即可
 * 单选模式：返回[cur.key]
 */
export function calculateSelectedKeys(
  cur = {},
  preKeys = [],
  isMultipleMode = false
) {
  if (isMultipleMode) {
    if (preKeys.includes(cur.key))
      return preKeys.filter((key) => key !== cur.key);
    else {
      return [...preKeys, cur.key];
    }
  } else return [cur.key];
}
