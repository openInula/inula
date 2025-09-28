# OpenInula 2.0 Rust 编译器 API 参考

## 概述

OpenInula 2.0 Rust 编译器提供了两个主要的编译目标：
- **WASM模块**: 用于浏览器环境的WebAssembly编译
- **NAPI模块**: 用于Node.js环境的原生模块编译

## WASM模块 API

### 核心编译函数

#### `compile_jsx(code: &str) -> Result<String, CompilerError>`

将JSX/TSX代码编译为优化的JavaScript代码。

**参数:**
- `code`: 输入的JSX/TSX源代码字符串

**返回值:**
- `Ok(String)`: 编译后的JavaScript代码
- `Err(CompilerError)`: 编译错误信息

**示例:**
```rust
use inula_compiler_wasm::compile_jsx;

let jsx_code = r#"
function MyComponent({ name }) {
  const [count, setCount] = useState(0);
  return <div>Hello {name}, count: {count}</div>;
}
"#;

match compile_jsx(jsx_code) {
    Ok(compiled_code) => println!("编译成功: {}", compiled_code),
    Err(error) => eprintln!("编译错误: {}", error),
}
```

#### `compile_with_options(code: &str, options: CompileOptions) -> Result<CompiledResult, CompilerError>`

使用自定义选项编译JSX代码。

**参数:**
- `code`: 输入的JSX/TSX源代码字符串
- `options`: 编译选项配置

**编译选项:**
```rust
pub struct CompileOptions {
    pub optimization_level: OptimizationLevel,  // 优化级别
    pub target_platform: Platform,              // 目标平台
    pub enable_analysis: bool,                  // 启用分析功能
    pub enable_codegen: bool,                   // 启用代码生成
    pub html_tags: Vec<String>,                 // HTML标签列表
}
```

### 分析器API

#### `analyze_component(code: &str) -> Result<ComponentNode, CompilerError>`

分析JSX代码并提取组件信息。

**返回值:**
- `ComponentNode`: 包含组件结构、状态、属性等信息的节点

#### `extract_dependencies(code: &str) -> Result<Vec<Dependency>, CompilerError>`

提取代码中的响应式依赖关系。

**返回值:**
- `Vec<Dependency>`: 依赖关系列表

### 位图管理器API

#### `BitManager`

管理响应式状态的位图依赖关系。

```rust
impl BitManager {
    pub fn new() -> Self;
    pub fn allocate_state_bit(&mut self, state_name: &str) -> u32;
    pub fn get_state_bit(&self, state_name: &str) -> Option<u32>;
    pub fn get_dependency_bits(&self, state_name: &str) -> u32;
    pub fn has_dependency(&self, state_name: &str, other_state: &str) -> bool;
}
```

## NAPI模块 API

### 核心编译函数

#### `compile(code: &str) -> Result<String, CompilerError>`

Node.js环境下的JSX编译函数。

**参数:**
- `code`: 输入的JSX/TSX源代码字符串

**返回值:**
- `Ok(String)`: 编译后的JavaScript代码
- `Err(CompilerError)`: 编译错误信息

#### `compile_with_config(code: &str, config: CompilerConfig) -> Result<CompiledResult, CompilerError>`

使用配置对象编译JSX代码。

**配置选项:**
```rust
pub struct CompilerConfig {
    pub optimization_level: OptimizationLevel,
    pub target_platform: Platform,
    pub enable_reactivity_analysis: bool,
    pub enable_dependency_tracking: bool,
    pub html_tags: Vec<String>,
}
```

### 性能优化API

#### `PerformanceOptimizer`

提供编译性能优化功能。

```rust
impl PerformanceOptimizer {
    pub fn new() -> Self;
    pub fn optimize_compilation(&mut self, code: &str) -> Result<String, CompilerError>;
    pub fn get_cache_stats(&self) -> (usize, bool);
    pub fn clear_cache(&mut self);
}
```

#### `StringParserOptimizer`

字符串解析优化器。

```rust
impl StringParserOptimizer {
    pub fn find_char_optimized(s: &str, start: usize, target: char) -> Option<usize>;
    pub fn find_any_char_optimized(s: &str, start: usize, targets: &[char]) -> Option<(usize, char)>;
    pub fn count_matches_optimized(s: &str, pattern: &str) -> usize;
}
```

## 响应式解析器API

### `ReactivityParser`

响应式解析器，用于分析代码中的响应式依赖。

```rust
impl ReactivityParser {
    pub fn new(config: ReactivityParserConfig) -> Self;
    pub fn collect_dependencies(&self, expr: &Expr) -> Dependency;
    pub fn set_reactive_map(&mut self, reactive_map: HashMap<String, u32>);
}
```

**配置选项:**
```rust
pub struct ReactivityParserConfig {
    pub reactivity_func_names: Vec<String>,
    pub untrack_func_names: Vec<String>,
}
```

### 辅助函数

#### `get_dependencies_from_node(node: &Expr, reactive_bit_map: &HashMap<String, u32>, reactivity_func_names: &[String]) -> CompilerResult<Option<Dependency>>`

从AST节点中提取依赖关系。

#### `traverse_expression<F>(expr: &Expr, visitor: F)`

