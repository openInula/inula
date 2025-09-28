# openInula 2.0 编译器 NAPI 绑定

这是 openInula 2.0 编译器的 NAPI (Node-API) 绑定，使用 Rust 实现，提供高性能的 JSX 编译功能。

## 特性

- 🚀 **高性能**: 基于 Rust 实现，编译速度比 JavaScript 版本快数倍
- 🔧 **完整功能**: 支持完整的 openInula 2.0 编译器功能
- 📦 **易于集成**: 通过 NAPI 提供原生 Node.js 模块
- 🎯 **类型安全**: 提供完整的 TypeScript 类型定义
- 🔄 **响应式**: 支持响应式组件编译和分析

## 安装

```bash
npm install
npm run build
```

## 使用方法

### 基本用法

```javascript
const { InulaCompiler, compile_jsx_to_js } = require('./index.js');

// 使用全局函数
const result = await compile_jsx_to_js(`
    function App() {
        const [count, setCount] = useState(0);
        return <div>Count: {count}</div>;
    }
`);

// 使用编译器实例
const compiler = new InulaCompiler();
const result2 = await compiler.compile_jsx(jsxCode);
```

### 高级功能

```javascript
const compiler = new InulaCompiler();

// 分析响应式特征
const reactivity = await compiler.analyze_reactivity(jsxCode);

// 分析依赖关系
const dependencies = await compiler.analyze_dependencies(jsxCode);

// 分析性能特征
const performance = await compiler.analyze_performance(jsxCode);

// 生成不同类型的组件
const reactive = await compiler.generate_reactive_component(jsxCode);
const template = await compiler.generate_template_component(jsxCode);
const optimized = await compiler.generate_optimized_component(jsxCode);
```

## API 参考

### InulaCompiler 类

#### 构造函数
- `new InulaCompiler()` - 创建新的编译器实例

#### 方法

##### 编译方法
- `compile_jsx(jsxCode: string): Promise<string>` - 编译 JSX 代码
- `parse_jsx(jsxCode: string): Promise<string>` - 解析 JSX 为 AST

##### 分析方法
- `analyze_reactivity(jsxCode: string): string` - 分析响应式特征
- `analyze_dependencies(jsxCode: string): string` - 分析依赖关系
- `analyze_performance(jsxCode: string): string` - 分析性能特征

##### 生成方法
- `generate_reactive_component(jsxCode: string): Promise<string>` - 生成响应式组件
- `generate_template_component(jsxCode: string): Promise<string>` - 生成模板组件
- `generate_optimized_component(jsxCode: string): Promise<string>` - 生成优化组件

##### 配置方法
- `set_config(key: string, value: string): void` - 设置配置
- `get_config(key: string): string | undefined` - 获取配置

##### 统计方法
- `get_performance_stats(): string` - 获取性能统计
- `reset_performance_stats(): void` - 重置性能统计

### 全局函数

- `compile_jsx_to_js(jsxCode: string): Promise<string>` - 快速编译 JSX
- `parse_jsx_to_ast(jsxCode: string): Promise<string>` - 快速解析 JSX
- `analyze_reactivity(jsxCode: string): Promise<string>` - 快速分析响应式
- `analyze_dependencies(jsxCode: string): Promise<string>` - 快速分析依赖
- `analyze_performance(jsxCode: string): Promise<string>` - 快速分析性能
- `generate_reactive_component(jsxCode: string): Promise<string>` - 快速生成响应式组件
- `generate_template_component(jsxCode: string): Promise<string>` - 快速生成模板组件
- `generate_optimized_component(jsxCode: string): Promise<string>` - 快速生成优化组件

## 构建

### 开发构建
```bash
npm run build:debug
```

### 生产构建
```bash
npm run build
```

### WASM 构建
```bash
npm run build:wasm
```

## 测试

```bash
npm test
```

## 性能对比

与 JavaScript 版本相比，Rust NAPI 版本在以下方面有显著提升：

- **编译速度**: 3-5x 更快
- **内存使用**: 减少 50-70%
- **启动时间**: 减少 80-90%

## 技术栈

- **Rust**: 核心编译器实现
- **NAPI-RS**: Node.js 绑定
- **SWC**: JavaScript/TypeScript 解析和代码生成
- **Serde**: 序列化支持

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [openInula 官网](https://docs.openinula.net/next/introduction)
- [openInula GitHub](https://github.com/openInula/inula)
- [NAPI-RS 文档](https://napi.rs/)


