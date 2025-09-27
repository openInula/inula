import Tree from "../index.jsx";
import Icon from "../../icon/index.jsx";

const treeData1 = [
  {
    title: "parent 1",
    key: "0-0",
    icon: <Icon value="face-smile" theme="filled" color="skyblue" size={14} />,
    children: [
      {
        title: "leaf",
        key: "0-0-0",
        icon: (
          <Icon value="face-smile" theme="filled" color="skyblue" size={14} />
        ),
      },
      {
        title: "leaf",
        key: "0-0-1",
        // icon: ({ selected }) =>
        //   selected ? (
        //     <Icon value="face-smile" theme="filled" color="skyblue" />
        //   ) : (
        //     <Icon value="heart" theme="filled" color="skyblue" />
        //   ),
        icon: <Icon value="heart" theme="filled" color="skyblue" size={14} />,
      },
    ],
  },
];

const treeData2 = [
  {
    title: "parent 1",
    key: "0-0",
    children: [
      {
        title: "parent 1-0",
        key: "0-0-0",
        children: [
          {
            title: "leaf",
            key: "0-0-0-0",
          },
          {
            title: "leaf",
            key: "0-0-0-1",
          },
          {
            title: "leaf",
            key: "0-0-0-2",
          },
        ],
      },
      {
        title: "parent 1-1",
        key: "0-0-1",
        children: [
          {
            title: "leaf",
            key: "0-0-1-0",
          },
        ],
      },
      {
        title: "parent 1-2",
        key: "0-0-2",
        children: [
          {
            title: "leaf",
            key: "0-0-2-0",
          },
          {
            title: "leaf",
            key: "0-0-2-1",
          },
        ],
      },
    ],
  },
];

const TreeDemo = () => {
  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys, info);
  };
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
          showIcon
          defaultExpandAll
          defaultSelectedKeys={["0-0-0"]}
          switcherIcon={<Icon value="chevron-right" theme="filled" size={14} />}
          treeData={treeData1}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tree
          showLine
          switcherIcon={<Icon value="chevron-right" theme="filled" size={14} />}
          defaultExpandedKeys={["0-0-0"]}
          onSelect={onSelect}
          treeData={treeData2}
        />
      </div>
    </div>
  );
};

export default TreeDemo;
