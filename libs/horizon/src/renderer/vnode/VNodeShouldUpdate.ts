// 从当前节点向上遍历，更新shouldUpdate和childShouldUpdate
import {VNode} from './VNode';
import {TreeRoot} from './VNodeTags';

export function updateShouldUpdateOfTree(vNode: VNode): VNode | null {
  vNode.shouldUpdate = true;

  // 一直向上遍历，修改childShouldUpdate
  let node = vNode;
  let parent = vNode.parent;
  while (parent !== null) {
    parent.childShouldUpdate = true;
    node = parent;
    parent = parent.parent;
  }

  if (node.tag === TreeRoot) {
    node.shouldUpdate = true;
    // 返回根节点
    return node;
  }

  return null;
}

// 设置节点的childShouldUpdate
export function updateChildShouldUpdate(vNode: VNode) {
  let child = vNode.child;
  while (child !== null) {
    if (child.shouldUpdate || child.childShouldUpdate) {
      vNode.childShouldUpdate = true;
      return;
    }
    child = child.next;
  }

  vNode.childShouldUpdate = false;
}

// 更新从当前节点到根节点的childShouldUpdate为true
export function setParentsChildShouldUpdate(parent: VNode | null) {
  let node = parent;
  while (node !== null) {
    if (node.childShouldUpdate) {
      break;
    }
    node.childShouldUpdate = true;

    node = node.parent;
  }
}

// 设置节点的所有父节点的childShouldUpdate
export function updateParentsChildShouldUpdate(vNode: VNode) {
  let node = vNode.parent;
  let isShouldUpdate = vNode.shouldUpdate || vNode.childShouldUpdate;

  if (isShouldUpdate) { // 开始节点是shouldUpdate或childShouldUpdate
    // 更新从当前节点到根节点的childShouldUpdate为true
    setParentsChildShouldUpdate(node);
  } else {
    while (node !== null) {
      updateChildShouldUpdate(node);
      node = node.parent;
    }
  }
}
