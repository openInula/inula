/**
 * 通过设置 picker 属性，指定范围选择器类型。
 */
import DatePicker from '../index.jsx';

function Demo2() {
  const handleChange = (value) => {
    console.log('选择的日期范围:', value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>日期范围选择器</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>日期范围选择器</h4>
        <DatePicker picker="date" onChange={handleChange} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>周范围选择器</h4>
        <DatePicker picker="week" onChange={handleChange} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>月份范围选择器</h4>
        <DatePicker picker="month" onChange={handleChange} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>季度范围选择器</h4>
        <DatePicker picker="quarter" onChange={handleChange} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>年份范围选择器</h4>
        <DatePicker picker="year" onChange={handleChange} />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>自定义分隔符</h4>
        <DatePicker picker="date" separator="至" onChange={handleChange} />
      </div>
    </div>
  );
}

export default Demo2;
