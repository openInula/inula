import Input from '../index.jsx';
import Tag from "../../tag/index.jsx"

const Demo7 = () => {
    return (
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>基础 textarea</Tag>
                <Input
                    type="textarea"
                    placeholder="这是一个普通的 textarea"
                />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>自动调整高度（布尔值）</Tag>
                <Input
                    type="textarea"
                    placeholder="输入文字，高度会自动调整"
                    autoSize={true}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
                <Tag color='geekblue'>自定义最小最大行数</Tag>
                <Input
                    type="textarea"
                    placeholder="最小2行，最大6行"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                />
            </div>

        </div>
    );
};

export default Demo7;
