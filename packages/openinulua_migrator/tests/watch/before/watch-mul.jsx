import { useState, useEffect } from "react";

function MultiWatch() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);

  useEffect(() => {
    console.log("a 变化：", a);
  }, [a]); // 依赖 a，每次变化时执行

  useEffect(() => {
    console.log("b 变化：", b);
  }, [b]); // 依赖 b，每次变化时执行

  return (
    <div>
      <button onClick={() => setA(prev => prev + 1)}>a++</button>
      <button onClick={() => setB(prev => prev + 1)}>b++</button>
    </div>
  );
}

export default MultiWatch;
