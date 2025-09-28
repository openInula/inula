import React from 'react';
import { ProCard } from '@ant-design/pro-components';
import { Button, Space, Row, Col, message } from 'antd';
import { ExportOutlined, DatabaseOutlined, PlayCircleOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { storeToRAG, exportFile } from '../services/api';

interface Tab2Props {
  functionDefinition: string;
  ragRequest: string;
  onFunctionDefinitionChange: (value: string) => void;
  onRagRequestChange: (value: string) => void;
}

const Tab2FunctionDefinition: React.FC<Tab2Props> = ({
  functionDefinition,
  ragRequest,
  onFunctionDefinitionChange,
  onRagRequestChange,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [ragLoading, setRagLoading] = React.useState(false);

  const handleGenerateRAG = () => {
    try {
      if (!functionDefinition) {
        message.warning('请先生成Function定义');
        return;
      }

      const ragData = {
        functionDefinition: functionDefinition,
        metadata: {
          category: "DataFlow",
          generatedAt: new Date().toISOString(),
          version: "1.0.0"
        }
      };

      onRagRequestChange(JSON.stringify(ragData, null, 2));
      message.success('RAG Request 生成成功！');
    } catch (error) {
      console.error('Generate RAG error:', error);
      message.error('生成RAG Request失败');
    }
  };

  const handleStoreToRAG = async () => {
    if (!ragRequest) {
      message.warning('请先生成RAG Request');
      return;
    }

    setRagLoading(true);
    try {
      const ragData = JSON.parse(ragRequest);
      const response = await storeToRAG(ragData);
      
      if (response.success) {
        message.success('成功存储到RAG数据库！');
      } else {
        message.error('存储到RAG失败');
      }
    } catch (error) {
      console.error('Store to RAG error:', error);
      message.error('存储到RAG失败，请检查数据格式');
    } finally {
      setRagLoading(false);
    }
  };

  const handleExport = async () => {
    if (!functionDefinition) {
      message.warning('没有可导出的内容');
      return;
    }

    setLoading(true);
    try {
      const blob = await exportFile('function', 'js');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'function-definition.js';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('文件导出成功！');
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProCard headerBordered>
      <Row gutter={16}>
        <Col span={24}>
          <ProCard 
            title="LLM Function定义" 
            size="small"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleGenerateRAG}
                >
                  生成RAG Request
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
              value={functionDefinition}
              height="350px"
              extensions={[javascript()]}
              theme={oneDark}
              onChange={onFunctionDefinitionChange}
              placeholder="LLM Function定义将在生成后显示在这里..."
            />
          </ProCard>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <ProCard 
            title="RAG Request" 
            size="small"
            extra={
              <Space>
                <Button 
                  type="primary" 
                  icon={<DatabaseOutlined />}
                  loading={ragLoading}
                  onClick={handleStoreToRAG}
                >
                  入库RAG
                </Button>
              </Space>
            }
          >
            <CodeMirror
              value={ragRequest}
              height="200px"
              extensions={[json()]}
              theme={oneDark}
              onChange={onRagRequestChange}
              placeholder="RAG Request JSON将在生成后显示在这里..."
            />
          </ProCard>
        </Col>
      </Row>
    </ProCard>
  );
};

export default Tab2FunctionDefinition;