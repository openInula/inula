# openInula 2.0 Rust 编译器 API 参考文档

## 概述

openInula 2.0 Rust 编译器是一个高性能的编译时响应式框架编译器，将 JSX 代码编译为优化的 JavaScript 代码。本文档提供了完整的 API 参考。

## 核心架构

### 编译器架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    JSX 输入     │───▶│    分析器       │───▶│   IR 构建器     │───▶│    生成器       │
│                 │    │   (Analyzer)    │    │ (IR Builder)    │    │  (Generator)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │                        │
                                ▼                        ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
                       │   依赖分析      │    │   位图管理      │    │   代码生成      │
                       │                 │    │ (BitManager)    │    │                 │
                       └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 主要模块

### 1. 分析器 (Analyzer)

#### 1.1 变量分析器 (VariablesAnalyzer)

```rust
pub struct VariablesAnalyzer;

impl VariablesAnalyzer {
    /// 分析变量声明
    pub fn analyze_variable_declaration(&self, decl: &VarDecl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析函数声明
    pub fn analyze_function_declaration(&self, decl: &FnDecl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析表达式
    pub fn analyze_expression(&self, expr: &Expr, builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

**功能**:
- 识别响应式变量（useState, useEffect 等）
- 分析变量依赖关系
- 构建作用域信息

#### 1.2 视图分析器 (ViewAnalyzer)

```rust
pub struct ViewAnalyzer;

