
import Input from '../index.jsx';

const Demo8 = () => {

    let value = "";

    function handleInput(e) {
        console.log("handleInput111", e.target.value);
        value = e.target.value;
    }
    return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
            />
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
                status="error"
            />
            <Input
                placeholder="请输入内容"
                value={value}
                onInput={handleInput}
                status="warning"
            />
        </div>
    );
}

export default Demo8;