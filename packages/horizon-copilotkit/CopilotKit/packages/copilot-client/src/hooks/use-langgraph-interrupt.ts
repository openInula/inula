import React, { useEffect, useMemo } from "react";
import { useCopilotContext } from "../context/copilot-context";
import { useToast } from "../components/toast/toast-provider";
import { useCopilotChat } from "./use-copilot-chat";
import { randomId } from "@copilotkit/shared";

/**
 * LangGraph 中断事件
 */
export interface LangGraphInterruptEvent {
  name: string;
  value?: any;
  response?: string;
}

/**
 * LangGraph 中断渲染器
 */
export interface LangGraphInterruptRender<TEventValue = any> {
  /**
   * 渲染函数
   */
  render: (props: {
    event: LangGraphInterruptEvent;
    resolve: (response: string) => void;
  }) => string | React.ReactElement;

  /**
   * 处理函数
   */
  handler?: (props: {
    event: LangGraphInterruptEvent;
    resolve: (response: string) => void;
  }) => any;

  /**
   * 是否启用该中断处理器
   */
  enabled?: (props: {
    eventValue: TEventValue;
    agentMetadata?: any;
  }) => boolean;
}

/**
 * LangGraph 中断动作
 */
export interface LangGraphInterruptAction extends LangGraphInterruptRender {
  id: string;
  event?: LangGraphInterruptEvent;
}

/**
 * useLangGraphInterrupt Hook，用于处理 LangGraph 中断
 * 
 * @param action 中断动作配置（不包含 id）
 * @param dependencies 依赖数组
 */
export function useLangGraphInterrupt<TEventValue = any>(
  action: Omit<LangGraphInterruptRender<TEventValue>, "id">,
  dependencies?: any[],
) {
  const { 
    setLangGraphInterruptAction, 
    removeLangGraphInterruptAction, 
    langGraphInterruptAction 
  } = useCopilotContext();
  
  const { runChatCompletion } = useCopilotChat();
  const { addToast } = useToast();

  // 生成唯一的动作 ID
  const actionId = useMemo(() => `lg-interrupt-${randomId()}`, []);

  // 检查是否已有动作定义
  const hasAction = useMemo(
    () => Boolean(langGraphInterruptAction?.id),
    [langGraphInterruptAction],
  );

  // 检查是否是当前动作
  const isCurrentAction = useMemo(
    () => langGraphInterruptAction?.id && langGraphInterruptAction?.id === actionId,
    [langGraphInterruptAction, actionId],
  );

  // 当中断事件有响应时，运行聊天完成
  useEffect(() => {
    if (hasAction && isCurrentAction && langGraphInterruptAction?.event?.response) {
      runChatCompletion();
    }
  }, [langGraphInterruptAction?.event?.response, runChatCompletion, hasAction, isCurrentAction]);

  // 注册中断动作
  useEffect(() => {
    if (!action) return;

    // 如果已有动作且不是当前动作，显示警告
    if (hasAction && !isCurrentAction && !action.enabled) {
      addToast({
        type: "warning",
        message: "一个中断事件的动作已经注册",
      });
      return;
    }

    // 如果已有动作且是当前动作，跳过
    if (hasAction && isCurrentAction) {
      return;
    }

    // 设置中断动作
    setLangGraphInterruptAction({ ...action, id: actionId });

    // 清理函数
    return () => {
      removeLangGraphInterruptAction(actionId);
    };
  }, [
    action,
    hasAction,
    isCurrentAction,
    setLangGraphInterruptAction,
    removeLangGraphInterruptAction,
    actionId,
    addToast,
    ...(dependencies || []),
  ]);

  return {
    actionId,
    isActive: hasAction && isCurrentAction,
    hasInterruptEvent: Boolean(langGraphInterruptAction?.event),
  };
} 