import Radio from '../index.jsx';

function Demo4() {
  return (
    <div style={{ display: 'flex' }}>
      <Radio label="禁用A" value="a" checked={false} disabled />
      <Radio label="禁用B" value="b" checked={true} disabled />
    </div>
  );
}
export default Demo4; 