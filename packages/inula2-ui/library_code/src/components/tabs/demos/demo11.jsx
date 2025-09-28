import Tabs from "../index.jsx";
import Button from "../../button/index.jsx";

const TabsDemo = () => {
  let mode = "top";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24, width: 1000 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tabs
          defaultActiveKey="1"
          tabPosition={mode}
          style={{ height: 220 }}
          items={Array.from({ length: 30 }, (_, i) => {
            const id = String(i);
            return {
              label: `Tab-${id}`,
              key: id,
              disabled: i === 28,
              children: `Content of tab ${id}`,
            };
          })}
        />
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Button onClick={() => (mode = "top")}>Horizonal</Button>
        <Button onClick={() => (mode = "left")}>Vertical</Button>
      </div>
    </div>
  );
};

export default TabsDemo;
