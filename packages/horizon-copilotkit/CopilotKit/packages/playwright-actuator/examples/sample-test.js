// 这是一个标准的 Playwright 录制脚本示例
// 可以直接在浏览器中运行

import { test, expect } from '@playwright/test';

test('登录表单测试', async ({ page }) => {
  // 填写用户名
  await page.fill('#username', 'testuser123');
  
  // 填写密码
  await page.fill('#password', 'securepassword');
  
  // 填写邮箱
  await page.fill('#email', 'test@example.com');
  
  // 选择国家
  await page.selectOption('#country', 'cn');
  
  // 同意条款
  await page.check('#agree');
  
  // 点击提交
  await page.click('#submit-btn');
  
  // 验证提交成功
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#result')).toHaveText('表单提交成功！');
});

test('表单重置测试', async ({ page }) => {
  // 先填写一些数据
  await page.fill('#username', 'resetuser');
  await page.fill('#email', 'reset@test.com');
  await page.check('#agree');
  
  // 验证数据已填写
  await expect(page.locator('#username')).toHaveValue('resetuser');
  await expect(page.locator('#agree')).toBeChecked();
  
  // 点击重置按钮
  await page.click('#reset-btn');
  
  // 验证表单已重置
  await expect(page.locator('#username')).toHaveValue('');
  await expect(page.locator('#email')).toHaveValue('');
  await expect(page.locator('#agree')).not.toBeChecked();
  await expect(page.locator('#result')).toBeHidden();
});

test('表单验证测试', async ({ page }) => {
  // 测试空表单提交
  await page.click('#submit-btn');
  
  // 验证结果区域显示
  await expect(page.locator('#result')).toBeVisible();
  
  // 测试部分填写
  await page.fill('#username', 'partialuser');
  
  // 验证用户名字段有值
  await expect(page.locator('#username')).toHaveValue('partialuser');
  
  // 测试按钮状态
  await expect(page.locator('#submit-btn')).toBeEnabled();
  await expect(page.locator('#reset-btn')).toBeEnabled();
});

test('现代定位器测试', async ({ page }) => {
  // 使用 getByLabel 定位器
  await page.getByLabel('用户名').fill('modernuser');
  await page.getByLabel('密码').fill('modernpass');
  await page.getByLabel('邮箱').fill('modern@example.com');
  
  // 使用 getByRole 定位器
  await page.getByRole('combobox').selectOption('us');
  await page.getByRole('checkbox').check();
  
  // 使用 getByText 定位器
  await page.getByText('提交').click();
  
  // 验证结果
  await expect(page.locator('#result')).toBeVisible();
});

test('高级等待测试', async ({ page }) => {
  // 填写表单
  await page.fill('#username', 'waituser');
  await page.fill('#email', 'wait@test.com');
  
  // 等待元素状态
  await page.waitForSelector('#submit-btn:enabled');
  
  // 点击并等待结果
  await page.click('#submit-btn');
  await page.waitForSelector('#result:visible');
  
  // 使用 waitForFunction
  await page.waitForFunction(() => {
    const result = document.querySelector('#result');
    return result && result.style.display !== 'none';
  });
  
  // 验证最终状态
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#result')).toHaveText(/成功/);
});