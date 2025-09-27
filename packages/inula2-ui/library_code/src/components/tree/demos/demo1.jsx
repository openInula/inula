import Tree from "../index.jsx";

const TreeDemo = () => {
  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };

  const onCheck = (checkedKeys, info) => {
    console.log("onCheck", checkedKeys, info);
  };
  const treeData = [
    {
      title: "parent 1",
      key: "0-0",
      children: [
        {
          title: "parent 1-0",
          key: "0-0-0",
          disabled: true,
          children: [
            {
              title: "leaf",
              key: "0-0-0-0",
              disableCheckbox: true,
            },
            {
              title: "leaf",
              key: "0-0-0-1",
            },
          ],
        },
        {
          title: "parent 1-1",
          key: "0-0-1",
          children: [
            {
              title: <span style={{ color: "#1677ff" }}>sss</span>,
              key: "0-0-1-0",
            },
          ],
        },
        { title: "parent 1-0", key: "0-0-2" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: "80%" }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tree
          checkable
          defaultExpandedKeys={["0-0-0", "0-0-1"]}
          defaultSelectedKeys={["0-0-1"]}
          defaultCheckedKeys={["0-0-0", "0-0-1"]}
          onSelect={onSelect}
          onCheck={onCheck}
          treeData={treeData}
        />
      </div>
    </div>
  );
};

export default TreeDemo;
