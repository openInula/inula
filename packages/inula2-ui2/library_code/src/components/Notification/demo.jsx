// import Button from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';

function NotificationDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>基础通知</h2>
                <div>演示信息、成功、警告、错误四种类型的通知用法。</div>
            </div>
            <div><demo1 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>自定义关闭按钮</h2>
                <div>演示如何自定义通知的关闭按钮文本和样式。</div>
            </div>
            <div><demo2 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>自定义操作按钮</h2>
                <div>演示如何为通知添加自定义操作按钮。</div>
            </div>
            <div><demo3 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>弹出位置</h2>
                <div>演示通知在不同屏幕位置的弹出效果。</div>
            </div>
            <div><demo4 /></div>

            <div style={{ display: 'flex',alignItems:'center', gap: 16 }}>
                <h2>选择背景颜色</h2>
                <div>可以传入bgColor显示不同的背景颜色</div>
            </div>
            <div><demo5 /></div>

            
        </div>
    );
} 
export default NotificationDemo;