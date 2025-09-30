import './index.css';
import Tag, { CheckableTag } from './index.jsx';
import Icon from '../icon/index.jsx';
import demo1 from './demos/demo1.jsx'
import demo2 from './demos/demo2.jsx'
import demo3 from './demos/demo3.jsx'
import demo4 from './demos/demo4.jsx'
const Demo = () => {
    
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本</h2>
                <div>基本标签的用法，可以通过设置 closeIcon 变为可关闭标签并自定义关闭按钮，设置为 true 时将使用默认关闭按钮。可关闭标签具有 onClose 事件。</div>
            </div>
            <div><demo1 /></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>多彩标签</h2>
                <div>我们添加了多种预设色彩的标签样式，用作不同场景使用。如果预设值不能满足你的需求，可以设置为具体的色值。</div>
            </div>
            <div><demo2 /></div>

            {/* <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>动态添加和删除</h2>
                <div>用数组生成一组标签，可以动态添加和删除。</div>
            </div>
            <div><demo3 /></div> */}

             <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <h2>可选中标签</h2>
                 <div>可选中标签，第一个默认选中。</div>
             </div>
             <div><demo4 /></div>
        </div>
    );
};

export default Demo;


