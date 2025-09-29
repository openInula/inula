import Modal from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo3() {
    let open = false;

    const handleOk = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          open = false;
        } catch (error) {
          console.error('操作失败:', error);
        }
      };
    return (
        <div>
            <Button onClick={() => open = true}>Open Modal</Button>
            <Modal
                open={open}
                onClose={() => open = false}
                onBeforeClose={handleOk}
                title="异步关闭弹窗"
            >
                <div>内容</div>
            </Modal>
        </div>
    );
}
export default Demo3;