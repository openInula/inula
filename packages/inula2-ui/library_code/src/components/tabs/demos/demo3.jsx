import Tabs from "../index.jsx";

const TabsDemo = () => {
  const onChange = (key) => {
    console.log(key);
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
        <Tabs
          items={Array.from({ length: 3 }).map((_, i) => {
            const id = String(i + 1);
            return {
              label: `Tab ${id}`,
              key: id,
              children: `Content of Tab Pane ${id}`,
            };
          })}
          centered
          defaultActiveKey="1"
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default TabsDemo;
