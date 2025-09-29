# OpenInula 2.0 文档中心

欢迎来到OpenInula 2.0编译器文档中心！这里包含了完整的技术文档、API参考、开发指南和示例代码。

## 📚 文档导航

### 核心文档

- **[API参考](./API_REFERENCE.md)** - 完整的API文档和函数说明
- **[架构文档](./ARCHITECTURE.md)** - 深入的技术架构和设计原理
- **[开发者指南](./DEVELOPER_GUIDE.md)** - 开发环境设置和最佳实践
- **[性能优化指南](./PERFORMANCE_GUIDE.md)** - 性能优化策略和调优技巧
- **[API参考](./API_REFERENCE.md)** - 详细的使用示例和代码演示

### 快速开始

#### 1. 安装和设置

```bash
# 克隆项目
git clone https://github.com/your-org/inula2-rust-compiler.git
cd inula2-rust-compiler

# 安装依赖
cargo build
npm install
```

#### 2. 基本使用

```rust
use inula_compiler_wasm::compile_jsx;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let jsx_code = r#"
        function MyComponent({ name }) {
            const [count, setCount] = useState(0);
            return <div>Hello {name}, count: {count}</div>;
        }
    "#;

    let compiled = compile_jsx(jsx_code)?;
    println!("编译结果: {}", compiled);
    Ok(())
}
```

#### 3. 高级配置

```rust
use inula_compiler_wasm::{compile_with_options, CompileOptions, OptimizationLevel, Platform};

let options = CompileOptions {
    optimization_level: OptimizationLevel::Advanced,
    target_platform: Platform::Web,
    enable_analysis: true,
    enable_codegen: true,
    html_tags: vec!["div".to_string(), "span".to_string()],
};

let result = compile_with_options(jsx_code, options)?;
```

## 🏗️ 架构概览

OpenInula 2.0编译器采用模块化架构，主要包含以下核心组件：

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   源代码输入     │───▶│   分析器        │───▶│   IR构建器      │
│  (JSX/TSX)     │    │  (Analyzer)    │    │  (IR Builder)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   优化代码输出   │◀───│   代码生成器     │◀───│   位图管理器     │
│  (JavaScript)   │    │  (Generator)   │    │  (BitManager)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 核心特性

- **编译时响应式**: 在编译阶段完成依赖分析和更新路径规划
- **精准更新**: 只更新受影响的DOM节点，避免大范围diff
- **位图依赖**: 使用位运算进行高效的依赖关系管理
- **静态提升**: 将静态部分提前编译和优化
- **多平台支持**: 支持WASM和NAPI两种编译目标

## 🚀 主要功能

### 1. 响应式解析器

```rust
use inula_compiler_wasm::reactivity_parser::{ReactivityParser, ReactivityParserConfig};

let config = ReactivityParserConfig {
    reactivity_func_names: vec!["useState".to_string(), "useEffect".to_string()],
    untrack_func_names: vec!["untrack".to_string()],
};

let parser = ReactivityParser::new(config);
let dependencies = parser.collect_dependencies(&expression);
```

### 2. 访问者模式

```rust
use inula_compiler_wasm::visitor::{StateAnalyzer, JSXAnalyzer, VisitorDispatcher};

let mut dispatcher = VisitorDispatcher::new();
dispatcher.add_visitor(Box::new(StateAnalyzer::new()));
dispatcher.add_visitor(Box::new(JSXAnalyzer::new()));
```

### 3. 位图管理

```rust
use inula_compiler_wasm::bit_manager::BitManager;

let mut bit_manager = BitManager::new();
let count_bit = bit_manager.allocate_state_bit("count");
let name_bit = bit_manager.allocate_state_bit("name");
```

## 📖 文档结构

### API参考
- **WASM模块API**: 浏览器环境的WebAssembly编译
- **NAPI模块API**: Node.js环境的原生模块编译
- **响应式解析器API**: 依赖分析和位图管理
- **访问者模式API**: AST遍历和状态分析
- **性能优化API**: 缓存管理和性能监控

### 架构文档
- **核心组件**: 分析器、IR构建器、代码生成器
- **编译流程**: 从源码到优化代码的完整流程
- **性能优化**: 位图优化、缓存策略、静态提升
- **扩展性设计**: 插件系统和配置管理

### 开发者指南
- **环境准备**: 开发环境设置和工具配置
- **项目结构**: 代码组织和模块划分
- **开发流程**: 功能开发、测试、代码审查
- **最佳实践**: 错误处理、性能优化、内存管理

### 性能优化指南
- **编译时优化**: 静态分析、依赖分析、位图管理
- **运行时优化**: 精准更新、缓存策略、并发处理
- **性能监控**: 基准测试、性能分析、内存监控
- **调优技巧**: 编译器优化、算法优化、平台特定优化

### 使用示例
- **基本使用**: 简单组件编译和配置
- **高级功能**: 自定义分析器、响应式依赖分析
- **性能优化**: 缓存优化、并行编译
- **错误处理**: 详细错误信息和修复建议
- **集成示例**: 与Webpack、Vite、Next.js集成

## 🔧 开发工具

### 推荐工具

- **IDE**: VS Code with rust-analyzer
- **调试器**: LLDB 或 GDB
- **性能分析**: perf, valgrind
- **测试框架**: criterion, proptest
- **文档生成**: rustdoc

### 开发命令

```bash
# 编译项目
cargo build

# 运行测试
cargo test

# 代码格式化
cargo fmt

# 代码检查
cargo clippy

# 生成文档
cargo doc --open

# 运行基准测试
cargo bench
```

## 📊 性能指标

### 编译性能

- **小型组件** (< 100行): < 10ms
- **中型组件** (100-1000行): < 100ms
- **大型组件** (> 1000行): < 500ms

### 内存使用

- **基础内存**: ~10MB
- **大型项目**: ~50MB
- **峰值内存**: < 100MB

### 优化效果

- **运行时性能**: 提升 2-5x
- **内存使用**: 减少 30-50%
- **包大小**: 减少 20-40%

## 🤝 贡献指南

### 如何贡献

1. **Fork项目**: 创建自己的分支
2. **开发功能**: 遵循开发指南和最佳实践
3. **编写测试**: 确保测试覆盖充分
4. **提交PR**: 提供清晰的描述和测试结果

### 代码规范

- 遵循Rust官方编码规范
- 使用rustfmt格式化代码
- 使用clippy检查代码质量
- 编写完整的文档注释

### 测试要求

- 单元测试覆盖率 > 80%
- 集成测试覆盖主要功能
- 性能测试验证优化效果
- 一致性测试确保输出正确

## 📞 支持与反馈

### 获取帮助

- **GitHub Issues**: 报告bug和功能请求
- **Discussions**: 技术讨论和问题解答
- **文档**: 查看详细的技术文档
- **示例**: 参考使用示例和最佳实践

### 联系方式

- **项目主页**: https://github.com/your-org/inula2-rust-compiler
- **文档站点**: https://your-org.github.io/inula2-rust-compiler
- **问题反馈**: https://github.com/your-org/inula2-rust-compiler/issues

## 📄 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](../LICENSE) 文件。

## 🙏 致谢

感谢所有为OpenInula 2.0项目做出贡献的开发者，以及Rust社区和前端工具链生态的支持。

---

**开始使用OpenInula 2.0编译器，体验编译时响应式的强大功能！** 🚀
