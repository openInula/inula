import { ModelConfig, AgentConfig, PromptVariable } from '@/models/debug';
import Config from './config';
import { PreviewWrapper as Preview } from './preview';
import { useState } from 'react';
import { dslSystemPrompt } from 'generative-ui-core';
import ConfigContext from '@/context/debug-configuration';
import { Outlet, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAgent, useUpdateAgent } from '@/service/agents';
import Loading from '@/components/base/loading';
import Publisher from './config/publisher';
import { RiDashboard2Line, RiRunFill, RiRunLine } from '@remixicon/react';
import Button from '@/components/base/button';
import { Runtime } from './preview/runtime';

interface ConfigurationProps {
  agent: AgentConfig;
}

function Configuration({ agent }: ConfigurationProps) {
  const [prevPromptConfig, setPrevPromptConfig] = useState<AgentConfig>(agent);
  const { id: agentId } = useParams();
  const [searchParams] = useSearchParams();
  const inSidebar = searchParams.get('inSidebar');

  const [agentConfig, setAgentConfig] = useState<AgentConfig>(agent);
  const publishMutation = useUpdateAgent(agent.id);

  const handlePublish = () => {
    publishMutation.mutate(agentConfig);
  };
  const navigate = useNavigate();

  if (inSidebar) {
    return (
      <ConfigContext.Provider
        value={{
          promptConfig: agentConfig,
          setPromptConfig: setAgentConfig,
          setPrevPromptConfig,
        }}
      >
        <Runtime />
      </ConfigContext.Provider>
    );
  }

  return (
    <ConfigContext.Provider
      value={{
        promptConfig: agentConfig,
        setPromptConfig: setAgentConfig,
        setPrevPromptConfig,
      }}
    >
      <div className="relative flex  grow pt-14 bg-components-panel-bg h-full">
        {/* Header */}
        <div className="bg-default-subtle absolute left-0 top-0 h-14 w-full">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center">
              <div className="system-xl-semibold text-text-primary">编排</div>
              <div className="flex h-[14px] items-center space-x-1 text-xs"></div>
            </div>
            <div className="flex items-center">
              <Button
                variant="secondary"
                className="p-2 px-4 mr-2"
                onClick={() => {
                  const currentPath = window.location.pathname;
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set('inSidebar', 'true');
                  navigate({
                    pathname: currentPath,
                    search: `?${searchParams.toString()}`,
                  });
                }}
              >
                <RiRunLine className="mr-2 h-4 w-4" />
                预览运行
              </Button>
              <Button
                variant="secondary"
                className="p-2 px-4 mr-2"
                onClick={() => {
                  navigate({ pathname: '/debugging/execution', search: `?agentId=${agentId}` });
                }}
              >
                <RiDashboard2Line className="mr-2 h-4 w-4" />
                评测
              </Button>
              <Publisher onPublish={handlePublish} />
            </div>
          </div>
        </div>
        <div className={`flex h-full w-full shrink-0 flex-col sm:w-1/2`}>
          <Config />
        </div>
        <div
          className="relative flex h-full w-1/2 grow flex-col overflow-y-auto "
          style={{ borderColor: 'rgba(0, 0, 0, 0.02)' }}
        >
          <div className="flex grow flex-col rounded-tl-2xl border-l-[0.5px] border-t-[0.5px] border-components-panel-border bg-chatbot-bg ">
            <Preview />
          </div>
        </div>
      </div>
    </ConfigContext.Provider>
  );
}

function DataWrapper() {
  const { isSuccess, data: agent } = useCurrentAgent();

  // 先获取数据
  if (!isSuccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading type="area" />
      </div>
    );
  }

  // 只在数据加载成功后渲染子组件，并传递数据
  return <Configuration agent={agent} key={agent.id} />;
}

export function ConfigLayout({ children }) {
  return (
    <div className="relative flex overflow-hidden h-full">
      <div className="grow overflow-hidden bg-components-panel-bg h-full">
        <Outlet />
      </div>
    </div>
  );
}
export function useCurrentAgent() {
  const { id } = useParams();

  return useAgent(Number(id!));
}
export default DataWrapper;
