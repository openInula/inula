function Counter() {
  let count = 0; 
  
  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => count++}>增加</button>
    </div>
  );
}