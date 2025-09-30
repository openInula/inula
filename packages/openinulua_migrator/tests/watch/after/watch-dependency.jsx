function Logger() {
    let count = 0;
    watch(() => {
      console.log('count 变化为：', count);
    });
  
    return <button onClick={() => count++}>增加</button>;
  }