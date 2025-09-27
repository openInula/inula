import { h, Fragment } from '@openinula/next';
import { Button } from 'inulaUI';

export default function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" danger>危险主按钮</Button>
            <Button danger>危险默认按钮</Button>
            <Button type="dashed" danger>危险虚线按钮</Button>
            <Button type="text" danger>危险文本按钮</Button>
            <Button type="link" danger>危险链接按钮</Button>
        </div>
    );
} 