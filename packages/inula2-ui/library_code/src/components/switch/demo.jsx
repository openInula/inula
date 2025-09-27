import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx";

const SwitchDemo = () => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本</h2>
                <div>选中、默认选中、禁用开关</div>
            </div>
            <div><demo1 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>带内容</h2>
                <div>文本、组件</div>
            </div>
            <div><demo2 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>加载中开关</h2>
            </div>
            <div><demo3 /></div>
         </div>
    )
}

export default SwitchDemo;