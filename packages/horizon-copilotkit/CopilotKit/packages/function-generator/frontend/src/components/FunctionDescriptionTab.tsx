import React from 'react'
import { Button, message } from 'antd'
import { ProCard, ProForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-components'
import { TabFunctionState, GenerateFunctionRequest } from '@/types'

interface FunctionDescriptionTabProps {
  formData: TabFunctionState['formData']
  onFormDataChange: (data: Partial<TabFunctionState['formData']>) => void
  onGenerate: (data: GenerateFunctionRequest) => void
}

const FunctionDescriptionTab: React.FC<FunctionDescriptionTabProps> = ({
  formData,
  onFormDataChange,
  onGenerate,
}) => {
  const [form] = ProForm.useForm()

  const handleValuesChange = (changedValues: any, allValues: any) => {
    onFormDataChange(allValues)
  }

  const handleSubmit = async (values: any) => {
    try {
      const requestData: GenerateFunctionRequest = {
        functionName: values.functionName,
        playwrightScript: values.playwrightScript,
        description: values.basicDescription,
        outputDesc: values.outputDescription,
        dependencies: values.dependencies || [],
      }
      
      onGenerate(requestData)
      message.success('开始生成函数定义和执行器...')
    } catch (error) {
      message.error('生成失败，请检查输入信息')
    }
  }

  // 模拟可用的依赖函数列表
  const dependencyOptions = [
    { label: 'createUserSession', value: 'createUserSession' },
    { label: 'getUserPermissions', value: 'getUserPermissions' },
    { label: 'createProject', value: 'createProject' },
    { label: 'generateProjectReport', value: 'generateProjectReport' },
    { label: 'sendNotification', value: 'sendNotification' },
  ]

  return (
    <ProCard title="Tab-Function 描述" headerBordered>
      <ProForm
        form={form}
        layout="vertical"
        initialValues={formData}
        onValuesChange={handleValuesChange}
        onFinish={handleSubmit}
        submitter={{
          render: (props, doms) => {
            return (
              <Button 
                type="primary" 
                size="large" 
                onClick={() => props.form?.submit()}
                style={{ marginTop: 24 }}
              >
                生成LLM Function定义 & Executor
              </Button>
            )
          },
        }}
      >
        <ProFormText
          name="functionName"
          label="Function name"
          placeholder="请输入函数名称，如：loginToSystem"
          rules={[
            { required: true, message: '请输入函数名称' },
            { 
              pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, 
              message: '函数名称只能包含字母、数字和下划线，且以字母开头' 
            },
          ]}
          fieldProps={{
            size: 'large',
          }}
        />
        
        <ProFormTextArea
          name="playwrightScript"
          label="Playwright脚本"
          placeholder="请输入或粘贴 Playwright 录制的脚本，例如：
await page.goto('https://example.com/login');
await page.fill('#username', 'admin');
await page.fill('#password', 'password');
await page.click('#login-button');
await page.waitForSelector('.welcome-message');"
          fieldProps={{
            rows: 8,
            size: 'large',
          }}
          rules={[{ required: true, message: '请输入Playwright脚本' }]}
        />
        
        <ProFormTextArea
          name="basicDescription"
          label="基础功能描述"
          placeholder="请简要描述这个函数的功能，例如：这是一个用户登录功能，接收用户名和密码参数，执行登录操作"
          fieldProps={{
            rows: 3,
            size: 'large',
          }}
          rules={[{ required: true, message: '请输入基础功能描述' }]}
        />
        
        <ProFormTextArea
          name="outputDescription"
          label="输出描述"
          placeholder="请描述函数的返回值，例如：返回登录状态、用户ID和会话token，供后续操作使用"
          fieldProps={{
            rows: 3,
            size: 'large',
          }}
          rules={[{ required: true, message: '请输入输出描述' }]}
        />
        
        <ProFormSelect
          name="dependencies"
          label="依赖Function"
          placeholder="选择此函数依赖的其他函数（可多选）"
          mode="multiple"
          options={dependencyOptions}
          fieldProps={{
            size: 'large',
            allowClear: true,
          }}
        />
      </ProForm>
    </ProCard>
  )
}

export default FunctionDescriptionTab