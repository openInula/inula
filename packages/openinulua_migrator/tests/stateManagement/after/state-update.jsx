function Counter() {
  let count = 0;
  let message = '';
  
  function increment() {
    count++;  
    message = `当前计数：${count}`;  
  }
  
  return (
    <div>
      <p>{message}</p>
      <button onClick={increment}>增加</button>
    </div>
  );
}