import { useState, useEffect } from "react";

function Timer() {
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, 1000);

    // 返回清理函数，组件卸载时清除定时器
    return () => clearInterval(timer);
  }, []); // 只在挂载时运行一次

  return <div>当前时间：{new Date(time).toLocaleTimeString()}</div>;
}

export default Timer;
