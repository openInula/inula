import Spin from "../index.jsx";
import Switch from "../../switch/index.jsx";
const SpinDemo = () => {
  let auto = false;
  let percent = -50;

  watch(() => {
    if (auto) {
      percent = "auto";
      return;
    } else {
      percent = -50;
      const interval = setInterval(() => {
        percent += 10;
        if (percent >= 100) {
          percent = -50;
        }
      }, 100);

      return () => {
        clearInterval(interval);
      };
    }
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          width: "100%",
          height: 60,
        }}
      >
        <Spin percent={percent} size="small"></Spin>
        <Spin percent={percent}></Spin>
        <Spin percent={percent} size="large"></Spin>
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Switch
          checked={auto}
          onChange={() => (auto = !auto)}
          unCheckedChildren="auto"
          checkedChildren="auto"
        />
        <text>点击切换auto,进度条永不停止</text>
      </div>
    </div>
  );
};

export default SpinDemo;
