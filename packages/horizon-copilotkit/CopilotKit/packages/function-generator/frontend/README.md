# Tab-Function Generator Frontend

基于 Playwright 脚本录制的智能化函数生成工具前端界面。

## 功能特性

### 核心流程
1. **脚本录制** → **描述增强** → **LLM生成** → **函数执行** → **RAG存储**

### 主要特性
- Playwright 脚本自动录制
- LLM 智能生成函数定义
- 可执行的函数代码生成
- RAG 向量数据库存储与检索
- 多标签页工作流管理

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件**: Ant Design Pro
- **代码编辑器**: CodeMirror 6
- **HTTP客户端**: Axios

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 界面说明

### Tab 1: Function 描述
- 输入函数名称
- 粘贴 Playwright 脚本
- 描述基础功能
- 配置输出描述和依赖关系
- 生成 LLM Function 定义和 Executor

### Tab 2: LLM Function 定义
- 查看和编辑生成的函数定义
- 生成 RAG Request JSON
- 将函数定义存储到 RAG 数据库
- 导出函数定义文件

### Tab 3: Function Executor
- 查看和编辑可执行的函数代码
- 测试代码语法
- 格式化代码
- 导出执行器文件

## API 接口

### 生成 LLM Function
```
POST /api/generate-function
```

### 保存到 RAG
```
POST /api/rag/store
```

### 导出文件
```
GET /api/export/{type}?format=js|json
```

## 项目结构

```
src/
├── components/           # UI组件
│   ├── Tab1FunctionDescription.tsx
│   ├── Tab2FunctionDefinition.tsx
│   └── Tab3FunctionExecutor.tsx
├── pages/               # 页面组件
│   └── TabFunction.tsx
├── services/            # API服务
│   └── api.ts
├── types/              # TypeScript类型定义
│   └── index.ts
├── App.tsx             # 主应用组件
└── main.tsx           # 应用入口
```

## 开发注意事项

1. 确保后端 API 服务正常运行
2. 代码编辑器使用了 OneDark 主题
3. 支持中文本地化
4. 响应式设计，适配移动端

## 扩展功能

- 函数版本管理
- 批量脚本处理
- 模板库管理
- 执行日志记录
- RAG 智能检索推荐