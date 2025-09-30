import { text } from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo3() {
  function showCustomActions() {
    text({
      message: 'Notification Title',
      description: 'A function will be called after the notification is closed...',
      actions: ({ notification, remove, onClose }) => (
        <>
          <Button type="link" size="small" onClick={() => remove(notification.key)}>Destroy All</Button>
          <Button type="primary" size="small" onClick={onClose} style={{ marginLeft: 8 }}>Confirm</Button>
        </>
      )
    });
  }
  return (
    <div style={{ display: 'flex' }}>
        <Button type="primary" onClick={showCustomActions}>自定义操作按钮</Button>
    </div>
  );
}

export default Demo3; 