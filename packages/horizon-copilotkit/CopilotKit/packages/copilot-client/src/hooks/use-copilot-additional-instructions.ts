import { useEffect, useRef } from "react";
import { useCopilotReadables } from "../context/copilot-context";
import { randomId } from "@copilotkit/shared";

/**
 * useCopilotAdditionalInstructions Hook 选项
 */
export interface UseCopilotAdditionalInstructionsOptions {
  /**
   * 要添加到 Copilot 的指令。将按以下方式添加到指令中：
   * 
   * ```txt
   * You are a helpful assistant.
   * Additionally, follow these instructions:
   * - Do not answer questions about the weather.
   * - Do not answer questions about the stock market.
   * ```
   */
  instructions: string;

  /**
   * 指令是否对 Copilot 可用
   */
  available?: "enabled" | "disabled";
}

/**
 * 将给定指令添加到 Copilot 上下文的 Hook
 * 
 * ## 用法
 * 
 * ### 简单用法
 * 
 * ```tsx
 * import { useCopilotAdditionalInstructions } from "@copilotkit/copilot-client";
 * 
 * export function MyComponent() {
 *   useCopilotAdditionalInstructions({
 *     instructions: "Do not answer questions about the weather.",
 *   });
 * }
 * ```
 * 
 * ### 条件用法
 * 
 * ```tsx
 * import { useCopilotAdditionalInstructions } from "@copilotkit/copilot-client";
 * 
 * export function MyComponent() {
 *   const [showInstructions, setShowInstructions] = useState(false);
 * 
 *   useCopilotAdditionalInstructions({
 *     available: showInstructions ? "enabled" : "disabled",
 *     instructions: "Do not answer questions about the weather.",
 *   });
 * }
 * ```
 */
export function useCopilotAdditionalInstructions(
  { instructions, available = "enabled" }: UseCopilotAdditionalInstructionsOptions,
  dependencies?: any[],
) {
  const { setReadable, removeReadable } = useCopilotReadables();
  const instructionIdRef = useRef<string>();

  useEffect(() => {
    if (available === "disabled") {
      // 如果禁用，移除现有的指令
      if (instructionIdRef.current) {
        removeReadable(instructionIdRef.current);
        instructionIdRef.current = undefined;
      }
      return;
    }

    // 生成唯一的指令 ID
    if (!instructionIdRef.current) {
      instructionIdRef.current = `additional-instructions-${randomId()}`;
    }

    const instructionId = instructionIdRef.current;

    // 将指令作为可读上下文添加
    setReadable(instructionId, {
      description: "Additional instructions for the AI assistant",
      value: `Additional instructions: ${instructions}`,
      categories: ["instructions", "system"],
      convert: (value) => value,
    });

    return () => {
      removeReadable(instructionId);
    };
  }, [available, instructions, setReadable, removeReadable, ...(dependencies || [])]);

  return instructionIdRef.current;
} 