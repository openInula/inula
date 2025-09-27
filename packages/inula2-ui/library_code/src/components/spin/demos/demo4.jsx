import Spin from "../index.jsx";
import Button from "../../button/index.jsx";
const SpinDemo = () => {
  let showFullScreen = false;
  let percent = -100;

  const showLoader = () => {
    showFullScreen = true;
    const interval = setInterval(() => {
      percent += 10;
      if (percent >= 100) {
        clearInterval(interval);
        showFullScreen = false;
        percent = -100;
      }
    }, 100);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <Spin spinning={showFullScreen} fullscreen percent={percent} size="large"></Spin>
        <Button onClick={showLoader}>点击触发全屏加载</Button>
      </div>
    </div>
  );
};

export default SpinDemo;
