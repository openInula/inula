import { AIComponentPrompts, ComponentCapabilities } from '../types';

// AI组件识别关键词
export const aiComponentPrompts: AIComponentPrompts = {
  form: [
    '创建一个表单',
    '需要输入用户信息', 
    '填写数据',
    '提交表单',
    '用户注册',
    '信息收集',
    '数据录入',
    '表单验证',
    '用户登录',
    '表单提交',
    '输入框',
    '用户信息表单'
  ],
  select: [
    '选择选项',
    '下拉菜单', 
    '选择器',
    '从列表中选择',
    '筛选选项',
    '选择一个',
    '下拉框',
    '选择值',
    '多选',
    '单选',
    '选择组件',
    '下拉选择'
  ]
};

// 组件能力描述
export const componentCapabilities: ComponentCapabilities = {
  form: [
    '设置字段值',
    '提交表单', 
    '验证输入',
    '重置表单',
    '获取表单数据',
    '动态添加字段',
    '表单布局控制',
    '字段验证',
    '数据收集'
  ],
  select: [
    '设置选中值',
    '打开/关闭下拉',
    '获取选择值',
    '添加选项',
    '删除选项',
    '设置选项列表',
    '多选模式',
    '搜索过滤',
    '选项管理'
  ]
};

// AI意图识别函数
export const detectComponentIntent = (userInput: string): string[] => {
  const input = userInput.toLowerCase();
  const matches: string[] = [];

  Object.entries(aiComponentPrompts).forEach(([componentName, prompts]: [string, string[]]) => {
    const hasMatch = prompts.some((prompt: string) => 
      input.includes(prompt.toLowerCase()) || 
      prompt.toLowerCase().includes(input)
    );
    if (hasMatch) {
      matches.push(componentName);
    }
  });

  return matches;
};

// 获取组件建议操作
export const getComponentSuggestions = (componentName: string): string[] => {
  return componentCapabilities[componentName] || [];
};