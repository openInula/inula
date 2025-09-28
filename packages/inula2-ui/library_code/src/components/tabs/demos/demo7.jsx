import Tabs from "../index.jsx";
import Button from "../../button/index.jsx";

const TabsDemo = () => {
  let size = "default"; //small | default | large
  const items = [
    {
      key: "1",
      label: "Tab 1",
      children: "Content of Tab Pane 1",
    },
    {
      key: "2",
      label: "Tab 2",
      children: "Content of Tab Pane 2",
    },
    { key: "3", label: "Tab 3", children: "Content of Tab Pane 3" },
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
        <Button onClick={() => (size = "small")}>Small</Button>
        <Button onClick={() => (size = "default")}>Default</Button>
        <Button onClick={() => (size = "large")}>Large</Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          // alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Tabs items={items} defaultActiveKey="1" size={size} />
        <Tabs items={items} defaultActiveKey="1" size={size} type="card" />
        <Tabs
          items={items}
          defaultActiveKey="1"
          size={size}
          type="editable-card"
        />
      </div>
    </div>
  );
};

export default TabsDemo;
