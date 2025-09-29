/**
 * 多选，不支持 showTime 以及 picker="time"。
 * @returns 
 */
import DatePicker from '../index.jsx';

function Demo3() {
  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>受控组件</h3>
      <DatePicker 
        value="2024-01-15"
        onChange={(value) => console.log('受控组件值变化:', value)}
        placeholder="受控组件"
      />
    </div>
  );
}

export default Demo3;