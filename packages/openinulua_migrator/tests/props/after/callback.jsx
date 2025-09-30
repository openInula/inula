function Counter({ onIncrement }) {
  return <button onClick={onIncrement}>增加</button>;
}

function App() {
  let count = 0;

  function handleIncrement() {
    count++;
  }

  return (
    <div>
      <p>计数：{count}</p>
      <Counter onIncrement={handleIncrement} />
    </div>
  );
}


