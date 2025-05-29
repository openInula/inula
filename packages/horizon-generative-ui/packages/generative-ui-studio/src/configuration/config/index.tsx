'use client';
import type { FC } from 'react';
import React from 'react';
import { useContext } from 'use-context-selector';
import ConfigPrompt from './config-prompt/';
import ConfigData from './config-data';
import produce from 'immer';
import ConfigActions from './config-actions';
import ConfigContext from '@/context/debug-configuration';
import { ModelConfig, AgentConfig, PromptDSLAction } from '@/models/debug';
import ConfigQuery from './config-query';

const Config: FC = () => {
  const ctx = useContext(ConfigContext);
  const { promptConfig, setPromptConfig, setPrevPromptConfig } = ctx;
  
  const promptTemplate = promptConfig.promptTemplate || '';
  const promptDSLAction = promptConfig.uiActions;
  const promptUserData = promptConfig.userData;
  const promptQueries = promptConfig.promptQueries;

  const handlePromptChange = <K extends keyof AgentConfig>(key: K) => (newTemplate: AgentConfig[K]) => {
    const newModelConfig = produce(promptConfig, (draft: AgentConfig) => {
      draft[key] = newTemplate;
    });

    setPrevPromptConfig(promptConfig);
    setPromptConfig(newModelConfig);
  };


  return (
    <>
      <div className="relative h-0 grow overflow-y-auto px-6 pb-[50px]">
        {/* User Data */}
        <ConfigData
          title="数据"
          className="mt-2"
          promptTemplate={promptUserData}
          onChange={handlePromptChange('userData')}
        />

        <ConfigPrompt
          title="提示词"
          className="mt-2"
          promptTemplate={promptTemplate}
          onChange={handlePromptChange('promptTemplate')}
        />

        {/* Actions */}
        <ConfigActions
          promptActions={promptDSLAction}
          onPromptDSLActionsChange={handlePromptChange('uiActions')}
        />

        <ConfigQuery
          promptQueries={promptQueries}
          onPromptQueriesChange={handlePromptChange('promptQueries')}
        />
      </div>
    </>
  );
};
export default React.memo(Config);
