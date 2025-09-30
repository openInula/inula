import Tooltip from '../index.jsx';
import Button from '../../button/index.jsx';
import '../index.css';

function Demo() {
  return (
    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', height:'90px', alignItems:'center' }}>
      <div style={{ display: 'flex' }}>
        <Tooltip title="hover" trigger="hover">
          <Button type="primary">hover</Button>
        </Tooltip>
      </div>
      <div style={{ display: 'flex' }}>
        <Tooltip title="click" trigger="click">
          <Button type="primary">click</Button>
        </Tooltip>
      </div>
      {/* <div style={{ display: 'flex' }}>
        <Tooltip title="focus" trigger="focus">
          <input placeholder="focus" style={{ padding: '4px 8px' }} />
        </Tooltip>
      </div> */}
    </div>
  );
}
export default Demo;