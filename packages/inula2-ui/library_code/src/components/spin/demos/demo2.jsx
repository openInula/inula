import Spin from "../index.jsx";
import Switch from "../../switch/index.jsx";
const SpinDemo = () => {
  let loading = false;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", width: '100%' }}>
        <text style={{width: '12%', textAlign:'start'}}>简单嵌套状态</text>
        <Spin spinning={loading}>
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
        <text>切换嵌套组件的加载状态</text>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", width: '100%' }}>
      <text style={{width: '12%', textAlign: 'start'}}>自定义tip的Spin，小中大样式</text>
        <Spin size="small" tip="loading">
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
          ></div>
        </Spin>
        <Spin size="default" tip="loading">
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
          ></div>
        </Spin>
        <Spin size="large" tip="loading">
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
          ></div>
        </Spin>
      </div>
    </div>
  );
};

export default SpinDemo;
