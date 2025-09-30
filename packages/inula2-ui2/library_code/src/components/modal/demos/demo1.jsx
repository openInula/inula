import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo1() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                title="普通弹窗"
            >
                <div>这是一个最基础的弹出框内容。</div>
            </Modal>
        </div>
    );
}
export default Demo1;