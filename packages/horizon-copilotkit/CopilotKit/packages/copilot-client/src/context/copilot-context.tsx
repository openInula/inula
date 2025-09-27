import React, { createContext, useContext, ReactNode } from "react";
import { CopilotRuntimeClient } from "../client";
import { FrontendAction, ScriptAction } from "../types/frontend-action";
import { CopilotChatSuggestionConfiguration } from "../types/chat-suggestion-configuration";
import { SystemMessageFunction } from "../types/system-message";
import { LangGraphInterruptAction } from "../hooks/use-langgraph-interrupt";
import { FrontendInterruptManager } from "../lib/frontend-interrupt-manager";

export interface CopilotReadable {
  categories?: string[];
  description: string;
  value: any;
  convert?: (value: any) => string;
}

export interface CopilotContextValue {
  // 核心客户端
  runtimeClient?: CopilotRuntimeClient;
  
  // 动作系统
  actions: FrontendAction[];
  setAction: (id: string, actionDef: FrontendAction) => void;
  removeAction: (id: string) => void;
  
  // 脚本动作系统
  scriptActions: ScriptAction[];
  setScriptAction: (id: string, scriptAction: ScriptAction) => void;
  removeScriptAction: (id: string) => void;
  executeScriptAction: (id: string, args?: any) => Promise<any>;
  
  // 可读上下文
  readables: Record<string, CopilotReadable>;
  setReadable: (id: string, readable: CopilotReadable) => void;
  removeReadable: (id: string) => void;
  
  // 聊天建议
  chatSuggestions: CopilotChatSuggestionConfiguration[];
  setChatSuggestion: (id: string, suggestion: CopilotChatSuggestionConfiguration) => void;
  removeChatSuggestion: (id: string) => void;
  
  // 系统消息
  systemMessage?: SystemMessageFunction;
  setSystemMessage: (systemMessage: SystemMessageFunction) => void;
  
  // 聊天指令
  chatInstructions?: string;
  
  // 转发参数
  forwardedParameters?: {
    temperature?: number;
    [key: string]: any;
  };
  
  // 状态管理
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  
  // 线程管理
  threadId?: string;
  setThreadId?: (threadId: string) => void;
  runId?: string | null;
  setRunId?: (runId: string | null) => void;
  
  // LangGraph 中断
  langGraphInterruptAction?: LangGraphInterruptAction;
  setLangGraphInterruptAction: (action: Partial<LangGraphInterruptAction>) => void;
  removeLangGraphInterruptAction: (actionId: string) => void;
  
  // 前端中断管理器
  frontendInterruptManager?: FrontendInterruptManager;
  
  // Agent 会话（LangGraph需要）
  agentSession?: any;
  
  // 辅助方法
  getContextString: (categories?: string[], defaultCategories?: string[]) => string;
}

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined);

export interface CopilotContextProviderProps {
  children: ReactNode;
  value: CopilotContextValue;
}

export function CopilotContextProvider({ children, value }: CopilotContextProviderProps) {
  return (
    <CopilotContext.Provider value={value}>
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilotContext(): CopilotContextValue {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error("useCopilotContext must be used within a CopilotKit provider");
  }
  return context;
}

// 便捷 Hook
export function useCopilotRuntimeClient() {
  const { runtimeClient } = useCopilotContext();
  if (!runtimeClient) {
    throw new Error("No runtime client found in CopilotKit context");
  }
  return runtimeClient;
}

export function useCopilotActions() {
  const { actions, setAction, removeAction } = useCopilotContext();
  return {
    actions,
    setAction,
    removeAction,
  };
}

export function useCopilotReadables() {
  const { readables, setReadable, removeReadable, getContextString } = useCopilotContext();
  return {
    readables,
    setReadable,
    removeReadable,
    getContextString,
  };
}

export function useCopilotChatSuggestions() {
  const { chatSuggestions, setChatSuggestion, removeChatSuggestion } = useCopilotContext();
  return {
    chatSuggestions,
    setChatSuggestion,
    removeChatSuggestion,
  };
}

// export function useCopilotDocumentPointers() {
//   const { documentPointers, setDocumentPointer, removeDocumentPointer } = useCopilotContext();
//   return {
//     documentPointers,
//     setDocumentPointer,
//     removeDocumentPointer,
//   };
// }

// export function useCopilotCoAgentStateRenders() {
//   const { coAgentStateRenders, setCoAgentStateRender, removeCoAgentStateRender, getCoAgentStateRender } = useCopilotContext();
//   return {
//     coAgentStateRenders,
//     setCoAgentStateRender,
//     removeCoAgentStateRender,
//     getCoAgentStateRender,
//   };
// }

export function useCopilotScriptActions() {
  const { scriptActions, setScriptAction, removeScriptAction, executeScriptAction } = useCopilotContext();
  return {
    scriptActions,
    setScriptAction,
    removeScriptAction,
    executeScriptAction,
  };
}

// 中断管理器Hook
export function useFrontendInterruptManager() {
  const { frontendInterruptManager } = useCopilotContext();
  return frontendInterruptManager;
}

