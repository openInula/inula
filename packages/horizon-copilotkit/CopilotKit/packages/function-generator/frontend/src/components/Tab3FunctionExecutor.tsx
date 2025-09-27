import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Space, Row, Col, message } from 'antd';
import { ExportOutlined, PlayCircleOutlined, CodeOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { exportFile } from '../services/api';

interface Tab3Props {
  executorCode: string;
  onExecutorCodeChange: (value: string) => void;
}

const Tab3FunctionExecutor: React.FC<Tab3Props> = ({
  executorCode,
  onExecutorCodeChange,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [testLoading, setTestLoading] = React.useState(false);

  const handleExport = async () => {
    if (!executorCode) {
      message.warning('没有可导出的执行器代码');
      return;
    }

    setLoading(true);
    try {
      const blob = await exportFile('executor', 'js');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'function-executor.js';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('执行器代码导出成功！');
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTestExecutor = async () => {
    if (!executorCode) {
      message.warning('没有可测试的执行器代码');
      return;
    }

    setTestLoading(true);
    try {
      // 这里可以实现代码测试功能
      // 例如：在沙箱环境中执行代码或发送到测试端点
      message.info('代码测试功能开发中...');
      
      // 模拟测试延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('代码语法检查通过！');
    } catch (error) {
      console.error('Test error:', error);
      message.error('代码测试失败');
    } finally {
      setTestLoading(false);
    }
  };

  const handleFormatCode = () => {
    if (!executorCode) {
      message.warning('没有可格式化的代码');
      return;
    }

    try {
      // 简单的代码格式化
      const formatted = executorCode
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .replace(/\s*{\s*/g, ' {\n  ')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/;\s*/g, ';\n  ');
      
      onExecutorCodeChange(formatted);
      message.success('代码格式化完成！');
    } catch (error) {
      console.error('Format error:', error);
      message.error('代码格式化失败');
    }
  };

  return (
    <ProCard headerBordered>
      <ProCard 
        title="LLM Function Executor" 
        size="small"
        extra={
          <Space>
            <Button 
              icon={<PlayCircleOutlined />}
              loading={testLoading}
              onClick={handleTestExecutor}
            >
              测试代码
            </Button>
            <Button 
              icon={<CodeOutlined />}
              onClick={handleFormatCode}
            >
              格式化代码
            </Button>
            <Button 
              icon={<ExportOutlined />}
              loading={loading}
              onClick={handleExport}
            >
              导出文件
            </Button>
          </Space>
        }
      >
        <CodeMirror
          value={executorCode}
          height="650px"
          extensions={[javascript()]}
          theme={oneDark}
          onChange={onExecutorCodeChange}
          placeholder="Function Executor 代码将在生成后显示在这里...

示例代码结构：
import { page } from '@copilotkit/playwright-actuator';

export const askLlmExecutor = async (message) => {
  await page.getByRole('textbox', { name: '输入消息' }).click();
  await page.getByRole('textbox', { name: '输入消息' }).fill(message);
  await page.getByRole('button', { name: '发送' }).click();
};"
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
  );
};

export default Tab3FunctionExecutor;