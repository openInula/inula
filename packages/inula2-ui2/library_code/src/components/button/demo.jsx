// import Button from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';
import demo6 from './demos/demo6.jsx';

function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>基本</h2>
                <div>展示按钮的五种类型：主按钮、默认按钮、虚线按钮、文本按钮、链接按钮、变体样式。</div>
            </div>
            <div><demo1 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>危险</h2>
                <div>展示五种类型按钮的'危险'状态用法。</div>
            </div>
            <div><demo2 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>幽灵</h2>
                <div>展示按钮的'幽灵'状态，包括主按钮、默认按钮和危险主按钮的幽灵样式。</div>
            </div>
            <div><demo3 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>禁用</h2>
                <div>展示五种类型按钮的'禁用'状态用法。</div>
            </div>
            <div><demo4 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>加载中</h2>
                <div>展示五种类型按钮的'加载中'状态用法。</div>
            </div>
            <div><demo5 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>交互加载</h2>
                <div>演示点击按钮后进入加载中状态，1.5秒后恢复。</div>
            </div>
            <div><demo6 /></div>
        </div>
    );
} 
export default ButtonDemo;