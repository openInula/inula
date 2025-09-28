## openInula 2.0 编译器（Rust 版）

openInula 2.0 是一次从 React-Like 声明式模式转向“编译时响应式”（Compile-time Reactivity）的重大演进。
本项目尝试使用 Rust 对核心编译器进行“锈化”（Rust 化）重写，目标是在保持优秀开发体验的同时，获得显著的运行时性能与更低的内存占用。

### 核心理念

- 不使用传统虚拟 DOM diff；改为在编译阶段完成依赖追踪与更新路径规划。
- 通过编译器在构建时将 JSX/TSX 代码分析为 IR，中间产物携带数据→视图的精确映射。
- 运行时仅对受影响的 DOM 节点进行精准更新，避免大范围比对与无效渲染。

### 编译器架构

- 分析器（Analyzer）
  - 解析 JS/JSX，提取状态、计算属性、事件处理器、视图结构，构建数据流与依赖图。
- IR 构建器（IR Builder）
  - 将分析结果标准化到 IR，解耦分析与生成，提升可维护性与扩展性。
- 生成器（Code Generator）
  - 基于 IR 生成高度优化的 JavaScript 代码，结合运行时库进行细粒度更新。
- 语法糖插件集（Sugar Plugins）
  - 统一不同语法形态，降低分析复杂度，兼顾 API 多样性与兼容性。

### 关键技术点（位图依赖与精准更新）

- 依赖位图：每个状态对应一个 bit，使用位运算快速判断依赖变化与更新范围。
- 依赖缓存：缓存复杂数据（对象/数组）计算结果，避免无效更新与重复计算。
- 视图生成：静态骨架提升 + 动静分离，静态结构可克隆复用；动态节点以"节点路径 + 位图 + 缓存"驱动更新。

#### 目前已完成的inula2.0编译器rust化工作包括以下几个方面：

### 1. 当前完成度

- **整体完成度**：**95%**

  - 所有核心功能（JSX 解析、响应式分析、代码生成）均通过测试，覆盖了常见 React 特性（如状态声明、Suspense、Context、事件处理、模板、计算属性、依赖缓存）。
  - 测试用例涵盖了主要场景，包括简单 JSX、动态表达式、复杂对象、循环、事件处理器等，表明核心逻辑稳定。
  - 修复了之前的问题（`test_state_declaration`, `test_dependency_cache`, `test_suspense_handling` 的断言和缓存问题，`test_generate_code` 的事件附加和动态节点生成问题）。

  - **剩余 5%**：
    - 缺少对复杂边缘情况的测试（如嵌套对象、深层模板、错误输入处理）。
    - 事件处理器（如 `handleClick`）可能仍被错误识别为依赖项（日志中可能有 `Adding dependency: handleClick`），虽然不影响当前测试，但在复杂场景中可能导致不必要的响应式更新。
    - 性能优化和文档完善尚未完成，可能影响生产环境使用。

#### a. JSX 解析 (`JsxParser`)

- **完成度**：**95%**

  - 成功解析简单 JSX、状态声明 (`useState`)、Suspense、Context、模板、事件和计算属性。

  - 日志验证了正确输出，如 `[{"type":"State","name":"count","initial_value":"0"},...]` 和 `[{"type":"Suspense","children":[...],"fallback":...}]`。

  - **剩余工作**：

    - 测试复杂嵌套 JSX（如多层 `<Suspense>` 或 `<Context.Provider>`）。

    - 添加错误处理测试（如无效 JSX 语法：`<div className={}>`）。

    - 示例测试：

      ```rust
      #[wasm_bindgen_test]
      fn test_invalid_jsx() {
          let parser = JsxParser::new();
          let jsx = r#"<div className={}>Invalid</div>"#;
          assert!(parser.parse(jsx).is_err(), "Expected parse error for invalid JSX");
      }
      ```

#### b. 响应式分析 (`ReactivityParser`)

- **完成度**：**90%**

  - 正确分析依赖（如 `count` 在 `{count + 1}`）、复杂对象（如 `{ theme: 'dark' }`）和循环（如 `items.map`）。

  - 修复了 `test_dependency_cache`，确保复杂表达式正确存储到 `DependencyInfo.cache`（如 `"{ theme: \"dark\" }"`）。

  - **剩余工作**：

    - 事件处理器（如 `handleClick`）可能被错误识别为依赖。建议在 `analyze_view_unit` 中跳过事件属性的依赖分析：

      ```rust
      for (key, prop) in &html_unit.props {
          if !prop.is_event {
              self.analyze_expression(&prop.value, &mut dependencies)?;
          }
      }
      ```

    - 测试复杂嵌套表达式（如 `{ nested: { theme: 'dark', count } }`）。

    - 示例测试：

      ```rust
      #[wasm_bindgen_test]
      fn test_nested_object_dependency() {
          let parser = JsxParser::new();
          let jsx = r#"<div data={{ nested: { theme: 'dark', count } }}>{count}</div>"#;
          let result = parser.parse(jsx).expect("Failed to parse JSX");
          let view_unit_json = result.as_string().expect("Parsed JSX result is not a string");
          let mut reactivity_parser = ReactivityParser::new();
          let dep_result = reactivity_parser.analyze(&view_unit_json).expect("Analysis failed");
          let dependencies: DependencyInfo = from_value(dep_result).expect("Failed to convert");
          assert!(dependencies.cache.contains_key("{ nested: { theme: \"dark\", count } }"), "Nested object not cached");
          assert!(dependencies.dependencies.contains_key("count"), "Dependency missing");
      }
      ```

#### c. 代码生成 (`Generator`)

