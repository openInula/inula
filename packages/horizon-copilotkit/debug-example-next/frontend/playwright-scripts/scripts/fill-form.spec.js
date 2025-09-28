import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('textbox', { name: '姓名输入框' }).click();
  await page.getByRole('textbox', { name: '姓名输入框' }).fill('chenchaotao');
  await page.getByRole('textbox', { name: '邮箱输入框' }).click();
  await page.getByRole('textbox', { name: '邮箱输入框' }).fill('11017647@qq.com');
  await page.getByRole('spinbutton', { name: '年龄输入框' }).click();
  await page.getByRole('spinbutton', { name: '年龄输入框' }).fill('41');
  await page.getByLabel('国家选择').selectOption('中国');
  await page.getByRole('radio', { name: '男性' }).check();
  await page.getByLabel('优先级选择').selectOption('high');
  await page.getByRole('checkbox', { name: '技能: TypeScript' }).check();
  await page.getByRole('checkbox', { name: '技能: Java' }).check();
  await page.getByRole('checkbox', { name: '技能: Python' }).check();
  await page.getByRole('checkbox', { name: '技能: React' }).check();
  await page.getByRole('textbox', { name: '开始日期' }).fill('2025-07-30');
  await page.getByRole('textbox', { name: '结束日期' }).fill('2025-07-31');
  await page.getByRole('textbox', { name: '个人简介' }).click();
  await page.getByRole('textbox', { name: '个人简介' }).fill('software');
  await page.getByRole('checkbox', { name: '订阅通讯录' }).check();
  await page.getByRole('button', { name: '提交表单' }).click();
});