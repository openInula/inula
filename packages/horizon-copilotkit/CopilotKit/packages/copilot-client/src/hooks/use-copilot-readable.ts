import { useEffect, useRef } from "react";
import { randomId } from "@copilotkit/shared";
import { useCopilotReadables } from "../context/copilot-context";
import { CopilotReadable } from "../context/copilot-context";
import { defaultCopilotContextCategories } from "../utils";

/**
 * 注册一个可读上下文的 Hook
 * 
 * @param description 上下文的描述
 * @param value 上下文的值
 * @param categories 上下文的分类，默认为 ["copilot"]
 * @param convert 可选的转换函数，将值转换为字符串
 * @param dependencies 依赖数组，当依赖变化时重新注册上下文
 */
export function useCopilotReadable<T = any>({
  description,
  value,
  categories = defaultCopilotContextCategories,
  convert,
  dependencies,
}: {
  description: string;
  value: T;
  categories?: string[];
  convert?: (value: T) => string;
  dependencies?: React.DependencyList;
}) {
  const { setReadable, removeReadable } = useCopilotReadables();
  const readableIdRef = useRef<string>();

  useEffect(() => {
    // 生成唯一的可读上下文 ID
    if (!readableIdRef.current) {
      readableIdRef.current = `readable-${randomId()}`;
    }

    const readableId = readableIdRef.current;

    // 创建可读上下文对象
    const readable: CopilotReadable = {
      description,
      value,
      categories,
      convert,
    };

    // 注册可读上下文
    setReadable(readableId, readable);

    // 清理函数：移除可读上下文
    return () => {
      removeReadable(readableId);
    };
  }, dependencies ? [...dependencies, description] : [description, value, categories, convert]);

  // 返回可读上下文 ID
  return readableIdRef.current;
}

/**
 * 获取上下文字符串的 Hook
 */
export function useCopilotContext(categories?: string[]) {
  const { getContextString } = useCopilotReadables();
  return getContextString(categories);
}

/**
 * 获取所有可读上下文的 Hook
 */
export function useCopilotReadableValues() {
  const { readables } = useCopilotReadables();
  return readables;
}

/**
 * 手动管理可读上下文的 Hook
 */
export function useCopilotReadableManager() {
  const { setReadable, removeReadable } = useCopilotReadables();

  const addReadable = (readable: CopilotReadable, id?: string) => {
    const readableId = id || `readable-${randomId()}`;
    setReadable(readableId, readable);
    return readableId;
  };

  return {
    addReadable,
    removeReadable,
  };
} 