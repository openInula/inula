import Tabs from "../index.jsx";
import Button from "../../button/index.jsx";

const TabsDemo = () => {
  let pos = "top"; // top | bottom | left | right
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
        <Tabs items={items} defaultActiveKey="1" tabPosition={pos} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Button onClick={() => (pos = "top")}>Top</Button>
        <Button onClick={() => (pos = "bottom")}>Bottom</Button>
        <Button onClick={() => (pos = "left")}>Left</Button>
        <Button onClick={() => (pos = "right")}>Right</Button>
      </div>
    </div>
  );
};

export default TabsDemo;
