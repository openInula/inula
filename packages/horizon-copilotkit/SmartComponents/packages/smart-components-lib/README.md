# Smart Components React

🤖 AI驱动的React智能组件库，让AI能够理解和操作你的组件。

## 特性

- 🎯 **AI友好**: 内置AI识别关键词和能力描述
- 🔧 **工具化接口**: 标准化的组件操作API
- 📦 **即插即用**: 开箱即用的智能组件
- 🛡️ **类型安全**: 完整的TypeScript支持
- 🚀 **轻量级**: 基于peerDependencies，避免重复打包

## 安装

```bash
npm install @smart-components/react
# 或
yarn add @smart-components/react
# 或  
pnpm add @smart-components/react
```

## 使用方法

### 基础使用

```tsx
import React, { useRef, useEffect } from 'react';
import { 
  FormComponent, 
  SelectComponent, 
  useSmartComponents,
  formConfig,
  selectConfig 
} from '@smart-components/react';

function App() {
  const { registerComponent } = useSmartComponents();
  const formRef = useRef();
  const selectRef = useRef();

  useEffect(() => {
    // 注册智能组件
    registerComponent('form', formConfig, formRef.current);
    registerComponent('select', selectConfig, selectRef.current);
  }, []);

  return (
    <div>
      <FormComponent ref={formRef} />
      <SelectComponent ref={selectRef} />
    </div>
  );
}
```

### AI操作示例

```tsx
const { registry } = useSmartComponents();

// AI可以通过以下方式操作组件：

// 设置表单字段值
await registry.callTool('form', 'setFieldValue', { 
  field: 'username', 
  value: 'AI用户' 
});

// 提交表单
await registry.callTool('form', 'submitForm', {});

// 设置选择器值
await registry.callTool('select', 'setValue', { 
  value: 'option1' 
});

// 添加新选项
await registry.callTool('select', 'addOption', {
  value: 'newOption',
  label: '新选项'
});
```

## 支持的组件

### FormComponent

智能表单组件，支持动态字段配置、表单验证、数据提交等功能。

**AI识别关键词**: "创建表单", "用户注册", "信息收集", "数据录入"

**可用操作**:
- `setFieldValue` - 设置字段值
- `submitForm` - 提交表单
- `getFieldsValue` - 获取表单数据
- `resetFields` - 重置表单
- `validateFields` - 验证表单

### SelectComponent

智能选择器组件，支持单选、多选、搜索、动态选项等功能。

**AI识别关键词**: "选择选项", "下拉菜单", "从列表中选择", "筛选选项"

**可用操作**:
- `setValue` - 设置选中值
- `setOpen` - 打开/关闭下拉
- `getValue` - 获取选择值
- `addOption` - 添加选项
- `removeOption` - 删除选项
- `setOptions` - 设置选项列表

## API参考

### useSmartComponents()

主要的Hook，提供组件注册和管理功能。

```tsx
const { 
  registry,           // 组件注册表实例
  registerComponent,  // 注册组件函数
  isRegistered       // 检查组件是否已注册
} = useSmartComponents();
```

### AI识别工具

```tsx
import { detectComponentIntent, getComponentSuggestions } from '@smart-components/react';

// 检测用户意图
const matches = detectComponentIntent('我需要创建一个表单');
// 返回: ['form']

// 获取组件建议操作
const suggestions = getComponentSuggestions('form');
// 返回: ['设置字段值', '提交表单', '验证输入', ...]
```

## 开发指南

### 自定义智能组件

```tsx
import { SmartComponentConfig } from '@smart-components/react';

export const customConfig: SmartComponentConfig = {
  meta: {
    name: 'custom',
    description: '自定义智能组件',
    category: 'display',
    aiPrompts: ['显示内容', '自定义组件'],
    capabilities: ['设置内容', '切换状态'],
    version: '1.0.0'
  },
  tools: {
    setContent: {
      name: 'setContent',
      description: '设置组件内容',
      paramsSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '内容文本' }
        },
        required: ['content']
      },
      cb: (instance, params) => {
        instance.setContent(params.content);
        return { success: true };
      }
    }
  }
};
```

## 后端集成

组件库支持与后端API集成，自动同步组件注册信息：

```javascript
// 后端API端点: POST /api/register
{
  "name": "form",
  "description": "智能表单组件",
  "category": "form",
  "aiPrompts": ["创建表单", "用户注册"],
  "capabilities": ["设置字段值", "提交表单"],
  "tools": [...]
}
```

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！