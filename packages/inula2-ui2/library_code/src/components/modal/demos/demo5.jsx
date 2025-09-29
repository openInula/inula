import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo3() {
    let open = false;

    return (
        <div>
            <Button onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title="居中弹窗"
                onClose={() => open = false}
                centered={true}
            >
                <div>对话框内容。</div>
            </Modal>
        </div>
    );
}
export default Demo3;