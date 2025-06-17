/*
 * Copyright (c) 2025 Huawei Technologies Co.,Ltd.
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

/**
 * 用一个纯数据类型的对象 tree 去表示树的结构是非常清晰的，但是它不能准确的模拟 VNode 中存在的引用
 * 关系，需要进行转换 getMockVNodeTree
 */

import { parseAttr } from '../parser/parseAttr';
import parseTreeRoot from '../parser/parseVNode';
import { VNode } from '../../../inula/src/renderer/vnode/VNode';
import { FunctionComponent, ClassComponent } from '../../../inula/src/renderer/vnode/VNodeTags';
import { helper } from '../../../inula/src/external/devtools';

const mockComponentNames = ['Apple', 'Pear', 'Banana', 'Orange', 'Jenny', 'Kiwi', 'Coconut'];

function MockVNode(tag: string, props = {}, key = null, realNode = {}) {
  const vNode = new VNode(tag, props, key, realNode);
  const name = mockComponentNames.shift() || 'MockComponent';
  vNode.type = { name };
  return vNode;
}

interface IMockTree {
  tag: string;
  children?: IMockTree[];
}

// 模拟树
const tree: IMockTree = {
  tag: ClassComponent,
  children: [
    { tag: FunctionComponent },
    { tag: ClassComponent },
    { tag: FunctionComponent },
    {
      tag: FunctionComponent,
      children: [{ tag: ClassComponent }],
    },
  ],
};

function addOneThousandNode(node: IMockTree) {
  const nodes = [];
  for (let i = 0; i < 1000; i++) {
    nodes.push({ tag: FunctionComponent });
  }
  node?.children.push({ tag: ClassComponent, children: nodes });
}

addOneThousandNode(tree);

/**
 * 将mock数据转变为 VNode 树
 *
 * @param node 树节点
 * @param vNode VNode节点
 */
function getMockVNodeTree(node: IMockTree, vNode: VNode) {
  const children = node.children;
  if (children && children.length !== 0) {
    const childNode = children[0];
    let childVNode = MockVNode(childNode.tag);
    childVNode.key = '0';
    getMockVNodeTree(childNode, childVNode);
    // 需要建立双链
    vNode.child = childVNode;
    childVNode.parent = vNode;
    for (let i = 1; i < children.length; i++) {
      const nextNode = children[i];
      const nextVNode = MockVNode(nextNode.tag);
      nextVNode.key = String(i);
      nextVNode.parent = vNode;
      getMockVNodeTree(nextNode, nextVNode);
      childVNode.next = nextVNode;
      childVNode = nextVNode;
    }
  }
}
const rootVNode = MockVNode(tree.tag);
getMockVNodeTree(tree, rootVNode);

export const mockParsedVNodeData = parseTreeRoot(helper.travelVNodeTree, rootVNode);
//export const mockParsedVNodeData = {};

const mockState = {
  str: 'jenny',
  num: 3,
  boolean: true,
  und: undefined,
  fun: () => ({}),
  symbol: Symbol('sym'),
  map: new Map([['a', 'a']]),
  set: new Set(['a', 1, 2, Symbol('bambi')]),
  arr: [1, 2, 3, 4],
  obj: {
    niko: { jenny: 'jenny' },
  },
};

export const parsedMockState = parseAttr(mockState);
