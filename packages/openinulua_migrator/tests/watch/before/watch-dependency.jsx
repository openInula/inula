import { useState, useEffect } from "react";

function Logger() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("count 变化为：", count);
  }, [count]); // 依赖 count，每次变化时执行

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      增加
    </button>
  );
}

export default Logger;
