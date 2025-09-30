import Demo1 from './demos/demo1.jsx';
import Demo2 from './demos/demo2.jsx';
// import Demo3 from './demos/demo3.jsx';
// import Demo4 from './demos/demo4.jsx';
// import Demo5 from './demos/demo5.jsx';
// import Demo6 from './demos/demo6.jsx';
// import WeekRangeDemo from './demos/week-range-demo.jsx';

function DatePickerDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2>基础用法</h2>
          <div>最简单的用法，在浮层中可以选择或者输入日期。</div>
        </div>
        <div><Demo1 /></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2>日期范围选择器</h2>
          <div>通过设置 picker 属性，指定范围选择器类型。</div>
        </div>
        <div><Demo2 /></div>
      </div>
      
      {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h2>周范围选择器</h2>
          <div>专门测试周范围选择器的功能和样式。</div>
        </div>
        <div><WeekRangeDemo /></div>
      </div> */}
    </div>
  );
}

export default DatePickerDemo;
