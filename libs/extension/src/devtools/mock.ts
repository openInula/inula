
import { parseAttr } from '../parser/parseAttr';
import parseTreeRoot from '../parser/parseVNode';
import { VNode } from './../../../horizon/src/renderer/vnode/VNode';
import { FunctionComponent, ClassComponent } from './../../../horizon/src/renderer/vnode/VNodeTags';

const mockComponentNames = ['Apple', 'Pear', 'Banana', 'Orange', 'Jenny', 'Kiwi', 'Coconut'];

function MockVNode(tag: string, props = {}, key = null, realNode = {}) {
  const vNode = new VNode(tag, props, key, realNode);
  const name = mockComponentNames.shift() || 'MockComponent';
  vNode.type = {name};
  return vNode;
}

interface IMockTree {
  tag: string,
  children?: IMockTree[],
}

const tree: IMockTree = {
  tag: ClassComponent,
  children: [
    {tag: FunctionComponent},
    {tag: ClassComponent},
    {tag: FunctionComponent},
    {
      tag: FunctionComponent,
      children: [
        {tag: ClassComponent}
      ]
    }
  ]
}

function addOneThousandNode(node: IMockTree) {
  const nodes = [];
  for(let i = 0; i < 1000; i++) {
    nodes.push({tag: FunctionComponent});
  }
  node?.children.push({tag: ClassComponent,children: nodes});
};

addOneThousandNode(tree);

function getMockVNodeTree(tree: IMockTree, vNode: VNode) {
  const children = tree.children;
  if (children && children.length !== 0) {
    const childNode = children[0];
    let childVNode = MockVNode(childNode.tag);
    childVNode.key = '0';
    getMockVNodeTree(childNode, childVNode);
    vNode.child = childVNode;
    childVNode.parent = vNode;
    for(let i = 1; i < children.length; i++) {
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

export const mockParsedVNodeData = parseTreeRoot(rootVNode);


const mockState = {
  str: 'jenny',
  num: 3,
  boolean: true,
  und: undefined,
  fun: () => {},
  symbol: Symbol('sym'),
  map: new Map([['a', 'a']]),
  set: new Set(['a', 1, 2, Symbol('bambi')]),
  arr: [1,2,3,4],
  obj: {
    niko: {jenny: 'jenny'}
  }
};

export const parsedMockState = parseAttr(mockState);