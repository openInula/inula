import '../index.css';
import Tag, { CheckableTag } from '../index.jsx';

const Demo2 = () => {
    const colors = ['magenta', 'red', 'volcano', 'orange', 'gold', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <div>Presets</div>
                {colors.map(c => <Tag key={c} color={c}>{c}</Tag>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
                <div>Custom</div>
                <Tag color="#2db7f5">#2db7f5</Tag>
                <Tag color="#87d068">#87d068</Tag>
            </div>
        </div>
    );
};

export default Demo2;


