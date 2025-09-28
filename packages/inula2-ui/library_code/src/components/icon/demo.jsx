import Icon from './index.jsx';
import demo1 from './demos/demo1.jsx';
import demo2 from './demos/demo2.jsx';
import demo3 from './demos/demo3.jsx';
import demo4 from './demos/demo4.jsx';
import demo5 from './demos/demo5.jsx';

function IconDemo() {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本Icon</h2>
                <div>支持实体、品牌图标，可改大小、颜色、旋转角度，支持旋转动画</div>
            </div>
            <div><demo1 /></div>
            <div><demo2 /></div>
            <div><demo3 /></div>
            <div><demo4 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>Icon表</h2>
                <div>点击复制value和theme</div>
            </div>
            <div><demo5 /></div>
        </div>
    );
}

export default IconDemo;