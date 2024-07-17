/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { VNode } from '../../../inula/src/renderer/vnode/VNode';
import {
  ClassComponent,
  ContextConsumer,
  ContextProvider,
  ForwardRef,
  FunctionComponent,
  MemoComponent,
  SuspenseComponent,
} from '../../../inula/src/renderer/vnode/VNodeTags';

export type NameObj = {
  itemName: string;
  badge: Array<string>;
};

// 建立双向映射关系，当用户在修改属性值后，可以找到对应的 VNode
export let VNodeToIdMap: Map<VNode, number>;
export let IdToVNodeMap: Map<number, VNode>;

if (!VNodeToIdMap) {
  VNodeToIdMap = new Map<VNode, number>();
}

if (!IdToVNodeMap) {
  IdToVNodeMap = new Map<number, VNode>();
}

let uid = 0;
function generateUid(vNode: VNode) {
  const id = VNodeToIdMap.get(vNode);
  if (id !== undefined) {
    return id;
  }
  uid++;
  return uid;
}

const componentType = [
  ClassComponent,
  FunctionComponent,
  ContextProvider,
  ContextConsumer,
  ForwardRef,
  SuspenseComponent,
  MemoComponent,
];

const badgeNameArr: Array<string> = ['withRouter(', 'SideEffect(', 'Connect(', 'injectIntl(', 'Pure('];

export function isUserComponent(tag: string) {
  return componentType.includes(tag);
}

function getParentUserComponent(node: VNode) {
  let parent = node.parent;
  while (parent) {
    if (isUserComponent(parent.tag)) {
      break;
    }
    parent = parent.parent;
  }
  return parent;
}

function getContextName(node: VNode, type: string) {
  const contextType = type;
  if (!node.type.displayName) {
    if (node.type.value) {
      if (typeof node.type.value === 'object') {
        return `Context.${contextType}`;
      } else {
        return `${node.type.value}.${contextType}`;
      }
    } else {
      if (node.type._context?.displayName) {
        return `${node.type._context.displayName}.${contextType}`;
      }
      return `Context.${contextType}`;
    }
  }
  return `${node.type.displayName}.${contextType}`;
}

const getForwardRefName = (node: VNode): NameObj => {
  const forwardRefName: NameObj = {
    itemName: '',
    badge: ['ForwardRef'],
  };
  if (!node.type.render?.name) {
    if (node.type.render?.name !== '') {
      forwardRefName.itemName = node.type?.displayName ? node.type?.displayName : 'Anonymous';
    } else {
      forwardRefName.itemName = 'Anonymous';
    }
  } else {
    forwardRefName.itemName = node.type.render?.name;
  }
  return forwardRefName;
};

// 用于结构组件名，例如： Pure(Memo(xxx)) => xxx 并且把 Pure Memo 加到 NameObj.badge 里
const parseComponentName = (name: NameObj): NameObj => {
  badgeNameArr.forEach(badgeName => {
    if (name.itemName.startsWith(badgeName)) {
      // 截断开头的高阶组件名，并把最后一个 ) 替换为 ''。例如： Pure(Memo(xxx)) => Memo(xxx)) => Memo(xxx)
      name.itemName = name.itemName.substring(badgeName.length).replace(/(\))(?!.*\1)/, '');
      name.badge.push(badgeName.substring(0, badgeName.length - 1));
    }
  });
  return name;
};

// 取字符串括号里的值
const getValuesInParentheses = (name: string) => {
  let result = name;
  const regex = /\((.+?)\)/g;
  const results = name.match(regex);
  if (results) {
    const option = results[0];
    if (option) {
      result = option.substring(1, option.length - 1);
    }
  }
  return result;
};

function isNullOrUndefined(prop) {
  return !prop || typeof prop === 'undefined' || prop === 0;
}

function parseTreeRoot(travelVNodeTree, treeRoot: VNode) {
  const result: any[] = [];
  travelVNodeTree(treeRoot, (node: VNode) => {
    const tag = node.tag;

    if (isUserComponent(tag)) {
      // 添加 ID
      const id = generateUid(node);
      result.push(id);
      let nameObj: NameObj = {
        itemName: '',
        badge: [],
      };
      // 拿到不同类型的展示名字
      if (tag === ContextProvider) {
        nameObj.itemName = getContextName(node, 'Provider');
        result.push(nameObj);
      } else if (tag === ContextConsumer) {
        nameObj.itemName = getContextName(node, 'Consumer');
        result.push(nameObj);
      } else if (tag === ForwardRef) {
        const name = getForwardRefName(node);
        result.push(name);
      } else if (tag === SuspenseComponent) {
        nameObj.itemName = 'Suspense';
        result.push(nameObj);
      } else if (tag === MemoComponent) {
        const name = node.type?.displayName || node.type?.name || node.type.render?.name;
        nameObj.itemName = !isNullOrUndefined(name) ? name : 'Anonymous';
        nameObj.badge.push('Memo');
        nameObj = parseComponentName(nameObj);
        result.push(nameObj);
      } else {
        const name = node.type.displayName || node.type?.name;
        nameObj.itemName = !isNullOrUndefined(name) ? name : 'Anonymous';
        nameObj = parseComponentName(nameObj);
        result.push(nameObj);
      }

      // 添加父节点 ID
      const parent = getParentUserComponent(node);
      if (parent) {
        const parentId = VNodeToIdMap.get(parent);
        result.push(parentId);
      } else {
        result.push('');
      }

      // 添加节点 key 值
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

export function queryVNode(id: number): VNode | undefined {
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
