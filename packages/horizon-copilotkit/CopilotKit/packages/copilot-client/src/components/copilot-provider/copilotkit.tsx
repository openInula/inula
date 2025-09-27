import React, { ReactNode, useMemo, useState, useCallback, useEffect } from "react";
import { randomId } from "../../../../shared/src/utils/random-id";
import { CopilotContextProvider, CopilotContextValue, CopilotReadable } from "../../context/copilot-context";
import { MessagesContextProvider, MessagesContextValue } from "../../context/messages-context";
import { createCopilotRuntimeClient } from "../../client";
import { FrontendAction, ScriptAction } from "../../types/frontend-action";
import { CopilotChatSuggestionConfiguration } from "../../types/chat-suggestion-configuration";
import { SystemMessageFunction } from "../../types/system-message";
import { 
  Message, 
  TextMessage, 
  ActionExecutionMessage,
  ResultMessage, 
  AgentStateMessage 
} from "../../client";
import { shouldShowDevConsole } from "../../utils";
import { ToastProvider } from "../toast/toast-provider";
import { CopilotErrorBoundary } from "../error-boundary/error-boundary";
import { FrontendInterruptManager } from "../../lib/frontend-interrupt-manager";

export interface CopilotKitProps {
  /**
   *  Your Copilot Cloud API key. Don't have it yet? Go to https://cloud.copilotkit.ai and get one for free.
   */
  publicApiKey?: string;

  /**
   * The endpoint for the Copilot Runtime instance. [Click here for more information](/concepts/copilot-runtime).
   */
  runtimeUrl?: string;

  /**
   * Additional headers to be sent with the request.
   *
   * For example:
   * ```json
   * {
   *   "Authorization": "Bearer X"
   * }
   * ```
   */
  headers?: Record<string, string>;

  /**
   * The children to be rendered within the CopilotKit.
   */
  children: ReactNode;

  /**
   * Custom properties to be sent with the request
   * For example:
   * ```js
   * {
   *   'user_id': 'users_id',
   * }
   * ```
   */
  properties?: Record<string, any>;

  /**
   * Indicates whether the user agent should send or receive cookies from the other domain
   * in the case of cross-origin requests.
   */
  credentials?: RequestCredentials;

  /**
   * Whether to show the dev console.
   *
   * If set to "auto", the dev console will be show on localhost only.
   */
  showDevConsole?: boolean | "auto";

  /**
   * The name of the agent to use.
   */
  agent?: string;

  /**
   * The forwarded parameters to use for the task.
   */
  forwardedParameters?: {
    temperature?: number;
  };

  /**
   * The thread id to use for the CopilotKit.
   */
  threadId?: string;
}

