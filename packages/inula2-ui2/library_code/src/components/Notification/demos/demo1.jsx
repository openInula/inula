import { info, success, warning, error } from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo1() {
  function show(type) {
    if (type === 'info') info({ message: '信息提示', bgColor: true, description: '这是一条普通的信息提示' });
    if (type === 'success') success({ message: '成功提示', description: '操作已成功完成' });
    if (type === 'warning') warning({ message: '警告提示', description: '请注意相关事项' });
    if (type === 'error') error({ message: '错误提示', description: '操作失败，请重试' });
    if (type === 'text') text({ message: '文本提示', bgColor: true, description: '这是一条普通的文本提示' });
  }
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => show('info')}>显示信息通知</Button>
      <Button type="primary" onClick={() => show('success')} style={{ marginLeft: 8 }}>显示成功通知</Button>
      <Button type="primary" onClick={() => show('warning')} style={{ marginLeft: 8 }}>显示警告通知</Button>
      <Button type="primary" danger onClick={() => show('error')} style={{ marginLeft: 8 }}>显示错误通知</Button>
    </div>
  );
}

export default Demo1; 