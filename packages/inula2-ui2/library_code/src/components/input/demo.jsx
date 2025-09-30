// import Button from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';
import demo6 from './demos/demo6.jsx';
import demo7 from './demos/demo7.jsx';
import demo8 from './demos/demo8.jsx';
import demo9 from './demos/demo9.jsx';

function InputDemo() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>基础输入框</h2>
                    <div>演示基础输入框的用法。</div>
                </div>
                <div><demo1 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>不同形态</h2>
                    <div>演示不同形态的输入框。</div>
                </div>
                <div><demo3 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>前后缀</h2>
                    <div>演示带前后缀的输入框。</div>
                </div>
                <div><demo4 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>密码框</h2>
                    <div></div>
                </div>
                <div><demo9 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>清除按钮</h2>
                    <div>演示带清除按钮的输入框。</div>
                </div>
                <div><demo6 /></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>Textarea 自动调整高度</h2>
                    <div>演示 textarea 的自动调整高度功能。</div>
                </div>
                <div><demo7 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>不同尺寸</h2>
                    <div></div>
                </div>
                <div><demo2 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>字数统计</h2>
                    <div>演示带字数统计的输入框。</div>
                </div>
                <div><demo5 /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <h2>状态</h2>
                    <div></div>
                </div>
                <div><demo8 /></div>
            </div>

        </div>
    );
}

export default InputDemo;
