# Inula2 编译器基准测试

基于 [JS Framework Benchmark](https://hoikanchan.github.io/js-framework-benchmark/) 标准的 Inula2 Rust 编译器与 TypeScript 编译器性能对比测试。

## 🎯 测试目标

- **性能对比**: Rust 编译器 vs TypeScript 编译器
- **性能指标**: 编译时间、内存使用、输出大小
- **测试场景**: 简单组件、响应式组件、复杂组件、大型组件
- **测试标准**: 遵循 JS Framework Benchmark 的测试方法论

## 📊 测试指标

### 核心指标
- **编译时间** (Compilation Time): 从输入代码到输出代码的总时间
- **内存使用** (Memory Usage): 编译过程中的峰值内存使用
- **输出大小** (Output Size): 生成的 JavaScript 代码大小

### 详细指标
- **解析速度** (Parsing Speed): JSX 解析阶段的时间
- **代码生成速度** (Code Generation Speed): 代码生成阶段的时间
- **增量编译** (Incremental Compilation): 修改代码后重新编译的时间
- **并发编译** (Concurrent Compilation): 多文件并发编译的时间

## 🧪 测试用例

### 1. 简单组件 (Simple Component)
- **复杂度**: 低
- **特征**: 基础 JSX 结构，无状态管理
- **预期时间**: < 1ms
- **预期大小**: 200-500 bytes

### 2. 响应式组件 (Reactive Component)
- **复杂度**: 中等
- **特征**: 包含 useState、事件处理
- **预期时间**: 1-5ms
- **预期大小**: 500-1500 bytes

### 3. 复杂组件 (Complex Component)
- **复杂度**: 高
- **特征**: 列表渲染、条件渲染、复杂状态管理
- **预期时间**: 5-20ms
- **预期大小**: 1500-5000 bytes

### 4. 大型组件 (Large Component)
- **复杂度**: 很高
- **特征**: 大量子组件、复杂业务逻辑
- **预期时间**: 20-100ms
- **预期大小**: 5000+ bytes

## 🚀 快速开始

### 运行所有基准测试
```bash
./run-benchmark.sh
```

### 运行快速基准测试
```bash
node quick-benchmark.js
```

### 运行完整基准测试
```bash
node compiler-benchmark.js
```

### 运行 Rust 基准测试
```bash
cargo bench --bench rust-benchmark
```

## 📁 文件结构

```
benchmark/
├── README.md                    # 本文档
├── benchmark-config.json        # 基准测试配置
├── run-benchmark.sh            # 运行脚本
├── quick-benchmark.js          # 快速基准测试
├── compiler-benchmark.js       # 完整基准测试
├── rust-benchmark.rs           # Rust 基准测试
├── Cargo.toml                  # Rust 依赖配置
└── reports/                    # 测试报告目录
    ├── quick-benchmark-*.json
    ├── compiler-benchmark-*.json
    └── criterion/              # Criterion HTML 报告
```

## 📈 结果解读

### 性能等级
- **优秀** (Excellent): 编译时间 < 1ms
- **良好** (Good): 编译时间 1-5ms
- **可接受** (Acceptable): 编译时间 5-20ms
- **较差** (Poor): 编译时间 > 20ms

### 内存等级
- **优秀**: 内存使用 < 10MB
- **良好**: 内存使用 10-50MB
- **可接受**: 内存使用 50-100MB
- **较差**: 内存使用 > 100MB

### 输出大小等级
- **优秀**: 输出大小 < 1KB
- **良好**: 输出大小 1-5KB
- **可接受**: 输出大小 5-20KB
- **较差**: 输出大小 > 20KB

## 🔧 配置说明

### 测试配置 (benchmark-config.json)
```json
{
  "testConfig": {
    "warmupRounds": 3,      # 预热轮数
    "testRounds": 10,       # 测试轮数
    "measurementTime": "10s", # 测量时间
    "sampleSize": 100       # 样本大小
  }
}
```

### 阈值配置
```json
{
  "thresholds": {
    "performance": {
      "excellent": "< 1ms",
      "good": "1-5ms",
      "acceptable": "5-20ms",
      "poor": "> 20ms"
    }
  }
}
```

## 📊 报告格式

### JSON 报告
- 包含详细的测试数据
- 支持程序化分析
- 包含统计信息（平均值、中位数、标准差等）

### HTML 报告
- 可视化图表
- 交互式界面
- 性能回归检测

### CSV 报告
- 便于导入 Excel 等工具
- 支持数据分析

## 🎯 预期结果

基于 JS Framework Benchmark 标准，我们期望：

### Rust 编译器优势
- **编译时间**: 比 TypeScript 快 2-5 倍
- **内存使用**: 比 TypeScript 节省 30-50%
- **输出大小**: 比 TypeScript 优化 10-20%

### 性能目标
- 简单组件: < 1ms
- 响应式组件: < 5ms
- 复杂组件: < 20ms
- 大型组件: < 100ms

## 🔍 故障排除

### 常见问题

1. **WASM 模块加载失败**
   ```bash
   cd ../wasm-build
   wasm-pack build --target nodejs --out-dir pkg
   ```

2. **TypeScript 编译器加载失败**
   ```bash
   cd ../inula
   npm install
   ```

3. **Rust 基准测试失败**
   ```bash
   cargo install cargo-criterion
   ```

### 调试模式
```bash
# 启用详细日志
DEBUG=1 node quick-benchmark.js

# 运行单个测试用例
node quick-benchmark.js --test-case=simple
```

## 📚 参考资料

- [JS Framework Benchmark](https://hoikanchan.github.io/js-framework-benchmark/)
- [Criterion.rs 文档](https://docs.rs/criterion/)
- [WebAssembly 性能指南](https://web.dev/webassembly/)
- [Rust 性能优化指南](https://doc.rust-lang.org/book/ch13-00-functional-features.html)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进基准测试！

### 添加新的测试用例
1. 在 `benchmark-config.json` 中添加测试用例配置
2. 在 `quick-benchmark.js` 中添加测试代码
3. 在 `rust-benchmark.rs` 中添加对应的 Rust 测试
4. 更新文档

### 添加新的性能指标
1. 在 `benchmark-config.json` 中定义指标
2. 在测试代码中实现测量逻辑
3. 在报告中添加可视化
4. 更新阈值配置

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

# 基准测试与一致性对比

本目录提供对 openInula 2.0 Rust 编译器的性能基准与（可选）与原版 TS 编译器的输出一致性对比。

## 先决条件
- Node.js
- 已构建 WASM 包：

```bash
npm run build:wasm
```

## 仅运行 Rust 基准

```bash
node benchmarks/index.js
```

不会依赖 TS 基线，直接对 Rust 编译流程（compile_jsx → analyze_reactivity → generate_code）做性能测量。

## 启用 TS 基线一致性对比（可选）
通过环境变量指定 TS 编译器命令，脚本会为每个用例生成同一 JSX 的 TS 输出并与 Rust 输出进行归一化对比。

- TS_BASELINE_CMD：TS 编译器的执行命令（需能从 stdin 读取 JSX，stdout 输出结果）
- TS_BASELINE_OPTS：额外参数（可选）
- SAVE_DIFF=1：当存在差异时，将 Rust/TS 输出保存到 `benchmarks/temp/diffs/`

示例：

```bash
# 方式一：子模块
# git submodule add <ts-compiler-repo> benchmarks/ts-compiler
# cd benchmarks/ts-compiler && npm i && npm run build
TS_BASELINE_CMD="node benchmarks/ts-compiler/dist/cli.js" node benchmarks/index.js

# 方式二：使用已发布包
TS_BASELINE_CMD="npx inula-ts-compiler@<version>" node benchmarks/index.js

# 方式三：使用本地 dist 路径
TS_BASELINE_CMD="node ../inula-ts-compiler/dist/cli.js" node benchmarks/index.js

# 保存差异输出
SAVE_DIFF=1 TS_BASELINE_CMD="node benchmarks/ts-compiler/dist/cli.js" node benchmarks/index.js
```

当未设置 TS_BASELINE_CMD 时，脚本会打印提示并跳过 TS 基线对比，不会中断基准测试。

## 结果与报告
脚本将输出每个场景的耗时与内存统计，并生成 `benchmarks/report.html` 简单报告。若启用 `SAVE_DIFF=1` 且发现差异，会在 `benchmarks/temp/diffs/` 下保存对应的 Rust/TS 输出，便于人工核对。



