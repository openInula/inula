import Tree from "../index.jsx";

const treeData = [
  {
    title: "0-0",
    key: "0-0",
    children: [
      {
        title: "0-0-0",
        key: "0-0-0",
        children: [
          { title: "0-0-0-0", key: "0-0-0-0" },
          { title: "0-0-0-1", key: "0-0-0-1" },
          { title: "0-0-0-2", key: "0-0-0-2" },
        ],
      },
      {
        title: "0-0-1",
        key: "0-0-1",
        children: [
          { title: "0-0-1-0", key: "0-0-1-0" },
          { title: "0-0-1-1", key: "0-0-1-1" },
          { title: "0-0-1-2", key: "0-0-1-2" },
        ],
      },
      {
        title: "0-0-2",
        key: "0-0-2",
      },
    ],
  },
  {
    title: "0-1",
    key: "0-1",
    children: [
      { title: "0-1-0-0", key: "0-1-0-0" },
      { title: "0-1-0-1", key: "0-1-0-1" },
      { title: "0-1-0-2", key: "0-1-0-2" },
    ],
  },
  {
    title: "0-2",
    key: "0-2",
  },
];

const TreeDemo = () => {
  let expandedKeys = ["0-0-0", "0-0-1"];
  let checkedKeys = ["0-0-0"];
  let selectedKeys = [];
  let autoExpandParent = true;

  const onExpand = (expandedKeysValue) => {
    console.log("onExpand", expandedKeysValue);
    expandedKeys = expandedKeysValue;
    autoExpandParent = false;
  };

  const onCheck = (checkedKeysValue) => {
    console.log("onCheck", checkedKeysValue);
    checkedKeys = checkedKeysValue;
  };

  const onSelect = (selectedKeysValue, info) => {
    console.log("onSelect", info);
    selectedKeys = selectedKeysValue;
  };

  return (
    <Tree
      showLine
      checkable
      onExpand={onExpand}
      expandedKeys={expandedKeys}
      autoExpandParent={autoExpandParent}
      onCheck={onCheck}
      checkedKeys={checkedKeys}
      onSelect={onSelect}
      selectedKeys={selectedKeys}
      treeData={treeData}
    />
  );
};

export default TreeDemo;
