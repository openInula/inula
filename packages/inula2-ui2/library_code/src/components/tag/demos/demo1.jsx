import '../index.css';
import Tag from '../index.jsx';

const Demo1 = () => {
    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag>Tag1</Tag>
            <Tag><a
                href="https://docs.openinula.net/next/introduction"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit' }}
            >
                Link
            </a>
            </Tag>
            <Tag closable>
                Prevent Default
            </Tag>
        </div>
    );
};

export default Demo1;


