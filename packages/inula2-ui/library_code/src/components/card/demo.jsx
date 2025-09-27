import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx";
import demo4 from "./demos/demo4.jsx";
const CardDemo = () => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本样式</h2>
                <div>完整Card布局、边框样式、型号、hover效果</div>
            </div>
            <div><demo1 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>加载内容状态、嵌套Card样式</h2>
            </div>
            <div><demo2 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>CardMeta组件</h2>
                <div>可定义头像、标题和介绍</div>
            </div>
            <div><demo3 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>CardGrid组件</h2>
                <div>网格布局内容组件，支持悬停浮空</div>
            </div>
            <div><demo4 /></div>
         </div>
    )
}

export default CardDemo;