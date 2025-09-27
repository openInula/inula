import Spin from "../index.jsx";

const SpinDemo = () => {

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", width: '100%' }}>
      <text style={{width: '12%', textAlign: 'start'}}>最简单的Spin</text>
        <Spin />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: '100%' }}>
      <text style={{width: '12%', textAlign: 'start'}}>小中大的Spin</text>
        <Spin size="small" />
        <Spin size="default" />
        <Spin size="large" />
      </div>
    </div>
  );
};

export default SpinDemo;
