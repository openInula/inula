import { text, info } from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo5() {
  function show(type) {
    if (type === 'text') text({ message: '不带bgColor', description: '这是一条普通的信息提示' });
    if (type === 'info') info({ message: '带bgColor', bgColor: true, description: '这是一条普通的文本提示' });
  }
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => show('text')}>不带bgColor</Button>
      <Button type="primary" onClick={() => show('info')} style={{ marginLeft: 8 }}>带bgColor</Button>
    </div>
  );
}

export default Demo5; 