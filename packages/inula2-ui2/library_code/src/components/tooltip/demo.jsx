// import Tooltip from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';

function Tooltip() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>基本用法</h2>
                <div>最基础的 Tooltip 用法，鼠标悬停显示提示内容。</div>
            </div>
            <div><demo1 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>不同位置</h2>
                <div>Tooltip 支持在上、下、左、右等不同方向显示。</div>
            </div>
            <div><demo2 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>模式</h2>
                <div>Tooltip 支持hover和click模式</div>
            </div>
            <div><demo3 /></div>
        </div>
    );
}
export default Tooltip;