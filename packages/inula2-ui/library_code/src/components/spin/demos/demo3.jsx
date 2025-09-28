import Spin from "../index.jsx";
import Switch from "../../switch/index.jsx";
const SpinDemo = () => {
  let loading = false;

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
        <text style={{ width: "12%", textAlign: "start" }}>
          点击延迟一秒触发加载
        </text>
        <Spin spinning={loading} delay={1000}>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "skyblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
            }}
          >
            这是子组件
          </div>
        </Spin>
        <Switch checked={loading} onChange={() => (loading = !loading)} />
        <text>延迟触发切换状态按钮</text>
      </div>
    </div>
  );
};

export default SpinDemo;
