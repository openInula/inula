import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(prev => prev + 1);
  }

  return (
    <div>
      <p>当前计数：{count}</p>
      <button onClick={increment}>增加</button>
    </div>
  );
}

export default Counter;
