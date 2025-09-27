import Tabs from "../index.jsx";
import Icon from "../../icon/index.jsx";

const TabsDemo = () => {
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
      icon: <Icon value="vuejs" theme="brand" />,
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
      icon: <Icon value="apple" theme="brand" />,
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
        <Tabs items={items} defaultActiveKey="2" />
      </div>
    </div>
  );
};

export default TabsDemo;