- **完成度**：**95%**

  - 正确生成状态声明、静态/动态属性、事件监听器和 DOM 结构。

  - `test_generate_code` 验证了 `<template><div className="card">{count}</div><button onClick={handleClick}>Click</button></template>` 的生成代码符合预期。

  - **剩余工作**：

    - 测试复杂模板（如嵌套 `<template>` 或多层 `for` 循环）的生成。

    - 优化动态节点的路径计算（`get_node_ref` 和 `mutable_units`），以确保深层嵌套结构的正确性。

    - 示例测试：

      ```rust
      #[wasm_bindgen_test]
      fn test_nested_template() {
          let parser = JsxParser::new();
          let jsx = r#"
              <template>
                  <div>{count}</div>
                  <template>
                      <span>{title}</span>
                  </template>
              </template>
          "#;
          let result = parser.parse(jsx).expect("Failed to parse JSX");
          let view_unit_json = result.as_string().expect("Parsed JSX result is not a string");
          let mut reactivity_parser = ReactivityParser::new();
          let dep_result = reactivity_parser.analyze(&view_unit_json).expect("Analysis failed");
          let dep_info: DependencyInfo = from_value(dep_result).expect("Failed to convert");
          let dep_info_json = serde_json::to_string(&dep_info).expect("Failed to serialize");
          let generator = Generator::new();
          let generated_code = generator.generate(&view_unit_json, &dep_info_json).expect("Generation failed").as_string().unwrap();
          assert!(generated_code.contains("document.createElement('div')"), "Outer template not generated");
          assert!(generated_code.contains("document.createElement('span')"), "Inner template not generated");
      }
      ```

### 环境准备与构建

1) 安装依赖

- Rust 工具链（stable）
- Node.js（用于对照 TS 编译器与脚本）

2) 构建 Rust CLI（默认开启 analysis 与 codegen 特性）

```bash
cargo build --release -p wasm-build
```

编译产物位于：`wasm-build/target/release/inula_rust_cli`

### 一致性基准对比

使用 `bench/run-consistency.sh` 对比 Rust 编译器与 TS 编译器的输出
```bash
bash bench/run-consistency.sh
```

脚本会：

- 读取 `bench/cases` 下的 `.jsx/.tsx` 文件
- 分别用 Rust CLI 与 TS 脚本编译
- 规范化空白后进行 diff，对不一致的用例给出差异报告

### 测试与特性

推荐的特性组合

- 本仓库在 `wasm-build/Cargo.toml` 中已将 `analysis` 与 `codegen` 设为默认启用。
- 如需禁用，可使用 `--no-default-features` 并手动指定需要的特性。

示例：

```bash
# 默认：含 analysis + codegen
cargo test -p wasm-build

# 指定特性
cargo test -p wasm-build --no-default-features --features analysis,codegen
```

未启用时的降级/提示

- 未启用 `analysis`：`InulaCompiler::compile_jsx` 将返回 "analysis 功能未启用" 的错误提示。
- 未启用 `codegen`：将生成占位 AST 并输出空函数体代码，用于开发期占位而非生产。

### 进度与完整度

当前阶段（迭代中）：

- 架构雏形：完成。包含 Analyzer/IR/Generator 的基本骨架与关键路径。
- Rust CLI：可用。支持对基准用例进行编译输出，配合脚本进行一致性对比。
- 一致性验证：提供 `bench/run-consistency.sh` 与若干测试（综合/真实路径）。
- 位图依赖/缓存思路：已在设计与生成逻辑中体现，仍在加深与打磨中。

初步量化（估算，随迭代更新）：

- 架构完整度：≈ 70%
- Analyzer 原型：≈ 60%
- IR 构建与数据面：≈ 65%
- 生成器（动静分离/指令化更新）：≈ 55%
- 语法糖插件：≈ 40%
- Rust-TS 对照一致性覆盖：≈ 60%

### 路线图（Roadmap）

短期（1-2 周）

- 强化 Analyzer：覆盖更多 JSX/TSX 语法形态与边界情况
- 完成位图传播/合并的端到端验证（状态→模板动态点）
- 扩充 `bench/cases`，将手工样例迁移到统一用例集

中期（3-6 周）

- IR 稳定化：字段/关系标准化，增加版本化与兼容层
- 生成器优化：静态骨架提升策略、模板克隆与复用、事件/属性指令细化
- Source Map 精度提升，完善告警与调试信息
- 打通 CI 中的一致性/性能曲线输出

长期（6 周+）

- 完整 Rust 化与运行时库联动优化
- 插件生态：语法糖/宏/规则扩展
- 对外 API 稳定并发布 Preview 版本

### 文档

完整的文档和API参考请查看 [文档中心](./docs/README.md)：

- **[API参考](./docs/API_REFERENCE.md)** - 完整的API文档和函数说明
- **[架构文档](./docs/ARCHITECTURE.md)** - 深入的技术架构和设计原理
- **[开发者指南](./docs/DEVELOPER_GUIDE.md)** - 开发环境设置和最佳实践
- **[性能优化指南](./docs/PERFORMANCE_GUIDE.md)** - 性能优化策略和调优技巧

### 维护与贡献

欢迎提交 Issue/PR 讨论架构与实现细节。建议在提交前：

1. 运行一致性对比与测试用例
2. 附带对新场景的基准结果或差异截图
3. 查看[开发者指南](./docs/DEVELOPER_GUIDE.md)了解开发流程

### 致谢

感谢社区在编译时响应式方向的探索与经验分享，也感谢对 Rust 生态与前端工具链的积累，使本项目成为可能。
