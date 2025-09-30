function TrafficLight({ color }) {
  return (
    <div>
      <if cond={color === 'red'}>
        <p>停止</p>
      </if>
      <else-if cond={color === 'yellow'}>
        <p>注意</p>
      </else-if>
      <else-if cond={color === 'green'}>
        <p>通行</p>
      </else-if>
      <else>
        <p>信号灯故障</p>
      </else>
    </div>
  );
}


