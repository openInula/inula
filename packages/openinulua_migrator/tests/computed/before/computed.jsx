import { useState } from "react";

function DoubleCounter() {
  const [count, setCount] = useState(0);

  // 计算值：随着 count 自动变化
  const double = count * 2;

  return (
    <div>
      <p>当前计数：{count}</p>
      <p>双倍值：{double}</p>
      <button onClick={() => setCount(prev => prev + 1)}>增加</button>
    </div>
  );
}

export default DoubleCounter;
