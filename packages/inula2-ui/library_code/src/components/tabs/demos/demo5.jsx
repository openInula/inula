import Tabs from "../index.jsx";
import Button from "../../button/index.jsx";

const TabsDemo = () => {
  let indicator = "center"; // start | center | end | { size?: number | (origin: number) => number; align: start | center | end; } 自定义指示器长度和对齐方式
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
        <Tabs items={items} defaultActiveKey="1" indicator={{ size: (origin) => origin - 20, align: indicator }} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Button onClick={() => (indicator = "start")}>Start</Button>
        <Button onClick={() => (indicator = "center")}>Center</Button>
        <Button onClick={() => (indicator = "end")}>End</Button>
      </div>
    </div>
  );
};

export default TabsDemo;
