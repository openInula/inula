import React from 'react'
import { Button, Space, Row, Col, message } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'

interface LLMFunctionDefinitionTabProps {
  functionDefinition: string
  ragRequest: string
  onFunctionDefinitionChange: (value: string) => void
  onRAGRequestChange: (value: string) => void
  onGenerateRAG: () => void
  onStoreRAG: () => void
  onExport: (type: 'function' | 'rag') => void
}

const LLMFunctionDefinitionTab: React.FC<LLMFunctionDefinitionTabProps> = ({
  functionDefinition,
  ragRequest,
  onFunctionDefinitionChange,
  onRAGRequestChange,
  onGenerateRAG,
  onStoreRAG,
  onExport,
}) => {
  const defaultFunctionDefinition = `{
  name: "loginToSystem",
  description: "[Category: Authentication] 用户登录系统，验证用户凭据并创建会话",
  parameters: [
    {
      name: "username",
      description: "用户名",
      type: "string",
      required: true,
    },
    {
      name: "password", 
      description: "用户密码",
      type: "string",
      required: true,
    },
    {
      name: "rememberMe",
      description: "是否记住登录状态",
      type: "boolean",
      required: false,
    },
  ],
  handler: async (args) => {
    const { username, password, rememberMe = false } = args;
    
    // 执行Playwright脚本
    await page.goto('https://example.com/login');
    await page.fill('#username', username);
    await page.fill('#password', password);
    
    if (rememberMe) {
      await page.check('#remember-me');
    }
    
    await page.click('#login-button');
    await page.waitForSelector('.welcome-message');
    
    // 获取用户信息
    const userInfo = await page.evaluate(() => {
      return {
        id: document.querySelector('.user-id')?.textContent,
        name: document.querySelector('.user-name')?.textContent,
        sessionToken: localStorage.getItem('sessionToken'),
      };
    });
    
    return {
      success: true,
      message: \`用户 \${username} 登录成功\`,
      userInfo,
      sessionToken: userInfo.sessionToken,
    };
  },
}`

  const defaultRAGRequest = `{
  "functionName": "loginToSystem",
  "category": "Authentication",
  "description": "用户登录系统，验证用户凭据并创建会话",
  "inputParameters": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "description": "用户名"
    },
    {
      "name": "password",
      "type": "string", 
      "required": true,
      "description": "用户密码"
    },
    {
      "name": "rememberMe",
      "type": "boolean",
      "required": false,
      "description": "是否记住登录状态"
    }
  ],
  "outputFormat": {
    "success": "boolean",
    "message": "string",
    "userInfo": "object",
    "sessionToken": "string"
  },
  "dependencies": [],
  "tags": ["authentication", "login", "user", "session"],
  "version": "1.0.0",
  "createdAt": "${new Date().toISOString()}",
  "metadata": {
    "complexity": "medium",
    "executionTime": "2-5s",
    "reliability": "high"
  }
}`

  const handleGenerateRAG = () => {
    if (!functionDefinition.trim()) {
      message.warning('请先填写LLM Function定义')
      return
    }
    
    // 这里应该根据functionDefinition生成RAG请求
    onRAGRequestChange(defaultRAGRequest)
    onGenerateRAG()
    message.success('RAG Request已生成')
  }

  const handleStoreRAG = () => {
    if (!ragRequest.trim()) {
      message.warning('请先生成RAG Request')
      return
    }
    
    try {
      JSON.parse(ragRequest) // 验证JSON格式
      onStoreRAG()
      message.success('已成功存储到RAG数据库')
    } catch (error) {
      message.error('RAG Request格式不正确，请检查JSON语法')
    }
  }

  const handleExport = (type: 'function' | 'rag') => {
    const content = type === 'function' ? functionDefinition : ragRequest
    if (!content.trim()) {
      message.warning(`请先填写${type === 'function' ? 'LLM Function定义' : 'RAG Request'}`)
      return
    }
    
    onExport(type)
    message.success(`${type === 'function' ? 'Function定义' : 'RAG Request'}导出成功`)
  }

  return (
    <ProCard headerBordered>
      <ProCard 
        title="LLM Function定义" 
        size="small" 
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Button type="primary" onClick={handleGenerateRAG}>
              生成RAG Request
            </Button>
            <Button onClick={() => handleExport('function')}>
              导出Function定义
            </Button>
          </Space>
        }
      >
        <CodeMirror
          value={functionDefinition || defaultFunctionDefinition}
          height="400px"
          extensions={[javascript()]}
          theme={oneDark}
          onChange={(value) => onFunctionDefinitionChange(value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
          }}
        />
      </ProCard>
      
      <ProCard 
        title="RAG Request" 
        size="small"
        extra={
          <Space>
            <Button type="primary" onClick={handleStoreRAG}>
              入库RAG
            </Button>
            <Button onClick={() => handleExport('rag')}>
              导出RAG Request
            </Button>
          </Space>
        }
      >
        <CodeMirror
          value={ragRequest || defaultRAGRequest}
          height="300px"
          extensions={[json()]}
          theme={oneDark}
          onChange={(value) => onRAGRequestChange(value)}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
          }}
        />
      </ProCard>
    </ProCard>
  )
};

export default LLMFunctionDefinitionTab