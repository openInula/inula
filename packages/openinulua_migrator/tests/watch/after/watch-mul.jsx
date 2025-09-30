function MultiWatch() {
    let a = 1;
    let b = 2;
  
    watch(() => {
      console.log('a 变化：', a);
    });
    watch(() => {
      console.log('b 变化：', b);
    });
  
    return (
      <div>
        <button onClick={() => a++}>a++</button>
        <button onClick={() => b++}>b++</button>
      </div>
    );
  }