import React, { useState } from 'react'
import { Tabs } from 'antd'
import { useAntdTable } from 'ahooks'
import FunctionDescriptionTab from '@/components/FunctionDescriptionTab'
import LLMFunctionDefinitionTab from '@/components/LLMFunctionDefinitionTab'
import FunctionExecutorTab from '@/components/FunctionExecutorTab'
import { TabFunctionState } from '@/types'

const FunctionGenerator: React.FC = () => {
  const [state, setState] = useState<TabFunctionState>({
    activeTab: 'description',
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
  })

  const handleTabChange = (key: string) => {
    setState(prev => ({ ...prev, activeTab: key }))
  }

  const handleFormDataChange = (formData: Partial<typeof state.formData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...formData },
    }))
  }

  const handleFunctionDefinitionChange = (value: string) => {
    setState(prev => ({ ...prev, functionDefinition: value }))
  }

  const handleRAGRequestChange = (value: string) => {
    setState(prev => ({ ...prev, ragRequest: value }))
  }

  const handleExecutorCodeChange = (value: string) => {
    setState(prev => ({ ...prev, executorCode: value }))
  }

  const tabItems = [
    {
      key: 'description',
      label: 'Function 描述',
      children: (
        <FunctionDescriptionTab
          formData={state.formData}
          onFormDataChange={handleFormDataChange}
          onGenerate={(data) => {
            // TODO: 调用生成API
            console.log('Generate function:', data)
          }}
        />
      ),
    },
    {
      key: 'definition',
      label: 'LLM Function定义',
      children: (
        <LLMFunctionDefinitionTab
          functionDefinition={state.functionDefinition}
          ragRequest={state.ragRequest}
          onFunctionDefinitionChange={handleFunctionDefinitionChange}
          onRAGRequestChange={handleRAGRequestChange}
          onGenerateRAG={() => {
            // TODO: 生成RAG请求
            console.log('Generate RAG request')
          }}
          onStoreRAG={() => {
            // TODO: 存储到RAG
            console.log('Store to RAG')
          }}
          onExport={(type) => {
            // TODO: 导出文件
            console.log('Export:', type)
          }}
        />
      ),
    },
    {
      key: 'executor',
      label: 'LLM Function Executor',
      children: (
        <FunctionExecutorTab
          executorCode={state.executorCode}
          onExecutorCodeChange={handleExecutorCodeChange}
          onExport={(format) => {
            // TODO: 导出执行器
            console.log('Export executor:', format)
          }}
        />
      ),
    },
  ]

  return (
    <Tabs
      activeKey={state.activeTab}
      onChange={handleTabChange}
      items={tabItems}
      size="large"
    />
  )
}

export default FunctionGenerator