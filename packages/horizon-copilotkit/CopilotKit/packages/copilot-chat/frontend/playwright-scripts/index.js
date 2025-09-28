/**
 * Playwright Scripts Index
 * 导出所有 ScriptAction 定义
 */

// 导入定义和执行器
import { askLlmDefinition } from './definitions/ask-llm.definition.js';
import { askLlmExecutor } from './executors/ask-llm.executor.js';
import { fillFormDefinition } from './definitions/fill-form.definition.js';
import { fillFormExecutor } from './executors/fill-form.executor.js';

/**
 * Ask LLM ScriptAction
 * 向前端聊天界面发送消息并等待响应
 */
const askLlmAction = {
  ...askLlmDefinition,
  handler: askLlmExecutor
};

/**
 * Fill Form ScriptAction
 * 自动填写用户信息表单
 */
const fillFormAction = {
  ...fillFormDefinition,
  handler: fillFormExecutor
};

// 导出所有 ScriptActions
export const scriptActions = [
  askLlmAction,
  fillFormAction
];

// 按名称导出个别 actions
export {
  askLlmAction,
  fillFormAction
};

// 默认导出
export default {
  scriptActions,
  askLlmAction,
  fillFormAction
};