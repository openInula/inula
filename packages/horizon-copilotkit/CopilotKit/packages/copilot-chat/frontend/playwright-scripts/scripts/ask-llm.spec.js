import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('textbox', { name: '输入消息' }).click();
  await page.getByRole('textbox', { name: '输入消息' }).fill('get time');
  await page.getByRole('button', { name: '发送' }).click();
});