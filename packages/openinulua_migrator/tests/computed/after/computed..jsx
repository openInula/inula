function DoubleCounter() {
    let count = 0;
    // 计算值：double 会自动随着 count 变化
    const double = count * 2;
  
    return (
      <div>
        <p>当前计数：{count}</p>
        <p>双倍值：{double}</p>
        <button onClick={() => count++}>增加</button>
      </div>
    );
  }