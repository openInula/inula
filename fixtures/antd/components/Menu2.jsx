import Horizon, { useState } from 'horizon';
import {
  AppstoreOutlined,
  ContainerOutlined,
  MenuFoldOutlined,
  PieChartOutlined,
  DesktopOutlined,
  MailOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Menu } from 'antd';

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
  getItem('选项1', '1', <PieChartOutlined />),
  getItem('选项2', '2', <DesktopOutlined />),
  getItem('选项3', '3', <ContainerOutlined />),
  getItem('分组1', 'sub1', <MailOutlined />, [
    getItem('选项5', '5'),
    getItem('选项6', '6'),
    getItem('选项7', '7'),
    getItem('选项8', '8'),
  ]),
  getItem('分组2', 'sub2', <AppstoreOutlined />, [
    getItem('选项9', '9'),
    getItem('选项10', '10'),
    getItem('分组2-1', 'sub3', null, [getItem('选项11', '11'), getItem('选项12', '12')]),
  ]),
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: 256,
        marginLeft: 32,
      }}
    >
      <Button
        type="primary"
        onClick={() => {
          setCollapsed(!collapsed);
        }}
        style={{
          marginBottom: 16,
        }}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
      <Menu
        mode="inline"
        theme="dark"
        defaultSelectedKeys={['2']}
        defaultOpenKeys={['sub2']}
        inlineCollapsed={collapsed}
        items={items}
      />
    </div>
  );
};

export default App;
