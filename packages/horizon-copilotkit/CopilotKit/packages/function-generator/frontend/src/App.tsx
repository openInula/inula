import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import TabFunction from './pages/TabFunction';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        <TabFunction />
      </div>
    </ConfigProvider>
  );
};

export default App;