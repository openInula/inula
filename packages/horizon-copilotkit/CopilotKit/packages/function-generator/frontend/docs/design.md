# Tab-Function 功能设计文档

## 项目概述

Tab-Function 是一个基于 Playwright 脚本录制的智能化工具，通过 LLM 自动生成函数定义和执行器，并支持 RAG 存储与检索功能。

## 功能架构

### 核心流程
1. **脚本录制** → **描述增强** → **LLM生成** → **函数执行** → **RAG存储**

### 主要特性
- Playwright 脚本自动录制
- LLM 智能生成函数定义
- 可执行的函数代码生成
- RAG 向量数据库存储与检索
- 多标签页工作流管理

## 界面设计规范

### 整体布局
- 使用 Ant Design Pro 的 `PageContainer` 作为主容器
- 采用 `Tabs` 组件实现三个功能模块切换
- 统一的卡片式布局风格

### Tab 1: Function 描述
**组件配置:**
```typescript
// 使用 ProCard 包装整体布局
<ProCard title="Tab-Function 描述" headerBordered>
  <ProForm layout="vertical">
    // Function name 输入框
    <ProFormText
      name="functionName"
      label="Function name"
      placeholder="请输入函数名称"
      rules={[{ required: true }]}
    />
    
    // Playwright 脚本文本域
    <ProFormTextArea
      name="playwrightScript"
      label="Playwright脚本"
      placeholder="请输入或粘贴 Playwright 录制的脚本"
      rows={8}
      rules={[{ required: true }]}
    />
    
    // 基础功能描述
    <ProFormTextArea
      name="basicDescription"
      label="基础功能描述"
      placeholder="这是..."
      rows={2}
    />
    
    // 输出描述
    <ProFormTextArea
      name="outputDescription"
      label="输出描述"
      placeholder="如：返回会话ID和用户信息，供后续操作使用"
      rows={2}
    />
    
    // 依赖Function
    <ProFormText
      name="dependencies"
      label="依赖Function"
      placeholder="多选"
    />
  </ProForm>
  
  // 生成按钮
  <Button type="primary" size="large">
    生成LLM Function定义 & Executor
  </Button>
</ProCard>
```

### Tab 2: LLM Function定义
**组件配置:**
```typescript
<ProCard title="Tab-LLM Function定义" headerBordered>
  <Row gutter={16}>
    <Col span={24}>
      // 操作按钮组
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">生成RAG Request</Button>
        <Button>导出文件</Button>
      </Space>
      
      // LLM Function定义编辑器
      <ProCard title="LLM Function定义" size="small">
        <CodeMirror
          value={functionDefinition}
          height="300px"
          extensions={[javascript()]}
          theme={vscodeDark}
        />
      </ProCard>
    </Col>
  </Row>
  
  <Row gutter={16} style={{ marginTop: 16 }}>
    <Col span={18}>
      // RAG Request编辑器
      <ProCard title="RAG Request" size="small">
        <CodeMirror
          value={ragRequest}
          height="200px"
          extensions={[json()]}
          theme={vscodeDark}
        />
      </ProCard>
    </Col>
    <Col span={6}>
      <Button type="primary" block>
        入库RAG
      </Button>
    </Col>
  </Row>
</ProCard>
```

### Tab 3: LLM Function Executor
**组件配置:**
```typescript
<ProCard title="Tab-LLM Function Executor" headerBordered>
  <Row>
    <Col span={24}>
      <Space style={{ marginBottom: 16, float: 'right' }}>
        <Button>导出文件</Button>
      </Space>
      
      // LLM Function Executor 代码编辑器
      <ProCard title="LLM Function Executor" size="small">
        <CodeMirror
          value={executorCode}
          height="400px"
          extensions={[javascript()]}
          theme={vscodeDark}
          readOnly={false}
        />
      </ProCard>
    </Col>
  </Row>
</ProCard>
```

## 技术实现要点

### 依赖组件
```json
{
  "@ant-design/pro-components": "^2.x",
  "@uiw/react-codemirror": "^4.x",
  "@codemirror/lang-javascript": "^6.x",
  "@codemirror/lang-json": "^6.x",
  "@codemirror/theme-one-dark": "^6.x"
}
```

### 状态管理
```typescript
interface TabFunctionState {
  activeTab: string;
  functionDefinition: string;
  ragRequest: string;
  executorCode: string;
  formData: {
    functionName: string;
    playwrightScript: string;
    basicDescription: string;
    outputDescription: string;
    dependencies: string[];
  };
}
```

### API 接口设计
```typescript
// 生成 LLM Function
POST /api/generate-function
{
  functionName: string;
  playwrightScript: string;
  description: string;
  outputDesc: string;
  dependencies: string[];
}

// 保存到 RAG
POST /api/rag/store
{
  functionDefinition: string;
  metadata: object;
}

// 导出文件
GET /api/export/{type}?format=js|json
```

## 交互流程

### 主要操作流程
1. **Tab 1** - 用户输入基础信息和 Playwright 脚本
2. 点击"生成"按钮，系统调用 LLM 生成函数定义和执行器
3. **Tab 2** - 显示生成的 LLM Function 定义，用户可编辑
4. 生成 RAG Request JSON，支持入库操作
5. **Tab 3** - 显示可执行的函数代码，支持测试和导出

### 响应式适配
- 移动端：Tab 垂直堆叠，编辑器高度自适应
- 桌面端：Tab 水平排列，固定编辑器高度
- 按钮组自适应：小屏幕垂直排列，大屏幕水平排列

## 扩展功能

### 高级特性
- 函数版本管理
- 批量脚本处理
- 模板库管理
- 执行日志记录
- RAG 智能检索推荐

### 集成能力
- Playwright 录制器直接集成
- Git 版本控制
- CI/CD 流水线集成
- 团队协作功能