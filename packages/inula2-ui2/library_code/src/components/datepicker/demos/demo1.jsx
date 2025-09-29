import DatePicker from '../index.jsx';

function Demo1() {
  const handleChange = (value) => {
    console.log('选择的值:', value);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', maxWidth: '800px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', color: '#262626' }}>基础日期选择器</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker placeholder="请选择日期" onChange={handleChange} />
          <DatePicker mode="week" placeholder="请选择周" onChange={handleChange} />
          <DatePicker mode="month" placeholder="请选择月份" onChange={handleChange} />
          <DatePicker mode="quarter" placeholder="请选择季度" onChange={handleChange} />
          <DatePicker mode="year" placeholder="请选择年份" onChange={handleChange} />
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '12px', color: '#262626' }}>范围选择器</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker picker="range" onChange={handleChange} />
          <span style={{ color: '#666' }}>双月显示的日期范围选择</span>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '12px', color: '#262626' }}>不同模式的范围选择</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <DatePicker picker="range" mode="week" onChange={handleChange} />
            <span style={{ color: '#666' }}>周范围选择</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <DatePicker picker="range" mode="month" onChange={handleChange} />
            <span style={{ color: '#666' }}>月份范围选择</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <DatePicker picker="range" mode="quarter" onChange={handleChange} />
            <span style={{ color: '#666' }}>季度范围选择</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <DatePicker picker="range" mode="year" onChange={handleChange} />
            <span style={{ color: '#666' }}>年份范围选择</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '12px', color: '#262626' }}>不同尺寸</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <DatePicker size="small" placeholder="小尺寸" onChange={handleChange} />
          <DatePicker size="default" placeholder="默认尺寸" onChange={handleChange} />
          <DatePicker size="large" placeholder="大尺寸" onChange={handleChange} />
        </div>
      </div>
      
      <div>
        <h3 style={{ marginBottom: '12px', color: '#262626' }}>禁用状态</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <DatePicker disabled placeholder="禁用状态" onChange={handleChange} />
          <DatePicker picker="range" disabled placeholder="禁用范围选择" onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}

export default Demo1;
