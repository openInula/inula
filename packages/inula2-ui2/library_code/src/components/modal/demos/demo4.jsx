import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo3() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title={<div style={{ color: '#1890ff' }}>自定义标题样式</div>}
                onClose={() => open = false}
                footer={
                    <Button onClick={() => open = false}>关闭</Button>
                }
            >
                <div>对话框内容。</div>
            </Modal>
        </div>
    );
}
export default Demo3;