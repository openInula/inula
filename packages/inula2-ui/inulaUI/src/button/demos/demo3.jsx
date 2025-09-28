import { h, Fragment } from '@openinula/next';
import { Button } from 'inulaUI';

export default function ButtonDemo() {
    let loading = false;
    return (
        <div className="demo-dark-bg" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" ghost>主幽灵按钮</Button>
            <Button ghost>默认幽灵按钮</Button>
            <Button type="primary" danger ghost>危险幽灵按钮</Button>
        </div>
    );
}

