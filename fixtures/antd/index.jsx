import Horizon from 'horizon';
import 'antd/dist/antd.css';
import Table from './components/Table';
import Menu from './components/Menu';
import Menu2 from './components/Menu2';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

const onChange = key => {
  console.log(key);
};
const App = () => (
  <div style={{ padding: '12px' }}>
    <h1>Horizon ❌ antd</h1>
    <Tabs defaultActiveKey="Menu" onChange={onChange}>
      <TabPane tab="Table" key="Table">
        <Table />
      </TabPane>
      <TabPane tab="Menu" key="Menu">
        <div style={{ display: 'flex' }}>
          <Menu />
          <Menu2 />
        </div>
      </TabPane>
    </Tabs>
  </div>
);
Horizon.render(<App key={1} />, document.getElementById('app'));
