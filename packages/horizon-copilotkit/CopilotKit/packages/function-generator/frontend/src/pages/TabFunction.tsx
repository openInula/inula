import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { FunctionOutlined, CodeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import Tab1FunctionDescription from '../components/Tab1FunctionDescription';
import Tab2FunctionDefinition from '../components/Tab2FunctionDefinition';
import Tab3FunctionExecutor from '../components/Tab3FunctionExecutor';
import { TabFunctionState } from '../types';

const TabFunction: React.FC = () => {
  const [state, setState] = useState<TabFunctionState>({
    activeTab: '1',
    functionDefinition: '',
    ragRequest: '',
    executorCode: '',
    formData: {
      functionName: '',
      playwrightScript: '',
      basicDescription: '',
      outputDescription: '',
      dependencies: [],
    },
  });

  const handleGenerated = (functionDefinition: string, executorCode: string, ragRequest: string) => {
    setState(prev => ({
      ...prev,
      functionDefinition,
      executorCode,
      ragRequest,
      activeTab: '2', // 自动切换到第二个tab
    }));
  };

  const handleFunctionDefinitionChange = (value: string) => {
    setState(prev => ({
      ...prev,
      functionDefinition: value,
    }));
  };

  const handleRagRequestChange = (value: string) => {
    setState(prev => ({
      ...prev,
      ragRequest: value,
    }));
  };

  const handleExecutorCodeChange = (value: string) => {
    setState(prev => ({
      ...prev,
      executorCode: value,
    }));
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <FunctionOutlined />
          Function 描述
        </span>
      ),
      children: (
        <Tab1FunctionDescription onGenerated={handleGenerated} />
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <CodeOutlined />
          LLM Function定义
        </span>
      ),
      children: (
        <Tab2FunctionDefinition
          functionDefinition={state.functionDefinition}
          ragRequest={state.ragRequest}
          onFunctionDefinitionChange={handleFunctionDefinitionChange}
          onRagRequestChange={handleRagRequestChange}
        />
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <PlayCircleOutlined />
          Function Executor
        </span>
      ),
      children: (
        <Tab3FunctionExecutor
          executorCode={state.executorCode}
          onExecutorCodeChange={handleExecutorCodeChange}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Tab-Function Generator"
      subTitle="基于 Playwright 脚本录制的智能化函数生成工具"
      extra={[]}
    >
      <Tabs
        activeKey={state.activeTab}
        onChange={(key) => setState(prev => ({ ...prev, activeTab: key }))}
        items={tabItems}
        size="large"
      />
    </PageContainer>
  );
};

export default TabFunction;