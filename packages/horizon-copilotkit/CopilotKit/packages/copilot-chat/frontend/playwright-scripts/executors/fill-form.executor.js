/**
 * fill-form 脚本执行器
 * 使用 CopilotKit playwright-actuator 自动填写用户信息表单
 */

import { page } from '@copilotkit/playwright-actuator';

export const fillFormExecutor = async (formData) => {
  const {
    name,
    email,
    age,
    country,
    gender,
    priority,
    skills = [],
    startDate,
    endDate,
    bio,
    newsletter,
    submit = false
  } = formData;

  try {
    // 填写姓名
    if (name) {
      await page.getByRole('textbox', { name: '姓名输入框' }).click();
      await page.getByRole('textbox', { name: '姓名输入框' }).fill(name);
    }

    // 填写邮箱
    if (email) {
      await page.getByRole('textbox', { name: '邮箱输入框' }).click();
      await page.getByRole('textbox', { name: '邮箱输入框' }).fill(email);
    }

    // 填写年龄
    if (age) {
      await page.getByRole('spinbutton', { name: '年龄输入框' }).click();
      await page.getByRole('spinbutton', { name: '年龄输入框' }).fill(age.toString());
    }

    // 选择国家
    if (country) {
      await page.getByLabel('国家选择').selectOption(country);
    }

    // 选择性别
    if (gender) {
      const genderLabels = {
        'male': '男性',
        'female': '女性', 
        'other': '其他'
      };
      await page.getByRole('radio', { name: genderLabels[gender] }).check();
    }

    // 选择优先级
    if (priority) {
      await page.getByLabel('优先级选择').selectOption(priority);
    }

    // 选择技能
    if (skills.length > 0) {
      for (const skill of skills) {
        await page.getByRole('checkbox', { name: `技能: ${skill}` }).check();
      }
    }

    // 填写开始日期
    if (startDate) {
      await page.getByRole('textbox', { name: '开始日期' }).fill(startDate);
    }

    // 填写结束日期
    if (endDate) {
      await page.getByRole('textbox', { name: '结束日期' }).fill(endDate);
    }

    // 填写个人简介
    if (bio) {
      await page.getByRole('textbox', { name: '个人简介' }).click();
      await page.getByRole('textbox', { name: '个人简介' }).fill(bio);
    }

    // 设置通讯录订阅
    if (newsletter) {
      await page.getByRole('checkbox', { name: '订阅通讯录' }).check();
    }

    // 提交表单
    if (submit) {
      await page.getByRole('button', { name: '提交表单' }).click();
    }

    return `表单填写完成。${submit ? '已提交表单。' : '未提交表单，可手动点击提交按钮。'}`;

  } catch (error) {
    throw new Error(`填写表单时发生错误: ${error.message}`);
  }
};