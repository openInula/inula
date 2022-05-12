import { VNode } from '../../../horizon/src/renderer/vnode/VNode';
import { ClassComponent, FunctionComponent } from '../../../horizon/src/renderer/vnode/VNodeTags';

// 建立双向映射关系，当用户在修改属性值后，可以找到对应的 VNode
const VNodeToIdMap = new Map<VNode, number>();
const IdToVNodeMap = new Map<number, VNode>();

let uid = 0;
function generateUid (vNode: VNode) {
  const id = VNodeToIdMap.get(vNode);
  if (id !== undefined) {
    return id;
  }
  uid++;
  return uid;
}

function isUserComponent(tag: string) {
  // TODO: 添加其他组件
  return tag === ClassComponent || tag === FunctionComponent;
}

function getParentUserComponent(node: VNode) {
  let parent = node.parent;
  while(parent) {
    if (isUserComponent(parent.tag)) {
      break;
    }
    parent = parent.parent;
  }
  return parent;
}

function parseTreeRoot(travelVNodeTree, treeRoot: VNode) {
  const result: any[] = [];
  travelVNodeTree(treeRoot, (node: VNode) => {
    const tag = node.tag;
    if (isUserComponent(tag)) {
      const id = generateUid(node);
      result.push(id);
      const name = node.type.name;
      result.push(name);
      const parent = getParentUserComponent(node);
      if (parent) {
        const parentId = VNodeToIdMap.get(parent);
        result.push(parentId);
      } else {
        result.push('');
      }
      const key = node.key;
      if (key !== null) {
        result.push(key);
      } else {
        result.push('');
      }
      VNodeToIdMap.set(node, id);
      IdToVNodeMap.set(id, node);
    }
  });
  return result;
}

export function queryVNode(id: number): VNode|undefined {
  return IdToVNodeMap.get(id);
}

export function clearVNode(vNode: VNode) {
  if (VNodeToIdMap.has(vNode)) {
    const id = VNodeToIdMap.get(vNode);
    VNodeToIdMap.delete(vNode);
    IdToVNodeMap.delete(id);
  }
}

export default parseTreeRoot;
