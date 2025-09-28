import React, { useCallback, useRef } from "react";
import { useCopilotContext } from "../context/copilot-context";
import { 
  LangGraphInterruptEvent, 
  LangGraphInterruptAction 
} from "./use-langgraph-interrupt";

/**
 * 中断渲染器组件的属性
 */
interface InterruptProps {
  event: LangGraphInterruptEvent;
  result: any;
  render: (props: {
    event: LangGraphInterruptEvent;
    result: any;
    resolve: (response: string) => void;
  }) => string | React.ReactElement;
  resolve: (response: string) => void;
}

/**
 * 中断渲染器组件
 */
const InterruptRenderer: React.FC<InterruptProps> = ({ event, result, render, resolve }) => {
  return render({ event, result, resolve });
};

/**
 * useLangGraphInterruptRender Hook，用于渲染 LangGraph 中断界面
 * 
 * @returns 渲染的中断界面组件或 null
 */
export function useLangGraphInterruptRender(): string | React.ReactElement | null {
  const { 
    langGraphInterruptAction, 
    setLangGraphInterruptAction, 
    agentSession 
  } = useCopilotContext();

  const responseRef = useRef<string>();

  // 解决中断的回调函数
  const resolveInterrupt = useCallback(
    (response: string) => {
      responseRef.current = response;
      
      // 使用 setTimeout 将状态更新推迟到下一个事件循环
      setTimeout(() => {
        setLangGraphInterruptAction({ 
          event: { 
            name: langGraphInterruptAction?.event?.name || "interrupt",
            value: langGraphInterruptAction?.event?.value,
            response 
          } 
        });
      }, 0);
    },
    [setLangGraphInterruptAction, langGraphInterruptAction],
  );

  // 检查是否有有效的中断动作
  if (
    !langGraphInterruptAction ||
    !langGraphInterruptAction.event ||
    !langGraphInterruptAction.render
  ) {
    return null;
  }

  const { render, handler, event, enabled } = langGraphInterruptAction;

  // 检查条件是否满足
  const conditionsMet = !agentSession || !enabled
    ? true
    : enabled({ 
        eventValue: event.value, 
        agentMetadata: agentSession 
      });

  if (!conditionsMet) {
    return null;
  }

  // 执行处理函数（如果有）
  let result = null;
  if (handler) {
    result = handler({
      event,
      resolve: resolveInterrupt,
    });
  }

  // 创建并返回中断渲染器组件
  return React.createElement(InterruptRenderer, {
    event,
    result,
    render,
    resolve: resolveInterrupt,
  });
} 