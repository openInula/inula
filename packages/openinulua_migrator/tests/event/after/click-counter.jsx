function ClickCounter() {
  let count = 0;
  
  function handleClick() {
    count++;
  }
  
  return (
    <button onClick={handleClick}>
      点击次数：{count}
    </button>
  );
}


