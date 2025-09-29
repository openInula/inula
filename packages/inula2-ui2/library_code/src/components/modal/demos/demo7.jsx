import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo7() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                title="全屏弹窗"
                fullscreen={true}
            >
                <div>这是全屏弹窗内容</div>
            </Modal>
        </div>
    );
}
export default Demo7;