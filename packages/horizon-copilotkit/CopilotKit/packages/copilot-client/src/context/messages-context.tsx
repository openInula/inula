import React, { createContext, useContext, ReactNode } from "react";
import { Message, TextMessage, ActionExecutionMessage, ResultMessage, AgentStateMessage } from "../client";
// import { randomId } from "@copilotkit/shared";

export interface MessagesContextValue {
  // 消息列表
  messages: Message[];
  
  // 设置消息列表
  setMessages: (messages: Message[]) => void;
  
  // 添加消息
  appendMessage: (message: Message) => void;
  
  // 删除消息
  deleteMessage: (messageId: string) => void;
  
  // 重新加载消息
  reloadMessages: () => void;
  
  // 停止消息生成
  stopMessage: (messageId: string) => void;
  
  // 是否正在加载
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // 当前线程 ID
  threadId?: string;
  setThreadId: (threadId: string) => void;
  
  // 便捷方法
  appendTextMessage: (content: string, role?: "user" | "assistant" | "system") => void;
  appendActionMessage: (name: string, args: Record<string, any>) => void;
  appendResultMessage: (actionExecutionId: string, actionName: string, result: any) => void;
  
  // 获取特定类型的消息
  getTextMessages: () => TextMessage[];
  getActionMessages: () => ActionExecutionMessage[];
  getResultMessages: () => ResultMessage[];
  
  // 根据 ID 查找消息
  getMessageById: (messageId: string) => Message | undefined;
  
  // 根据父消息 ID 查找子消息
  getMessagesByParentId: (parentId: string) => Message[];
  
  // 清空所有消息
  clearMessages: () => void;
}

const MessagesContext = createContext<MessagesContextValue | undefined>(undefined);

export interface MessagesContextProviderProps {
  children: ReactNode;
  value: MessagesContextValue;
}

export function MessagesContextProvider({ children, value }: MessagesContextProviderProps) {
  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessagesContext(): MessagesContextValue {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error("useMessagesContext must be used within a MessagesContextProvider");
  }
  return context;
}

// 便捷 Hooks
export function useMessages() {
  const { messages, setMessages, appendMessage, deleteMessage, clearMessages } = useMessagesContext();
  return {
    messages,
    setMessages,
    appendMessage,
    deleteMessage,
    clearMessages,
  };
}

export function useMessageHelpers() {
  const {
    appendTextMessage,
    appendActionMessage,
    appendResultMessage,
    getTextMessages,
    getActionMessages,
    getResultMessages,
    getMessageById,
    getMessagesByParentId,
  } = useMessagesContext();
  
  return {
    appendTextMessage,
    appendActionMessage,
    appendResultMessage,
    getTextMessages,
    getActionMessages,
    getResultMessages,
    getMessageById,
    getMessagesByParentId,
  };
}

export function useMessagesLoading() {
  const { isLoading, setIsLoading, stopMessage, reloadMessages } = useMessagesContext();
  return {
    isLoading,
    setIsLoading,
    stopMessage,
    reloadMessages,
  };
}

export function useThreadId() {
  const { threadId, setThreadId } = useMessagesContext();
  return {
    threadId,
    setThreadId,
  };
} 