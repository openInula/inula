import React, { useState } from 'react';
import { useAgents, useCreateAgent, useDeleteAgent, type CreateAgentDto } from '@/service/agents';
import { Button, Modal, Form, Input, Spin, message, Typography, Card, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppCard from './app-card';
import NewAppCard from './NewAppCard';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AgentsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<CreateAgentDto>();

  // 获取 agents 列表
  const { data: agents, isLoading, error } = useAgents();

  // 创建 agent
  const createAgentMutation = useCreateAgent();

  // 删除 agent
  const deleteAgentMutation = useDeleteAgent();

  // 处理创建 agent
  const handleCreateAgent = async (values: CreateAgentDto) => {
    try {
      const agent = await createAgentMutation.mutateAsync(values);
      message.success('Agent 创建成功');
      setIsModalOpen(false);
      form.resetFields();
      navigate(`/app/${agent.id}/config`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建失败';
      message.error(`Agent 创建失败: ${errorMessage}`);
    }
  };

  // 处理删除 agent
  const handleDeleteAgent = async (id: number) => {
    try {
      await deleteAgentMutation.mutateAsync(id);
      message.success('Agent 删除成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '删除失败';
      message.error(`Agent 删除失败: ${errorMessage}`);
    }
  };

  // 跳转到详情页面
  const handleViewAgent = (id: number) => {
    navigate(`/app/${id}/config`);
  };

  // 如果正在加载
  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}
      >
        <Spin size="large" tip="正在加载 Agents..." />
      </div>
    );
  }

  // 如果有错误
  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Title level={4} type="danger">
            加载失败
          </Title>
          <Paragraph type="secondary">
            {error instanceof Error ? error.message : '无法加载 Agents 列表'}
          </Paragraph>
          <Button type="primary" onClick={() => window.location.reload()}>
            重试
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="m-6 border-t-1-gray-100">
      <div className="mb-6">
        <div className="text-text-tertiary font-bold text-lg">Agent 管理</div>
      </div>
      <Row gutter={[25, 24]}>
        <div style={{ flex: '0 0 20%', padding: '0 12.5px' }}>
          <NewAppCard onCreate={() => setIsModalOpen(true)} />
        </div>
        {/* Agents 網格布局 */}
        {agents && agents.length > 0
          ? agents.map((agent) => (
              <div key={agent.id} style={{ flex: '0 0 20%', padding: '0 12.5px' }}>
                <AppCard
                  key={agent.id}
                  app={agent}
                  canCreate
                  onClick={handleViewAgent}
                  onDelete={handleDeleteAgent}
                />
              </div>
            ))
          : null}
      </Row>

      {/* 创建 Agent 模态框 */}
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={1300}>
        <div className="flex ">
          <div className="p-4 mr-4">
            <h3 className="mb-16">创建空白应用</h3>
            <Form
              className=" w-[400px]"
              form={form}
              layout="vertical"
              onFinish={handleCreateAgent}
              initialValues={{
                name: '',
                promptTemplate: '',
                userData: '',
                promptQueries: '',
              }}
            >
              <Form.Item
                name="name"
                label="Agent 名称"
                rules={[{ required: true, message: '请输入 Agent 名称' }]}
              >
                <Input placeholder="给你的应用起个名称" />
              </Form.Item>

              <Form.Item name="promptQueries" label="描述(可选)">
                <TextArea rows={4} placeholder="可选：输入常见问题列表" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button onClick={() => setIsModalOpen(false)}>取消</Button>
                  <Button type="primary" htmlType="submit" loading={createAgentMutation.isPending}>
                    创建
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>

          <div className="relative flex h-full flex-1 shrink justify-start overflow-hidden">
            <div className="absolute left-0 right-0 top-0 h-6 border-b border-b-divider-subtle 2xl:h-[139px]"></div>
            <div className="max-w-[760px] border-x border-x-divider-subtle">
              <div className="h-6 2xl:h-[24px]" />
              <AppPreview />
              <div className="absolute left-0 right-0 border-b border-b-divider-subtle"></div>
              <div
                className="flex h-[448px] w-[740px] items-center justify-center mb-[50px]"
                style={{
                  background:
                    'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(16,24,40,0.04) 4px,transparent 3px, transparent 6px)',
                }}
              >
                <AppScreenShot />
              </div>
              <div className="absolute left-0 right-0 border-b border-b-divider-subtle"></div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function AppPreview() {
  return (
    <div className="px-8 py-4">
      <h4 className="system-sm-semibold-uppercase text-text-secondary">意图UI</h4>
      <div className="system-xs-regular mt-1 min-h-8 max-w-96 text-text-tertiary">
        <span>通过简单的配置快速搭建一个基于 LLM 的意图UI机器人。</span>
      </div>
    </div>
  );
}

function AppScreenShot() {
  return <img src={`/screenshots.png`} alt="App Screen Shot" className="w-[1000px]" />;
}

export default AgentsDashboard;
