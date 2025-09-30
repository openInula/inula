import { useState } from 'react';

function ClickCounter() {
  const [count, setCount] = useState(0);
  
  function handleClick() {
    setCount(c => c + 1);
  }
  
  return (
    <button onClick={handleClick}>
      点击次数：{count}
    </button>
  );
}


