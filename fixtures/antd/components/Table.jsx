import Horizon from 'horizon';
import { Table } from 'antd';
const columns = [
  {
    title: 'Full Name',
    width: 100,
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
  },
  {
    title: 'Lang',
    width: 100,
    dataIndex: 'lang',
    key: 'age',
    fixed: 'left',
  },
  {
    title: 'COL1',
    dataIndex: 'description',
    key: '1',
    width: 220,
  },
  {
    title: 'COL2',
    dataIndex: 'description',
    key: '2',
    width: 220,
  },
  {
    title: 'COL3',
    dataIndex: 'description',
    key: '3',
    width: 220,
  },
  {
    title: 'COL4',
    dataIndex: 'description',
    key: '4',
    width: 220,
  },
  {
    title: 'COL5',
    dataIndex: 'description',
    key: '5',
    width: 220,
  },
  {
    title: 'COL6',
    dataIndex: 'description',
    key: '6',
    width: 220,
  },
  {
    title: 'COL7',
    dataIndex: 'description',
    key: '7',
    width: 220,
  },
  {
    title: 'COL8',
    dataIndex: 'description',
    key: '8',
  },
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: () => <a>action</a>,
  },
];
const data = [];

for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Horizon ${i}`,
    lang: 'js',
    description: `Javascript Framework no. ${i}`,
  });
}

const App = () => (
  <div style={{ width: '1200px' }}>
    <Table
      columns={columns}
      dataSource={data}
      scroll={{
        x: 2200,
        y: 300,
      }}
    />
  </div>
);

export default App;
