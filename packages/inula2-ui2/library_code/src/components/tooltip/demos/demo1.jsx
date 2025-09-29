import Tooltip from '../index.jsx';
import Button from '../../button/index.jsx';

function Demo1() {
    return (
        <div style={{ display: 'flex', height:'90px', alignItems:'center' }}>
            <Tooltip title="提示文字">
                <Button type="primary">鼠标移入显示提示</Button>
            </Tooltip>
        </div>
    );
}

export default Demo1;