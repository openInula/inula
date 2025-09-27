import { h, Fragment } from '@openinula/next';
import { Button } from 'inulaUI';

export default function ButtonDemo() {
    let loading = false;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <Button type="primary" loading>加载中主按钮</Button>
            <Button loading>加载中默认按钮</Button>
            <Button type="dashed" loading>加载中虚线按钮</Button>
            <Button type="text" loading>加载中文本按钮</Button>
            <Button type="link" loading>加载中链接按钮</Button>
        </div>
    );
} 