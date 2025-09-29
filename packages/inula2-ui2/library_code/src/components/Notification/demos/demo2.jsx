import { text } from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo2() {
  function showCustomClose() {
    text({
      message: '自定义关闭按钮',
      description: '关闭按钮变成了"关闭"并加粗变色',
      closeText: '关闭',
      closeClassName: 'my-close-btn',
    });
  }
  return (
    <div style={{ display: 'flex' }}>
        <Button type="primary" onClick={showCustomClose}>自定义关闭按钮</Button>
    </div>
  );
}

export default Demo2; 