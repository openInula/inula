import Switch from "../index.jsx";
import Tag from "../../tag/index.jsx";

const SwitchDemo = () => {
  let checked = false;

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
        <Tag color="geekblue">默认型号、小号开关</Tag>
        <Switch />
        <text>默认型号</text>
        <Switch size="small" />
        <text>小号</text>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">默认选中</Tag>
        <Switch defaultChecked={true} />
        <text>默认选中</text>
      </div>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          width: "100%",
        }}
      >
        <Tag color="geekblue">禁用开关</Tag>
        <Switch defaultChecked={true} disabled={true} />
        <text>默认选中禁用</text>
        <Switch disabled={true} />
        <text>禁用</text>
      </div>
    </div>
  );
};

export default SwitchDemo;
