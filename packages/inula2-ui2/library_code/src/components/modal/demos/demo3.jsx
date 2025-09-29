import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo3() {
    let open = false;

    return (
        <div>
            <Button type="primary" onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                title="自定义页脚"
                onClose={() => open = false}
            >
                <div style={{ textAlign: 'center' }}>
                    <h3>这是一个自定义内容</h3>
                    <p>可以放置任何内容</p>
                    <img src="https://placekitten.com/300/200" alt="示例图片" />
                </div>
            </Modal>
        </div>
    );
}
export default Demo3;