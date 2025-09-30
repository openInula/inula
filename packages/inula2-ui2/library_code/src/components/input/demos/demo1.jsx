import Input from "../index.jsx";
import Tag from "../../tag/index.jsx"

function Demo1() {
    let value = "";

    function handleInput(e) {
        value = e.target.value;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">非受控组件</Tag>
                <Input value={value} onInput={handleInput} placeholder="请输入内容" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">受控组件</Tag>
                <Input value={value} onInput={handleInput} placeholder="请输入内容" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">不带默认值</Tag>
                <Input placeholder="请输入内容"/>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color="geekblue">带默认值</Tag>
                <Input defaultValue="这是一个输入框" placeholder="请输入内容" />
            </div>
        </div>
    );
}

export default Demo1;
