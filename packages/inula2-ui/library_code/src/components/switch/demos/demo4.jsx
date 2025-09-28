import Switch from "../index.jsx";
import Tag from "../../tag/index.jsx";

const SwitchDemo = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">加载状态开关</Tag>
        <Switch defaultChecked loading />
        <Switch defaultValue={true} loading size="small" />
      </div>
    </div>
  );
};

export default SwitchDemo;
