import demo1 from "./demos/demo1.jsx";
import demo2 from "./demos/demo2.jsx";
import demo3 from "./demos/demo3.jsx";

const CheckboxDemo = () => {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>基本Checkbox</h2>
                <div>选中、默认选中、禁用、indeterminate样式</div>
            </div>
            <div><demo1 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>CheckboxGroup</h2>
                <div>选中、默认选中、禁用、外部受控</div>
            </div>
            <div><demo2 /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <h2>案例</h2>
                <div>区分全不选、部分选、全选的复选框案例</div>
            </div>
            <div><demo3 /></div>
        </div>
    )
}

export default CheckboxDemo;