export function CopilotKit({
  children,
  publicApiKey,
  runtimeUrl,
  headers,
  properties,
  credentials,
  showDevConsole = "auto",
  agent,
  forwardedParameters,
  threadId: initialThreadId,
}: CopilotKitProps) {
  // 默认 runtimeUrl 如果未提供
  const defaultRuntimeUrl = useMemo(() => 
    runtimeUrl || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/api/copilotkit` : ''),
    [runtimeUrl]
  );

  // 缓存运行时客户端配置对象
  const runtimeClientConfig = useMemo(() => ({
    url: defaultRuntimeUrl,
    publicApiKey,
    headers,
    credentials,
    properties,
  }), [defaultRuntimeUrl, publicApiKey, headers, credentials, properties]);

  // 运行时客户端
  const runtimeClient = useMemo(() => {
    return createCopilotRuntimeClient(runtimeClientConfig);
  }, [runtimeClientConfig]);

  // 核心状态管理
  const [actions, setActionsState] = useState<Record<string, FrontendAction>>({});
  const [scriptActions, setScriptActionsState] = useState<Record<string, ScriptAction>>({});
  const [readables, setReadablesState] = useState<Record<string, CopilotReadable>>({});
  const [chatSuggestions, setChatSuggestionsState] = useState<Record<string, CopilotChatSuggestionConfiguration>>({});

  // 消息相关状态
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>(initialThreadId || randomId());
  
  // 前端中断管理器
  const frontendInterruptManager = useMemo(() => new FrontendInterruptManager(), []);

  // 动作管理
  const setAction = useCallback((id: string, actionDef: FrontendAction) => {
    setActionsState(prev => ({ ...prev, [id]: actionDef }));
  }, []);

  const removeAction = useCallback((id: string) => {
    setActionsState(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // 脚本动作管理
  const setScriptAction = useCallback((id: string, scriptAction: ScriptAction) => {
    setScriptActionsState(prev => ({ ...prev, [id]: scriptAction }));
  }, []);

  const removeScriptAction = useCallback((id: string) => {
    setScriptActionsState(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const executeScriptAction = useCallback(async (id: string, args?: any) => {
    const scriptAction = scriptActions[id];
    if (!scriptAction) {
      throw new Error(`Script action with id "${id}" not found`);
    }

    try {
      if (scriptAction.executeOnClient && typeof window !== 'undefined') {
        // 在客户端执行脚本
        if (scriptAction.script) {
          const func = new Function('args', scriptAction.script);
          return func(args);
        }
      } else if (scriptAction.handler) {
        // 使用自定义处理器
        return await scriptAction.handler(args);
      } else {
        // 默认行为：在服务端通过 runtime 执行
        if (runtimeClient) {
          // 这里需要 runtime 支持脚本执行
          console.warn('Script execution via runtime not implemented yet');
        }
      }
    } catch (error) {
      console.error(`Error executing script action "${id}":`, error);
      throw error;
    }
  }, [scriptActions, runtimeClient]);

  // 可读上下文管理
  const setReadable = useCallback((id: string, readable: CopilotReadable) => {
    setReadablesState(prev => ({ ...prev, [id]: readable }));
  }, []);

  const removeReadable = useCallback((id: string) => {
    setReadablesState(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // 聊天建议管理
  const setChatSuggestion = useCallback((id: string, suggestion: CopilotChatSuggestionConfiguration) => {
    setChatSuggestionsState(prev => ({ ...prev, [id]: suggestion }));
  }, []);

  const removeChatSuggestion = useCallback((id: string) => {
    setChatSuggestionsState(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // 获取上下文字符串
  const getContextString = useCallback((categories?: string[]) => {
    const relevantReadables = Object.values(readables).filter(readable => {
      if (!categories) return true;
      return readable.categories?.some(cat => categories.includes(cat));
    });

    return relevantReadables
      .map(readable => {
        const value = readable.convert ? readable.convert(readable.value) : String(readable.value);
        return `${readable.description}: ${value}`;
      })
      .join("\n");
  }, [readables]);

  // 消息管理
  const appendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const reloadMessages = useCallback(() => {
    // 重新加载消息的逻辑
    setMessages([]);
  }, []);

  const stopMessage = useCallback((messageId: string) => {
    // 停止特定消息生成的逻辑
    if (runtimeClient) {
      runtimeClient.abort();
    }
  }, [runtimeClient]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // 便捷消息创建方法
  const appendTextMessage = useCallback((content: string, role: "user" | "assistant" | "system" = "user") => {
    const message = new TextMessage({ content, role });
    appendMessage(message);
  }, [appendMessage]);

  const appendActionMessage = useCallback((name: string, args: Record<string, any>) => {
    const message = new ActionExecutionMessage({ name, arguments: args });
    appendMessage(message);
  }, [appendMessage]);

  const appendResultMessage = useCallback((actionExecutionId: string, actionName: string, result: any) => {
    const message = new ResultMessage({ actionExecutionId, actionName, result });
    appendMessage(message);
  }, [appendMessage]);

  // 消息查询方法
  const getTextMessages = useCallback(() => {
    return messages.filter(msg => msg.isTextMessage()) as TextMessage[];
  }, [messages]);

  const getActionMessages = useCallback(() => {
    return messages.filter(msg => msg.isActionExecutionMessage()) as ActionExecutionMessage[];
  }, [messages]);

  const getResultMessages = useCallback(() => {
    return messages.filter(msg => msg.isResultMessage()) as ResultMessage[];
  }, [messages]);

  const getAgentStateMessages = useCallback(() => {
    return messages.filter(msg => msg.isAgentStateMessage()) as AgentStateMessage[];
  }, [messages]);

  const getMessageById = useCallback((messageId: string) => {
    return messages.find(msg => msg.id === messageId);
  }, [messages]);

  const getMessagesByParentId = useCallback((parentId: string) => {
    return messages.filter(msg => 
      (msg.isTextMessage() || msg.isActionExecutionMessage() || msg.isImageMessage()) && 
      msg.parentMessageId === parentId
    );
  }, [messages]);

  // 缓存数组和对象以避免无限循环
  const actionsArray = useMemo(() => Object.values(actions), [actions]);
  const scriptActionsArray = useMemo(() => Object.values(scriptActions), [scriptActions]);
  const chatSuggestionsArray = useMemo(() => Object.values(chatSuggestions), [chatSuggestions]);

  // 缓存占位符函数
  const setSystemMessagePlaceholder = useCallback(() => {}, []);
  const setRunIdPlaceholder = useCallback(() => {}, []);
  const setLangGraphInterruptActionPlaceholder = useCallback(() => {}, []);
  const removeLangGraphInterruptActionPlaceholder = useCallback(() => {}, []);

  // 构建上下文值
  const copilotContextValue: CopilotContextValue = useMemo(() => ({
    runtimeClient,
    actions: actionsArray,
    setAction,
    removeAction,
    scriptActions: scriptActionsArray,
    setScriptAction,
    removeScriptAction,
    executeScriptAction,
    readables,
    setReadable,
    removeReadable,
    chatSuggestions: chatSuggestionsArray,
    setChatSuggestion,
    removeChatSuggestion,
    systemMessage: undefined, // 系统消息通过 props 处理
    setSystemMessage: setSystemMessagePlaceholder,
    chatInstructions: undefined, // 聊天指令
    forwardedParameters: forwardedParameters,
    frontendInterruptManager,
    isLoading,
    setIsLoading,
    threadId,
    setThreadId,
    runId: null,
    setRunId: setRunIdPlaceholder,
    langGraphInterruptAction: undefined,
    setLangGraphInterruptAction: setLangGraphInterruptActionPlaceholder,
    removeLangGraphInterruptAction: removeLangGraphInterruptActionPlaceholder,
    agentSession: undefined,
    getContextString,
  }), [
    runtimeClient,
    actionsArray,
    setAction,
    removeAction,
    scriptActionsArray,
    setScriptAction,
    removeScriptAction,
    executeScriptAction,
    readables,
    setReadable,
    removeReadable,
    chatSuggestionsArray,
    setChatSuggestion,
    removeChatSuggestion,
    forwardedParameters,
    isLoading,
    setIsLoading,
    threadId,
    setThreadId,
    getContextString,
    setSystemMessagePlaceholder,
    setRunIdPlaceholder,
    setLangGraphInterruptActionPlaceholder,
    removeLangGraphInterruptActionPlaceholder,
    frontendInterruptManager,
  ]);

  const messagesContextValue: MessagesContextValue = useMemo(() => ({
    messages,
    setMessages,
    appendMessage,
    deleteMessage,
    reloadMessages,
    stopMessage,
    isLoading,
    setIsLoading,
    threadId,
    setThreadId,
    appendTextMessage,
    appendActionMessage,
    appendResultMessage,
    getTextMessages,
    getActionMessages,
    getResultMessages,
    getAgentStateMessages,
    getMessageById,
    getMessagesByParentId,
    clearMessages,
  }), [
    messages,
    setMessages,
    appendMessage,
    deleteMessage,
    reloadMessages,
    stopMessage,
    isLoading,
    setIsLoading,
    threadId,
    setThreadId,
    appendTextMessage,
    appendActionMessage,
    appendResultMessage,
    getTextMessages,
    getActionMessages,
    getResultMessages,
    getAgentStateMessages,
    getMessageById,
    getMessagesByParentId,
    clearMessages,
  ]);

  // 开发控制台
  const showDevConsoleEnabled = shouldShowDevConsole(showDevConsole);

  // 清理资源
  useEffect(() => {
    return () => {
      if (runtimeClient) {
        runtimeClient.dispose();
      }
    };
  }, [runtimeClient]);

  return (
    <ToastProvider>
      <CopilotContextProvider value={copilotContextValue}>
        <MessagesContextProvider value={messagesContextValue}>
          {children}
          {showDevConsoleEnabled && (
            <div style={{
              position: "fixed",
              bottom: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              zIndex: 10000,
            }}>
              CopilotKit Next Dev Console
            </div>
          )}
        </MessagesContextProvider>
      </CopilotContextProvider>
    </ToastProvider>
  );
} 