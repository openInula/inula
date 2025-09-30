import { useState } from 'react';

function Counter({ onIncrement }) {
  return <button onClick={onIncrement}>增加</button>;
}

function App() {
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount(c => c + 1);
  }

  return (
    <div>
      <p>计数：{count}</p>
      <Counter onIncrement={handleIncrement} />
    </div>
  );
}


