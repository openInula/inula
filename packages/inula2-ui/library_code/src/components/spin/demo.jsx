import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx"; 
import demo4 from "./demos/demo4.jsx";
import demo5 from "./demos/demo5.jsx";

const SpinDemo = () => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本样式</h2>
                <div>默认加载指示器，大中小型号</div>
            </div>
            <div><demo1 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>嵌套状态样式</h2>
                <div>包裹子组件且不为全屏状态情况，加载覆盖子组件、自定义tip</div>
            </div>
            <div><demo2 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>带delay延迟触发加载动画</h2>
            </div>
            <div><demo3 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>全屏覆盖加载动画</h2>
            </div>
            <div><demo4 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>永不停止的进度条加载</h2>
            </div>
            <div><demo5 /></div>
         </div>
    )
}

export default SpinDemo;