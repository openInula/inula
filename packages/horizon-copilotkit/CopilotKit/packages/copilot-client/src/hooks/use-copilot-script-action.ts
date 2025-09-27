import { useEffect, useRef } from "react";
import { randomId } from "@copilotkit/shared";
import { useCopilotScriptActions } from "../context/copilot-context";
import { ScriptAction } from "../types/frontend-action";

/**
 * 注册一个 Copilot 脚本动作的 Hook
 * 
 * @param scriptAction 要注册的脚本动作定义
 * @param dependencies 依赖数组，当依赖变化时重新注册脚本动作
 */
export function useCopilotScriptAction(
  scriptAction: ScriptAction,
  dependencies?: React.DependencyList
) {
  const { setScriptAction, removeScriptAction } = useCopilotScriptActions();
  const scriptActionIdRef = useRef<string>();

  useEffect(() => {
    // 生成唯一的脚本动作 ID
    if (!scriptActionIdRef.current) {
      scriptActionIdRef.current = `${scriptAction.name}-${randomId()}`;
    }

    const scriptActionId = scriptActionIdRef.current;

    // 直接注册脚本动作
    setScriptAction(scriptActionId, scriptAction);

    // 清理函数：移除脚本动作
    return () => {
      removeScriptAction(scriptActionId);
    };
  }, dependencies ? [...dependencies, scriptAction.name] : [
    scriptAction.name, 
    scriptAction.description, 
    scriptAction.handler,
    scriptAction.executeOnClient
  ]);

  // 返回脚本动作 ID，用于可能的手动控制
  return scriptActionIdRef.current;
}

/**
 * 获取所有已注册的脚本动作
 */
export function useRegisteredScriptActions(): ScriptAction[] {
  const { scriptActions }: { scriptActions: ScriptAction[] } = useCopilotScriptActions();
  return scriptActions;
}

/**
 * 手动添加和移除脚本动作的 Hook
 */
export function useCopilotScriptActionManager() {
  const { setScriptAction, removeScriptAction, executeScriptAction } = useCopilotScriptActions();

  const addScriptAction = (scriptAction: ScriptAction, id?: string) => {
    const scriptActionId = id || `${scriptAction.name}-${randomId()}`;
    setScriptAction(scriptActionId, scriptAction);
    return scriptActionId;
  };

  const runScript = async (id: string, args?: any) => {
    return await executeScriptAction(id, args);
  };

  return {
    addScriptAction,
    removeScriptAction,
    executeScriptAction: runScript,
  };
}

/**
 * 执行脚本动作的便捷 Hook
 * 
 * @param scriptActionName 脚本动作名称
 */
export function useScriptActionExecutor(scriptActionName?: string) {
  const { scriptActions, executeScriptAction } = useCopilotScriptActions();

  const executeByName = async (name: string, args?: any) => {
    const scriptAction = scriptActions.find(action => action.name === name);
    if (!scriptAction) {
      throw new Error(`Script action "${name}" not found`);
    }
    
    // 如果有客户端执行器，直接调用
    if (scriptAction.executeOnClient && scriptAction.handler) {
      return await scriptAction.handler(args);
    }
    
    // 否则通过运行时执行
    return await executeScriptAction(name, args);
  };

  const executeDefault = async (args?: any) => {
    if (!scriptActionName) {
      throw new Error("No script action name provided");
    }
    return await executeByName(scriptActionName, args);
  };

  return {
    execute: scriptActionName ? executeDefault : executeByName,
    executeByName,
    availableActions: scriptActions.map(action => action.name),
  };
}