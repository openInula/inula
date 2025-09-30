import { text } from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo4() {
  return (
    <div style={{ display: 'flex' }}>
      <Button type="primary" onClick={() => text({ message: '右上角', description: 'placement: topRight', placement: 'topRight' })}>右上角(topRight)</Button>
      <Button type="primary" onClick={() => text({ message: '左上角', description: 'placement: topLeft', placement: 'topLeft' })} style={{ marginLeft: 8 }}>左上角(topLeft)</Button>
      <Button type="primary" onClick={() => text({ message: '右下角', description: 'placement: bottomRight', placement: 'bottomRight' })} style={{ marginLeft: 8 }}>右下角(bottomRight)</Button>
      <Button type="primary" onClick={() => text({ message: '左下角', description: 'placement: bottomLeft', placement: 'bottomLeft' })} style={{ marginLeft: 8 }}>左下角(bottomLeft)</Button>
      <Button type="primary" onClick={() => text({ message: '顶部中间', description: 'placement: top', placement: 'top' })} style={{ marginLeft: 8 }}>顶部中间(top)</Button>
      <Button type="primary" onClick={() => text({ message: '底部中间', description: 'placement: bottom', placement: 'bottom' })} style={{ marginLeft: 8 }}>底部中间(bottom)</Button>
    </div>
  );
}

export default Demo4; 