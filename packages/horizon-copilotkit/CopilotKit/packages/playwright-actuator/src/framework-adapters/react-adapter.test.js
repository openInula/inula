/**
 * React Adapter 测试用例
 * 演示如何使用 React 适配器处理 React 组件事件
 */

import { test, expect, page } from '../index.js';
import { getReactAdapter, triggerReactChangeEvent } from './react-adapter.js';

test('React 适配器 fill 表单测试', async ({ page }) => {
  // 导航到测试页面
  await page.goto('http://localhost:3000'); // 假设你的 React 应用运行在 localhost:3000
  
  // 获取 React 适配器实例
  const reactAdapter = getReactAdapter();
  
  // 测试输入框填充
  await page.getByLabel('姓名输入框').fill('张三');
  await page.getByLabel('邮箱输入框').fill('zhangsan@example.com');
  
  // 测试 React 组件检测
  const nameInput = await page.getByLabel('姓名输入框').getElement();
  const isReactComponent = reactAdapter.isReactComponent(nameInput);
  
  console.log('姓名输入框是否为 React 组件:', isReactComponent);
  
  // 验证表单值是否正确设置
  expect(await page.getByLabel('姓名输入框').inputValue()).toBe('张三');
  expect(await page.getByLabel('邮箱输入框').inputValue()).toBe('zhangsan@example.com');
});

test('React 适配器复选框测试', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 选择技能复选框
  await page.getByRole('checkbox', { name: '技能: React' }).check();
  await page.getByRole('checkbox', { name: '技能: TypeScript' }).check();
  
  // 验证复选框状态
  expect(await page.getByRole('checkbox', { name: '技能: React' }).isChecked()).toBe(true);
  expect(await page.getByRole('checkbox', { name: '技能: TypeScript' }).isChecked()).toBe(true);
  
  // 取消选择
  await page.getByRole('checkbox', { name: '技能: React' }).uncheck();
  expect(await page.getByRole('checkbox', { name: '技能: React' }).isChecked()).toBe(false);
});

test('React 适配器下拉选择测试', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 选择国家
  await page.getByLabel('国家选择').selectOption('中国');
  expect(await page.getByLabel('国家选择').inputValue()).toBe('中国');
  
  // 选择优先级
  await page.getByLabel('优先级选择').selectOption('high');
  expect(await page.getByLabel('优先级选择').inputValue()).toBe('high');
});

test('直接使用 React 适配器 API', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  const nameInput = await page.getByLabel('姓名输入框').getElement();
  
  // 直接使用便捷函数触发 React 事件
  const result = await triggerReactChangeEvent(nameInput, '李四');
  
  console.log('事件触发结果:', result);
  expect(result.success).toBe(true);
  
  // 验证值是否正确设置
  expect(await page.getByLabel('姓名输入框').inputValue()).toBe('李四');
});

test('原生元素事件触发测试', async ({ page }) => {
  // 创建一个包含原生元素的测试页面
  await page.goto('data:text/html,<html><body><input id="native-input" type="text"><select id="native-select"><option value="a">A</option><option value="b">B</option></select></body></html>');
  
  // 测试原生输入框
  await page.locator('#native-input').fill('原生输入');
  expect(await page.locator('#native-input').inputValue()).toBe('原生输入');
  
  // 测试原生下拉框
  await page.locator('#native-select').selectOption('b');
  expect(await page.locator('#native-select').inputValue()).toBe('b');
});

test('混合环境测试 - React 和原生元素', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 获取 React 适配器实例
  const reactAdapter = getReactAdapter();
  
  // 测试 React 组件
  const reactInput = await page.getByLabel('姓名输入框').getElement();
  const isReactComponent = reactAdapter.isReactComponent(reactInput);
  console.log('React 组件检测:', isReactComponent);
  
  await page.getByLabel('姓名输入框').fill('React 输入');
  expect(await page.getByLabel('姓名输入框').inputValue()).toBe('React 输入');
  
  // 在同一页面创建原生元素进行对比
  await page.evaluate(() => {
    const nativeInput = document.createElement('input');
    nativeInput.id = 'native-test-input';
    nativeInput.type = 'text';
    document.body.appendChild(nativeInput);
  });
  
  // 测试原生元素
  const nativeInput = await page.locator('#native-test-input').getElement();
  const isNativeComponent = reactAdapter.isReactComponent(nativeInput);
  console.log('原生组件检测:', isNativeComponent);
  
  await page.locator('#native-test-input').fill('原生输入');
  expect(await page.locator('#native-test-input').inputValue()).toBe('原生输入');
});