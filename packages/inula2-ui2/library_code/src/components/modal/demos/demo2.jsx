import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo2() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title={<div style={{ color: '#1890ff' }}>自定义标题样式</div>}
                onClose={() => open = false}
            >
                <div>对话框内容。</div>
            </Modal>
        </div>
    );
}
export default Demo2;