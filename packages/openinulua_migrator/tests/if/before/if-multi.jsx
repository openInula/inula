function TrafficLight({ color }) {
  return (
    <div>
      {color === 'red' ? (
        <p>停止</p>
      ) : color === 'yellow' ? (
        <p>注意</p>
      ) : color === 'green' ? (
        <p>通行</p>
      ) : (
        <p>信号灯故障</p>
      )}
    </div>
  );
}


