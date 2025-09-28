import Switch from "../index.jsx";
import Button from "../../button/index.jsx";
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
        <Tag color="geekblue">外部受控开关</Tag>
        <Switch checked={true} style={{ backgroundColor: "pink" }} />
        <text>选中</text>
        <Switch checked={checked} />
        <Button onClick={() => (checked = !checked)}>切换</Button>
      </div>
    </div>
  );
};

export default SwitchDemo;
