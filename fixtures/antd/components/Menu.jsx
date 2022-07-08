import Horizon from 'horizon';
import { AppstoreOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const items = [
  getItem('sub2', 'sub2', <AppstoreOutlined />, [getItem('sub3', 'sub3', null, [getItem('sub4', 'sub4')])]),
];

const App = () => {
  const onClick = e => {
    console.log('click ', e);
  };

  return (
    <Menu
      onClick={onClick}
      style={{
        width: 256,
      }}
      defaultSelectedKeys={['sub2']}
      defaultOpenKeys={['sub2', 'sub3']}
      mode="inline"
      items={items}
    />
  );
};

export default App;
