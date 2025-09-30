function Timer() {
    let time = Date.now();
  
    watch(() => {
      const timer = setInterval(() => {
        time = Date.now();
      }, 1000);
      // 返回清理函数
      return () => clearInterval(timer);
    });
  
    return <div>当前时间：{new Date(time).toLocaleTimeString()}</div>;
  }