impl ViewAnalyzer {
    /// 分析 JSX 元素
    pub fn analyze_jsx_element(&self, element: &JSXElement, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析 JSX 属性
    pub fn analyze_jsx_attributes(&self, attrs: &[JSXAttrOrSpread], builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析 JSX 子元素
    pub fn analyze_jsx_children(&self, children: &[JSXElementChild], builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

**功能**:
- 解析 JSX 语法
- 提取视图结构
- 分析属性绑定

#### 1.3 Hook 分析器 (HookAnalyzer)

```rust
pub struct HookAnalyzer;

impl HookAnalyzer {
    /// 分析 useState Hook
    pub fn analyze_use_state(&self, call_expr: &CallExpr, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析 useEffect Hook
    pub fn analyze_use_effect(&self, call_expr: &CallExpr, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析 useMemo Hook
    pub fn analyze_use_memo(&self, call_expr: &CallExpr, builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

**功能**:
- 识别 React Hooks
- 分析 Hook 依赖
- 构建响应式关系

#### 1.4 高级分析器 (AdvancedAnalyzer)

```rust
pub struct AdvancedAnalyzer;

impl AdvancedAnalyzer {
    /// 分析高阶组件模式
    pub fn analyze_hoc_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析渲染属性模式
    pub fn analyze_render_props_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析复合组件模式
    pub fn analyze_compound_component_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析自定义 Hook 模式
    pub fn analyze_custom_hook_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析提供者模式
    pub fn analyze_provider_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析容器组件模式
    pub fn analyze_container_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析展示组件模式
    pub fn analyze_presentational_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析异步组件模式
    pub fn analyze_async_component_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
    
    /// 分析错误边界模式
    pub fn analyze_error_boundary_pattern(&self, fn_node: &Decl, builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

**功能**:
- 识别复杂的设计模式
- 分析组件架构
- 优化代码结构

### 2. IR 构建器 (IR Builder)

```rust
pub struct IRBuilder<'a> {
    pub current: ComponentNode<'a>,
    pub scope: Scope<'a>,
    pub html_tags: Vec<String>,
}

impl<'a> IRBuilder<'a> {
    /// 创建新的 IR 构建器
    pub fn new(fn_name: &'a str, type_: CompOrHook, fn_node: &'a Decl, html_tags: Vec<String>) -> Self;
    
    /// 添加状态语句
    pub fn add_state(&mut self, name: &'a str, value: Option<&'a str>, is_const: bool, is_shallow: bool) -> CompilerResult<()>;
    
    /// 添加派生语句
    pub fn add_derived(&mut self, name: &'a str, expression: &'a str, dependency: Option<Dependency>) -> CompilerResult<()>;
    
    /// 添加视图语句
    pub fn add_view(&mut self, view: ViewParticle<'a>) -> CompilerResult<()>;
    
    /// 添加原始语句
    pub fn add_raw_stmt(&mut self, stmt: String) -> CompilerResult<()>;
    
    /// 构建最终的 IR
    pub fn build(self) -> (ComponentNode<'a>, BitManager);
}
```

**功能**:
- 构建中间表示
- 管理作用域
- 处理依赖关系

### 3. 位图管理器 (BitManager)

```rust
pub struct BitManager {
    pub state_bits: HashMap<String, u32>,
    pub bit_states: HashMap<u32, String>,
    pub dependency_bits: HashMap<String, u32>,
    pub publish_bits: HashMap<String, u32>,
    pub update_cache: HashMap<String, u32>,
    pub cache_dirty: bool,
}

impl BitManager {
    /// 创建新的位图管理器
    pub fn new() -> Self;
    
    /// 注册状态位
    pub fn register_state_bit(&mut self, state_name: &str, bit: u32);
    
    /// 分配新的状态位
    pub fn allocate_state_bit(&mut self, state_name: &str) -> u32;
    
    /// 设置依赖关系
    pub fn set_dependency(&mut self, state_name: &str, dependencies: &[String]);
    
    /// 计算更新位图
    pub fn calculate_update_bits(&mut self, changed_state: &str) -> u32;
    
    /// 批量计算更新位图
    pub fn calculate_batch_update_bits(&mut self, changed_states: &[String]) -> u32;
    
    /// 清除缓存
    pub fn clear_cache(&mut self);
    
    /// 预热缓存
    pub fn warmup_cache(&mut self);
    
    /// 获取缓存统计
    pub fn get_cache_stats(&self) -> (usize, bool);
}
```

**功能**:
- 管理状态依赖位图
- 计算传递闭包
- 缓存优化

### 4. 生成器 (Generator)

#### 4.1 视图生成器 (ViewGenerator)

```rust
pub struct ViewGenerator;

impl ViewGenerator {
    /// 生成视图表达式
    pub fn generate_view_expression(&self, view: &ViewParticle, ctx: &GeneratorContext) -> CompilerResult<Expr>;
    
    /// 生成元素表达式
    pub fn generate_element_expression(&self, element: &HTMLUnit, ctx: &GeneratorContext) -> CompilerResult<Expr>;
    
    /// 生成文本表达式
    pub fn generate_text_expression(&self, text: &TextUnit, ctx: &GeneratorContext) -> CompilerResult<Expr>;
    
    /// 生成表达式单元
    pub fn generate_expression_unit(&self, expr: &ExpUnit, ctx: &GeneratorContext) -> CompilerResult<Expr>;
    
    /// 生成条件表达式
    pub fn generate_conditional_expression(&self, conditional: &IfUnit, ctx: &GeneratorContext) -> CompilerResult<Expr>;
    
    /// 生成循环表达式
    pub fn generate_loop_expression(&self, loop_unit: &ForUnit, ctx: &GeneratorContext) -> CompilerResult<Expr>;
}
```

**功能**:
- 生成视图代码
- 处理属性绑定
- 优化 DOM 操作

#### 4.2 状态生成器 (StateGenerator)

```rust
pub struct StateGenerator;

impl StateGenerator {
    /// 生成状态声明
    pub fn generate_state_declaration(&self, state: &StateStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
    
    /// 生成派生状态
    pub fn generate_derived_state(&self, derived: &DerivedStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
    
    /// 生成状态更新
    pub fn generate_state_update(&self, update: &StateUpdateStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
}
```

**功能**:
- 生成状态管理代码
- 处理响应式更新
- 优化状态访问

#### 4.3 属性生成器 (PropGenerator)

```rust
pub struct PropGenerator;

impl PropGenerator {
    /// 生成单个属性
    pub fn generate_single_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
    
    /// 生成剩余属性
    pub fn generate_rest_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
    
    /// 生成整个属性
    pub fn generate_whole_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
    
    /// 生成上下文使用
    pub fn generate_use_context(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Statement>;
}
```

**功能**:
- 生成属性处理代码
- 处理属性传递
- 优化属性访问

### 5. 语法糖插件系统

```rust
pub trait SyntacticSugarPlugin {
    /// 获取插件名称
    fn name(&self) -> &str;
    
    /// 处理 AST
    fn process(&self, ast: &mut Value) -> Result<(), String>;
    
    /// 检查是否适用
    fn is_applicable(&self, ast: &Value) -> bool;
}

pub struct SyntacticSugarPluginSet {
    plugins: HashMap<String, Box<dyn SyntacticSugarPlugin>>,
}

impl SyntacticSugarPluginSet {
    /// 创建新的插件集
    pub fn new() -> Self;
    
    /// 处理语法糖
    pub fn process(&self, ast: Value) -> Result<Value, String>;
    
    /// 获取所有插件名称
    pub fn get_plugin_names(&self) -> Vec<String>;
    
    /// 检查插件是否可用
    pub fn is_plugin_available(&self, name: &str) -> bool;
}
```

**内置插件**:
- `PropsPlugin`: 属性处理
- `HookPlugin`: Hook 优化
- `JsxSlicePlugin`: JSX 切片
- `Map2ForPlugin`: Map 转 For 循环
- `StateDestructuringPlugin`: 状态解构
- `EarlyReturnPlugin`: 早期返回
- `ClassNamesPlugin`: 类名处理
- `ConditionalPlugin`: 条件渲染
- `EventHandlerPlugin`: 事件处理
- `MemoPlugin`: Memo 优化
- `LazyPlugin`: 懒加载
- `SuspensePlugin`: Suspense 处理
- `PortalPlugin`: Portal 处理
- `ForwardRefPlugin`: ForwardRef 处理
- `ContextPlugin`: Context 处理

### 6. 错误处理系统

```rust
#[derive(Debug, Clone)]
pub struct CompilerError {
    pub phase: CompilerPhase,
    pub severity: ErrorSeverity,
    pub error_type: CompilerErrorType,
    pub message: String,
    pub suggestion: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
    pub context: Option<String>,
    pub code: Option<String>,
    pub help_url: Option<String>,
}

#[derive(Debug, Clone)]
pub enum CompilerPhase {
    Parsing,
    Analysis,
    CodeGeneration,
    Validation,
}

#[derive(Debug, Clone)]
pub enum ErrorSeverity {
    Error,
    Warning,
    Info,
}

#[derive(Debug, Clone)]
pub enum CompilerErrorType {
    ParseError,
    SyntaxError,
    TypeError,
    SemanticError,
    DependencyError,
    ReactivityError,
    JSXError,
    HookError,
    StateError,
    PropsError,
    ContextError,
    LifecycleError,
    PerformanceError,
    OptimizationError,
    MemoryError,
    ConcurrencyError,
    SecurityError,
    CompatibilityError,
    ConfigurationError,
    ResourceError,
    NetworkError,
    FileSystemError,
    PermissionError,
    FormatError,
    EncodingError,
    SerializationError,
    DeserializationError,
    ConstraintError,
    LogicError,
    ArithmeticError,
    RangeError,
    ReferenceError,
    RuntimeError,
    SystemError,
    UserError,
    InternalError,
    ExternalError,
    ThirdPartyError,
    PluginError,
    ExtensionError,
    CustomError,
}

pub struct ErrorCollector {
    errors: Vec<CompilerError>,
    warnings: Vec<CompilerError>,
    infos: Vec<CompilerError>,
}

impl ErrorCollector {
    /// 创建新的错误收集器
    pub fn new() -> Self;
    
    /// 添加错误
    pub fn add_error(&mut self, error: CompilerError);
    
    /// 添加警告
    pub fn add_warning(&mut self, warning: CompilerError);
    
    /// 添加信息
    pub fn add_info(&mut self, info: CompilerError);
    
    /// 检查是否有错误
    pub fn has_errors(&self) -> bool;
    
    /// 检查是否有警告
    pub fn has_warnings(&self) -> bool;
    
    /// 获取所有错误
    pub fn get_errors(&self) -> &[CompilerError];
    
    /// 获取所有警告
    pub fn get_warnings(&self) -> &[CompilerError];
    
    /// 获取所有信息
    pub fn get_infos(&self) -> &[CompilerError];
    
    /// 格式化所有消息
    pub fn format_all(&self) -> String;
    
    /// 获取统计信息
    pub fn get_stats(&self) -> (usize, usize, usize);
    
    /// 清除所有消息
    pub fn clear(&mut self);
}
```

**功能**:
- 结构化错误处理
- 详细的错误信息
- 错误收集和统计
- 多语言支持

## 使用示例

### 基本用法

```rust
use inula_compiler_wasm::InulaCompiler;

// 创建编译器实例
let mut compiler = InulaCompiler::new();

// 编译 JSX 代码
let jsx_code = r#"
function App() {
  const [count, setCount] = useState(0);
  return <div onClick={() => setCount(count + 1)}>{count}</div>;
}
"#;

match compiler.compile_jsx(jsx_code) {
    Ok(result) => {
        println!("编译成功: {}", result.as_string().unwrap());
    }
    Err(error) => {
        println!("编译失败: {}", error.as_string().unwrap());
    }
}
```

### 高级用法

```rust
use inula_compiler_wasm::InulaCompiler;

let mut compiler = InulaCompiler::new();

// 设置配置
compiler.set_config("optimization_level", "advanced");
compiler.set_config("target_platform", "web");

// 编译复杂组件
let complex_jsx = r#"
function ComplexComponent({ data, onUpdate }) {
  const [state, setState] = useState(data);
  const memoizedValue = useMemo(() => {
    return state.map(item => item.value * 2);
  }, [state]);
  
  useEffect(() => {
    onUpdate(memoizedValue);
  }, [memoizedValue, onUpdate]);
  
  return (
    <div className="complex-component">
      {state.map(item => (
        <div key={item.id} onClick={() => setState(prev => prev.filter(i => i.id !== item.id))}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
}
"#;

match compiler.compile_jsx(complex_jsx) {
    Ok(result) => {
        // 处理编译结果
        let compiled_code = result.as_string().unwrap();
        println!("编译后的代码: {}", compiled_code);
    }
    Err(error) => {
        // 处理编译错误
        println!("编译错误: {}", error.as_string().unwrap());
        
        // 获取详细错误信息
        if let Some(error_json) = compiler.get_last_error_json() {
            println!("错误详情: {}", error_json);
        }
    }
}
```

### 性能分析

```rust
use inula_compiler_wasm::InulaCompiler;

let mut compiler = InulaCompiler::new();

// 编译代码
compiler.compile_jsx(jsx_code)?;

// 获取性能统计
let stats = compiler.get_performance_stats();
println!("性能统计: {}", stats.as_string().unwrap());

// 重置性能统计
compiler.reset_performance_stats();
```

## 配置选项

### 编译器配置

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `optimization_level` | String | "standard" | 优化级别 (basic/standard/advanced) |
| `target_platform` | String | "web" | 目标平台 (web/node/mobile) |
| `enable_source_map` | Boolean | false | 是否生成 Source Map |
| `enable_debug_info` | Boolean | false | 是否包含调试信息 |
| `enable_hoisting` | Boolean | true | 是否启用静态提升 |
| `enable_memoization` | Boolean | true | 是否启用记忆化 |
| `enable_tree_shaking` | Boolean | true | 是否启用 Tree Shaking |

### 分析器配置

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `analyze_dependencies` | Boolean | true | 是否分析依赖关系 |
| `analyze_performance` | Boolean | true | 是否进行性能分析 |
| `analyze_security` | Boolean | false | 是否进行安全检查 |
| `max_complexity` | Number | 100 | 最大复杂度阈值 |

### 生成器配置

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `generate_comments` | Boolean | false | 是否生成注释 |
| `generate_debug_code` | Boolean | false | 是否生成调试代码 |
| `minify_output` | Boolean | true | 是否压缩输出 |
| `preserve_whitespace` | Boolean | false | 是否保留空白字符 |

## 错误代码参考

### 解析错误 (1xxx)

| 错误代码 | 错误类型 | 描述 |
|----------|----------|------|
| 1001 | ParseError | JSX 语法错误 |
| 1002 | ParseError | 缺少闭合标签 |
| 1003 | ParseError | 无效的属性语法 |
| 1004 | ParseError | 表达式语法错误 |

### 分析错误 (2xxx)

| 错误代码 | 错误类型 | 描述 |
|----------|----------|------|
| 2001 | DependencyError | 循环依赖 |
| 2002 | HookError | Hook 使用错误 |
| 2003 | StateError | 状态管理错误 |
| 2004 | PropsError | 属性传递错误 |

### 生成错误 (3xxx)

| 错误代码 | 错误类型 | 描述 |
|----------|----------|------|
| 3001 | CodeGenerationError | 代码生成失败 |
| 3002 | OptimizationError | 优化失败 |
| 3003 | MemoryError | 内存不足 |
| 3004 | PerformanceError | 性能问题 |

## 最佳实践

### 1. 性能优化

```rust
// 启用高级优化
compiler.set_config("optimization_level", "advanced");

// 启用静态提升
compiler.set_config("enable_hoisting", "true");

// 启用记忆化
compiler.set_config("enable_memoization", "true");
```

### 2. 错误处理

```rust
match compiler.compile_jsx(jsx_code) {
    Ok(result) => {
        // 成功处理
    }
    Err(error) => {
        // 获取详细错误信息
        if let Some(error_json) = compiler.get_last_error_json() {
            let error_info: serde_json::Value = serde_json::from_str(&error_json).unwrap();
            
            // 根据错误类型进行处理
            match error_info["error_type"].as_str() {
                Some("ParseError") => {
                    // 处理解析错误
                }
                Some("DependencyError") => {
                    // 处理依赖错误
                }
                _ => {
                    // 处理其他错误
                }
            }
        }
    }
}
```

### 3. 批量编译

```rust
// 批量编译多个组件
let components = vec![
    "function Component1() { return <div>Hello</div>; }",
    "function Component2() { return <span>World</span>; }",
];

for (i, component) in components.iter().enumerate() {
    match compiler.compile_jsx(component) {
        Ok(result) => {
            println!("组件 {} 编译成功", i + 1);
        }
        Err(error) => {
            println!("组件 {} 编译失败: {}", i + 1, error.as_string().unwrap());
        }
    }
}
```

## 故障排除

### 常见问题

1. **编译失败**
   - 检查 JSX 语法是否正确
   - 确认所有标签都已闭合
   - 检查表达式语法

2. **性能问题**
   - 启用高级优化
   - 检查组件复杂度
   - 使用性能分析工具

3. **内存问题**
   - 减少组件复杂度
   - 启用内存优化
   - 检查循环引用

### 调试技巧

1. **启用调试信息**
   ```rust
   compiler.set_config("enable_debug_info", "true");
   ```

2. **获取性能统计**
   ```rust
   let stats = compiler.get_performance_stats();
   println!("性能统计: {}", stats.as_string().unwrap());
   ```

3. **检查错误详情**
   ```rust
   if let Some(error_json) = compiler.get_last_error_json() {
       println!("错误详情: {}", error_json);
   }
   ```

## 更新日志

### v2.0.0 (当前版本)
- 完整的 Rust 实现
- 高性能位图依赖系统
- 企业级错误处理
- 全面的语法糖插件
- 生产环境验证

### 未来计划
- WebAssembly 支持
- 更多优化选项
- 插件系统扩展
- 性能监控工具

## 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](../CONTRIBUTING.md) 了解详细信息。

## 许可证

本项目采用 MIT 许可证。详情请查看 [LICENSE](../LICENSE) 文件。
