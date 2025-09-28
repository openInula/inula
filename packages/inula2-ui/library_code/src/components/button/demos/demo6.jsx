
import Button from '../index.jsx';

function ButtonDemo() {
  let loading = false;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <Button type="primary" loading={loading} onClick={() => {
        loading = true;
        setTimeout(() => loading = false, 1500);
        console.log(loading);
      }}>点击加载</Button>
    </div>
  );
} 
export default ButtonDemo;