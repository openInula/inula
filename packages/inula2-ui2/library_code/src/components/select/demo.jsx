// import Select from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';
import demo6 from './demos/demo6.jsx';
import demo7 from './demos/demo7.jsx';
import demo8 from './demos/demo8.jsx';

function SelectDemo() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>基础用法</h2>
            <div>最基础的下拉选择框，支持选项切换。</div>
          </div>
          <div style={{ display: 'flex' }}><demo1 /></div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>禁用</h2>
            <div>可禁用整个下拉选择框和单个选项。</div>
          </div>
          <div style={{ display: 'flex' }}><demo3 /></div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>可清空</h2>
            <div>支持清空已选项。</div>
          </div>
          <div style={{ display: 'flex' }}><demo5 /></div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>多选</h2>
            <div>支持多选功能。</div>
          </div>
          <div style={{ display: 'flex' }}><demo6 /></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>受控用法</h2>
            <div>通过 value 属性控制选中项。</div>
          </div>
          <div style={{ display: 'flex' }}><demo2 /></div>
        </div>
        
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>默认值</h2>
            <div>设置默认选中项。</div>
          </div>
          <div style={{ display: 'flex' }}><demo4 /></div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>分组/复杂用法</h2>
            <div>支持分组选项、多选等复杂场景。</div>
          </div>
          <div style={{ display: 'flex' }}><demo7 /></div>
        </div>
      </div>
      <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h2>变体样式</h2>
            <div>支持变体样式。</div>
          </div>
          <div style={{ display: 'flex' }}><demo8 /></div>
        </div>
    </div>
  );
}
export default SelectDemo;