遍历表达式并应用访问者函数。

## 访问者模式API

### `Visitor` trait

访问者模式的基础trait。

```rust
pub trait Visitor {
    fn visit_stmt(&mut self, stmt: &Stmt, context: &mut VisitContext) -> CompilerResult<()>;
    fn visit_expr(&mut self, expr: &Expr, context: &mut VisitContext) -> CompilerResult<()>;
}
```

### `StateAnalyzer`

状态分析器，用于分析组件状态。

```rust
impl StateAnalyzer {
    fn is_use_state_call(&self, call_expr: &CallExpr) -> bool;
    fn handle_use_state(&self, call_expr: &CallExpr, context: &mut VisitContext) -> CompilerResult<()>;
    fn handle_state_update(&self, assign_expr: &AssignExpr, context: &mut VisitContext) -> CompilerResult<()>;
}
```

### `JSXAnalyzer`

JSX分析器，用于分析JSX结构。

```rust
impl JSXAnalyzer {
    fn analyze_jsx_element(&self, jsx_element: &JSXElement, context: &mut VisitContext) -> CompilerResult<()>;
    fn analyze_jsx_attribute(&self, attr: &JSXAttrOrSpread, context: &mut VisitContext) -> CompilerResult<()>;
    fn analyze_jsx_child(&self, child: &JSXElementChild, context: &mut VisitContext) -> CompilerResult<()>;
}
```

## 节点转换API

### `transform_node`

主要的节点转换函数。

```rust
pub fn transform_node(
    path: &mut CallExpr,
    html_tags: &[String],
    state: &mut PluginState,
    hoist: &mut dyn FnMut(Stmt),
) -> CompilerResult<bool>
```

### `PluginState`

插件状态管理。

```rust
pub struct PluginState {
    pub already_compiled: HashSet<*const CallExpr>,
    pub custom_state: HashMap<String, ComponentNode<'static>>,
}
```

## 错误处理

### `CompilerError`

编译器错误类型。

```rust
pub enum CompilerError {
    ParseError(String),
    AnalysisError(String),
    CodegenError(String),
    ValidationError(String),
}
```

### 错误处理最佳实践

```rust
use inula_compiler_wasm::CompilerError;

match compile_jsx(code) {
    Ok(result) => {
        // 处理成功结果
        println!("编译成功");
    }
    Err(CompilerError::ParseError(msg)) => {
        eprintln!("解析错误: {}", msg);
    }
    Err(CompilerError::AnalysisError(msg)) => {
        eprintln!("分析错误: {}", msg);
    }
    Err(CompilerError::CodegenError(msg)) => {
        eprintln!("代码生成错误: {}", msg);
    }
    Err(CompilerError::ValidationError(msg)) => {
        eprintln!("验证错误: {}", msg);
    }
}
```

## 性能监控

### 基准测试API

```rust
pub struct Benchmark {
    pub results: HashMap<String, BenchmarkResult>,
}

impl Benchmark {
    pub fn new() -> Self;
    pub fn start(&mut self, name: &str);
    pub fn end(&mut self, name: &str, file_count: usize, output_size: usize, success: bool, error: Option<String>);
    pub fn run_compile_benchmark(&mut self, test_cases: Vec<CompileTestCase>) -> BenchmarkResult;
}
```

### 性能统计

```rust
pub struct BenchmarkResult {
    pub total_time: Duration,
    pub file_count: usize,
    pub success_count: usize,
    pub error_count: usize,
    pub memory_usage: usize,
}
```

## 使用示例

### 基本使用

```rust
use inula_compiler_wasm::{compile_jsx, CompileOptions, OptimizationLevel};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let jsx_code = r#"
        function Counter({ initialValue = 0 }) {
            const [count, setCount] = useState(initialValue);
            return (
                <div>
                    <p>Count: {count}</p>
                    <button onClick={() => setCount(count + 1)}>
                        Increment
                    </button>
                </div>
            );
        }
    "#;

    let compiled = compile_jsx(jsx_code)?;
    println!("编译结果:\n{}", compiled);
    Ok(())
}
```

### 高级配置

```rust
use inula_compiler_wasm::{compile_with_options, CompileOptions, OptimizationLevel, Platform};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let options = CompileOptions {
        optimization_level: OptimizationLevel::Advanced,
        target_platform: Platform::Web,
        enable_analysis: true,
        enable_codegen: true,
        html_tags: vec!["div".to_string(), "span".to_string(), "button".to_string()],
    };

    let result = compile_with_options(jsx_code, options)?;
    println!("编译结果: {:?}", result);
    Ok(())
}
```

## 注意事项

1. **内存管理**: 在WASM环境中，注意内存使用和垃圾回收
2. **错误处理**: 始终检查编译结果并处理可能的错误
3. **性能优化**: 对于大型项目，考虑使用缓存和增量编译
4. **平台兼容性**: 确保目标平台支持所需的JavaScript特性

## 更新日志

- **v0.1.0**: 初始版本，支持基本的JSX编译
- **v0.2.0**: 添加响应式解析器和访问者模式
- **v0.3.0**: 完善节点转换和错误处理
- **v0.4.0**: 性能优化和基准测试支持
