// import Button from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';
import demo6 from './demos/demo6.jsx';

function RadioDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>基础用法</h2>
                        <div>最基础的单选框，支持选项切换。</div>
                    </div>
                    <div><demo1 /></div>
                </div>

                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>不同尺寸</h2>
                        <div>展示单选框的三种尺寸：大号、默认、小号。</div>
                    </div>
                    <div><demo3 /></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>选项组用法</h2>
                        <div>通过 options 属性批量渲染单选框组。</div>
                    </div>
                    <div><demo2 /></div>
                </div>

                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>混合状态</h2>
                        <div>同一组内同时包含普通、禁用和只读的单选框。</div>
                    </div>
                    <div><demo6 /></div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>禁用状态</h2>
                        <div>展示禁用的单选框，用户无法进行选择。</div>
                    </div>
                    <div><demo4 /></div>
                </div>

                <div>
                    <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                        <h2>只读状态</h2>
                        <div>展示只读的单选框，选中状态不可更改。</div>
                    </div>
                    <div><demo5 /></div>
                </div>
            </div>
        </div>
    );
} 
export default RadioDemo;