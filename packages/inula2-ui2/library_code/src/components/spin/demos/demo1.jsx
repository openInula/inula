import Spin from "../index.jsx";
import Tag from "../../tag/index.jsx"

const SpinDemo = () => {

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", width: '100%' }}>
        <Tag color="geekblue">最简单的Spin</Tag>
        <Spin />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: '100%' }}>
        <Tag color="geekblue">小中大的Spin</Tag>
        <Spin size="small" />
        <Spin size="default" />
        <Spin size="large" />
      </div>
    </div>
  );
};

export default SpinDemo;
