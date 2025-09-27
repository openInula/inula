import { h, Fragment } from '@openinula/next';
import { Button } from 'inulaUI';

export default function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" disabled>禁用主按钮</Button>
            <Button disabled>禁用默认按钮</Button>
            <Button type="dashed" disabled>禁用虚线按钮</Button>
            <Button type="text" disabled>禁用文本按钮</Button>
            <Button type="link" disabled>禁用链接按钮</Button>
        </div>
    );
} 