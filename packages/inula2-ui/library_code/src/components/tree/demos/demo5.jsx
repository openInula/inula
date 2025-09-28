import Tree from "../index.jsx";

const dig = (path = "0", level = 3) => {
  const list = [];
  for (let i = 0; i < 10; i += 1) {
    const key = `${path}-${i}`;
    const treeNode = {
      title: key,
      key,
    };

    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }

    list.push(treeNode);
  }
  return list;
};

const treeData = dig();

const TreeDemo = () => (
  <Tree
    checkable
    showLine
    treeData={treeData}
    height={233}
    defaultExpandAll
    titleRender={(item) => {
      const title = item.title;
      return <text>{title}</text>;
    }}
  />
);

export default TreeDemo;
