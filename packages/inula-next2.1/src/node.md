<!-- # Here're some certain rules when adding a new node type

1. The create function of a new node type should be named as `create<node_type_name>Node`. e.g:
  ```js
  const $node0 = createCustomNode();
  ```
Q: Why not use a single createNode function and pass the node type as a parameter?

A: First it's bad for tree shaking because it needs to include all the node types in the final bundle even if we only use a few of them. Second, we don't want to extend the createNode function to a huge function with a lot of if-else branches.

2. Parameters of the create function should be must-have parameters for the node type. Optional parameters should be a separate function to allow tree shaking. e.g:
  ```js
  // ---- The tag name is a must-have parameter for the createElementNode
  const $node0 = createElementNode('div');
  // ---- The text is an optional parameter for the node
  setHTMLProp($node0, 'text', () => 'Hello World');
  ```
 -->


```js
createXXXNode(updater: Updater<XXXNode>, ...args)

node.nodes = [...CHILD_NODES]
node.update = (dirtyBits: Bits) => {
  node.dirtyBits = dirtyBits
  node.updater(node)
  delete node.dirtyBits

  updateChildren(node, dirtyBits)
}

node.update = node => {}
```


3. 子树的建立在createXXXNode()
