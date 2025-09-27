/**
 * ask-llm 脚本执行器
 * 使用 CopilotKit playwright-actuator 执行原始 Playwright 脚本
 */

import { page } from '@copilotkit/playwright-actuator';

export const askLlmExecutor = async (message) => {
  await page.getByRole('textbox', { name: '输入消息' }).click();
  await page.getByRole('textbox', { name: '输入消息' }).fill(message);
  await page.getByRole('button', { name: '发送' }).click();
};