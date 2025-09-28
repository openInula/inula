import { useState, useCallback } from 'react';
import { ScriptAction } from '../types/frontend-action';
import { useCopilotScriptActions } from "../context/copilot-context";

export interface DynamicActionConfig {
  ragEndpoint: string;
  enabled?: boolean;
  searchLimit?: number;
  confidenceThreshold?: number;
}

export interface RAGFunction {
  name: string;
  description: string;
  parameters?: Record<string, {
    type: string;
    description: string;
    required?: boolean;
  }>;
  implementation?: string;
  examples?: Array<{
    input: string;
    output: string;
    context?: string;
  }>;
}

export interface RAGSearchResult {
  function: RAGFunction;
  score: number;
}

export function useDynamicActions(config: DynamicActionConfig) {
  const { setScriptAction, removeScriptAction } = useCopilotScriptActions();
  const [dynamicActions, setDynamicActions] = useState<Record<string, ScriptAction>>({});
  const [isQuerying, setIsQuerying] = useState(false);

  const queryRelevantActions = useCallback(async (userQuery: string): Promise<ScriptAction[]> => {
    if (!config.enabled) return [];

    setIsQuerying(true);
    try {
      const response = await fetch(`${config.ragEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userQuery,
          limit: config.searchLimit || 5,
          include_scores: true
        })
      });

      if (!response.ok) {
        throw new Error(`RAG查询失败: ${response.status}`);
      }

      const results = await response.json();
      const relevantActions = results.results
        ?.filter((result: RAGSearchResult) =>
          result.score >= (config.confidenceThreshold || 0.7)
        )
        .map((result: RAGSearchResult) => convertToScriptAction(result.function))
        || [];

      return relevantActions;
    } catch (error) {
      console.warn('⚠️ RAG查询ScriptActions失败:', error);
      return [];
    } finally {
      setIsQuerying(false);
    }
  }, [config]);

  const registerDynamicActions = useCallback((actions: ScriptAction[], queryKey?: string) => {
    // Remove previously registered dynamic actions
    Object.keys(dynamicActions).forEach(id => {
      removeScriptAction(id);
    });

    // Register new dynamic actions
    const newDynamicActions: Record<string, ScriptAction> = {};
    actions.forEach((action, index) => {
      const id = `dynamic-${action.name}-${queryKey || Date.now()}-${index}`;
      setScriptAction(id, action);
      newDynamicActions[id] = action;
    });

    setDynamicActions(newDynamicActions);
    console.log(`📝 注册了 ${actions.length} 个动态ScriptActions`);
  }, [dynamicActions, setScriptAction, removeScriptAction]);

  const queryAndRegister = useCallback(async (userQuery: string) => {
    const actions = await queryRelevantActions(userQuery);
    if (actions.length > 0) {
      registerDynamicActions(actions, userQuery);
    }
    return actions;
  }, [queryRelevantActions, registerDynamicActions]);

  return {
    queryRelevantActions,
    registerDynamicActions,
    queryAndRegister,
    dynamicActions: Object.values(dynamicActions),
    isQuerying,
  };
}

function convertToScriptAction(ragFunction: RAGFunction): ScriptAction {
  return {
    name: ragFunction.name,
    description: ragFunction.description,
    executeOnClient: true,
  };
}