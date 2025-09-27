import Tree from "../index.jsx";

const initTreeData = [
  { title: "Expand to load", key: "0" },
  { title: "Expand to load", key: "1" },
  { title: "Tree Node", key: "2", isLeaf: true },
];

const updateTreeData = (list, key, children) =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }
    return node;
  });

const TreeDemo = () => {
  let treeData = initTreeData;

  const onLoadData = ({ key, children }) =>
    new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      setTimeout(() => {
        treeData = updateTreeData(treeData, key, [
          { title: "Child Node", key: `${key}-0` },
          { title: "Child Node", key: `${key}-1` },
        ]);

        resolve();
      }, 1000);
    });

  return <Tree loadData={onLoadData} treeData={treeData} />;
};

export default TreeDemo;
