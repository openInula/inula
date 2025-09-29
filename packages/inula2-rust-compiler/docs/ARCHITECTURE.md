# OpenInula 2.0 编译器架构文档

## 概述

OpenInula 2.0 编译器是一个基于 Rust 的编译时响应式框架编译器，旨在将传统的运行时虚拟 DOM diff 转换为编译时的依赖分析和精准更新。本文档详细描述了编译器的架构设计、核心组件和工作流程。

## 架构概览

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

## 核心组件

### 1. 分析器 (Analyzer)

分析器负责解析和理解输入的JSX/TSX代码，提取关键信息。

#### 1.1 变量分析器 (VariablesAnalyzer)

**职责:**
- 分析变量声明和初始化
- 识别响应式变量
- 处理解构赋值

**核心方法:**
```rust
impl VariablesAnalyzer {
    pub fn analyze_variable_declarator(&mut self, declarator: &VarDeclarator, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn is_reactive_variable(&self, var_name: &str, init: &Option<Box<Expr>>) -> bool;
    pub fn analyze_array_destructuring(&mut self, array_pat: &ArrayPat, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn analyze_object_destructuring(&mut self, object_pat: &ObjectPat, builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

#### 1.2 属性分析器 (PropsAnalyzer)

**职责:**
- 分析组件属性
- 处理属性类型推断
- 管理属性依赖关系

**核心方法:**
```rust
impl PropsAnalyzer {
    pub fn analyze_parameter(&mut self, param: &Param, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn analyze_object_destructuring(&mut self, object_pat: &ObjectPat, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn infer_prop_type(&self, prop_name: &str) -> String;
}
```

#### 1.3 Hook分析器 (HookAnalyzer)

**职责:**
- 分析React Hooks使用
- 识别Hook依赖关系
- 处理Hook生命周期

**核心方法:**
```rust
impl HookAnalyzer {
    pub fn analyze_hook_function<'a>(&mut self, fn_decl: &Function, builder: &mut IRBuilder<'a>) -> CompilerResult<()>;
    pub fn analyze_hook_parameter<'a>(&mut self, param: &Param, builder: &mut IRBuilder<'a>) -> CompilerResult<()>;
    pub fn is_hook_call(&self, call_expr: &CallExpr) -> bool;
}
```

#### 1.4 视图分析器 (ViewAnalyzer)

**职责:**
- 分析JSX结构
- 识别视图依赖
- 处理条件渲染和循环

**核心方法:**
```rust
impl ViewAnalyzer {
    pub fn analyze_jsx_element(&mut self, element: &JSXElement, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn analyze_jsx_attribute(&mut self, attr: &JSXAttrOrSpread, builder: &mut IRBuilder) -> CompilerResult<()>;
    pub fn analyze_jsx_child(&mut self, child: &JSXElementChild, builder: &mut IRBuilder) -> CompilerResult<()>;
}
```

### 2. 响应式解析器 (ReactivityParser)

响应式解析器是编译器的核心组件，负责分析代码中的响应式依赖关系。

#### 2.1 依赖收集

```rust
pub struct ReactivityParser {
    config: ReactivityParserConfig,
    reactive_map: HashMap<String, u32>,
}

impl ReactivityParser {
    pub fn collect_dependencies(&self, expr: &Expr) -> Dependency;
    pub fn collect_dependencies_from_expression(&self, expr: &Expr, dependencies: &mut Vec<String>, dep_bitmap: &mut u32);
}
```

#### 2.2 依赖位图

依赖位图使用位运算来高效地表示和管理依赖关系：

```rust
pub struct Dependency {
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}
```

**位图操作:**
- 每个状态对应一个位
- 使用位运算快速判断依赖关系
- 支持依赖合并和传播

#### 2.3 响应式函数检测

```rust
fn is_assignment_function(expr: &Expr, reactivity_func_names: &[String]) -> bool;
fn is_member_in_untrack_function(expr: &Expr) -> bool;
fn is_standalone_identifier(expr: &Expr) -> bool;
```

### 3. 访问者模式 (Visitor Pattern)

访问者模式提供了灵活的AST遍历机制。

#### 3.1 访问者接口

```rust
pub trait Visitor {
    fn visit_stmt(&mut self, stmt: &Stmt, context: &mut VisitContext) -> CompilerResult<()>;
    fn visit_expr(&mut self, expr: &Expr, context: &mut VisitContext) -> CompilerResult<()>;
}
```

#### 3.2 状态分析器 (StateAnalyzer)

```rust
pub struct StateAnalyzer;

impl StateAnalyzer {
    fn is_use_state_call(&self, call_expr: &CallExpr) -> bool;
    fn handle_use_state(&self, call_expr: &CallExpr, context: &mut VisitContext) -> CompilerResult<()>;
    fn handle_state_update(&self, assign_expr: &AssignExpr, context: &mut VisitContext) -> CompilerResult<()>;
}
```

#### 3.3 JSX分析器 (JSXAnalyzer)

```rust
pub struct JSXAnalyzer;

impl JSXAnalyzer {
    fn analyze_jsx_element(&self, jsx_element: &JSXElement, context: &mut VisitContext) -> CompilerResult<()>;
    fn analyze_jsx_attribute(&self, attr: &JSXAttrOrSpread, context: &mut VisitContext) -> CompilerResult<()>;
    fn analyze_jsx_child(&self, child: &JSXElementChild, context: &mut VisitContext) -> CompilerResult<()>;
}
```

#### 3.4 访问者调度器

```rust
pub struct VisitorDispatcher {
    visitors: Vec<Box<dyn Visitor>>,
}

impl VisitorDispatcher {
    pub fn add_visitor(&mut self, visitor: Box<dyn Visitor>);
    pub fn visit(&mut self, node: &Program, context: &mut VisitContext) -> CompilerResult<()>;
}
```

### 4. IR构建器 (IR Builder)

IR构建器负责将分析结果转换为中间表示。

#### 4.1 组件节点 (ComponentNode)

```rust
pub struct ComponentNode<'a> {
    pub name: Cow<'a, str>,
    pub body: Vec<IRStmt<'a>>,
    pub scope: Scope<'a>,
    pub parent: Option<Box<ComponentNode<'a>>>,
    pub version: Cow<'a, str>,
    pub is_default: bool,
    pub export_type: Cow<'a, str>,
    pub export_names: Vec<Cow<'a, str>>,
    pub events: Vec<Event<'a>>,
    pub has_async: bool,
    pub dependencies: Vec<Cow<'a, str>>,
}
```

#### 4.2 IR语句类型

```rust
pub enum IRStmt<'a> {
    State(StateStmt<'a>),
    Derived(DerivedStmt<'a>),
    Prop(PropStmt<'a>),
    ViewReturn(ViewReturnStmt<'a>),
    SubComp(SubCompStmt<'a>),
    // ... 其他语句类型
}
```

#### 4.3 作用域管理

```rust
pub struct Scope<'a> {
    pub reactive_map: HashMap<Cow<'a, str>, usize>,
    pub computed_map: HashMap<Cow<'a, str>, ComputedInfo<'a>>,
    pub used_id_bits: u32,
    pub level: u32,
    pub prop_deps: HashMap<Cow<'a, str>, Vec<Cow<'a, str>>>,
    pub is_closure: bool,
    pub event_map: HashMap<Cow<'a, str>, Event<'a>>,
    pub hooks: Vec<Cow<'a, str>>,
}
```

### 5. 位图管理器 (BitManager)

位图管理器是性能优化的核心组件。

#### 5.1 位图分配

```rust
impl BitManager {
    pub fn allocate_state_bit(&mut self, state_name: &str) -> u32;
    pub fn get_state_bit(&self, state_name: &str) -> Option<u32>;
    pub fn get_dependency_bits(&self, state_name: &str) -> u32;
    pub fn set_publish_bits(&mut self, state_name: &str, publish_bits: u32);
    pub fn has_dependency(&self, state_name: &str, other_state: &str) -> bool;
}
```

#### 5.2 依赖传播

```rust
impl BitManager {
    pub fn calculate_batch_update_bits(&mut self, changed_states: &[String]) -> u32;
    pub fn merge_bits(&self, states: &[String]) -> u32;
    pub fn get_all_states(&self) -> Vec<String>;
}
```

#### 5.3 缓存管理

```rust
impl BitManager {
    pub fn clear_cache(&mut self);
    pub fn mark_cache_dirty(&mut self);
    pub fn warmup_cache(&mut self);
    pub fn get_cache_stats(&self) -> (usize, bool);
}
```

### 6. 代码生成器 (Generator)

代码生成器将IR转换为优化的JavaScript代码。

#### 6.1 视图生成器 (ViewGenerator)

```rust
impl ViewGenerator {
    pub fn generate(&self, ir: &ComponentNode, bit_manager: &mut BitManager, ctx: &GeneratorContext) -> CompilerResult<BlockStmt>;
    pub fn generate_variable_declarations(&self, ir: &ComponentNode, bit_manager: &mut BitManager) -> Vec<Stmt>;
    pub fn generate_dependency_analysis(&self, ir: &ComponentNode, bit_manager: &mut BitManager) -> Vec<Stmt>;
}
```

#### 6.2 生成器上下文

```rust
pub struct GeneratorContext {
    pub node_name_in_update: String,
    pub hoist_fn: Box<dyn Fn(swc_ecma_ast::Stmt)>,
}
```

### 7. 节点转换器 (TransformNode)

节点转换器负责AST的转换和优化。

#### 7.1 转换管道

```rust
pub fn transform_node(
    path: &mut CallExpr,
    html_tags: &[String],
    state: &mut PluginState,
    hoist: &mut dyn FnMut(Stmt),
) -> CompilerResult<bool>
```

#### 7.2 插件状态

```rust
pub struct PluginState {
    pub already_compiled: HashSet<*const CallExpr>,
    pub custom_state: HashMap<String, ComponentNode<'static>>,
}
```

## 编译流程

### 1. 解析阶段

1. **词法分析**: 将源代码转换为token流
2. **语法分析**: 构建抽象语法树(AST)
3. **语义分析**: 验证语法正确性

### 2. 分析阶段

1. **变量分析**: 识别变量声明和响应式变量
2. **属性分析**: 分析组件属性和类型
3. **Hook分析**: 识别和处理React Hooks
4. **视图分析**: 分析JSX结构和依赖关系

### 3. 响应式分析

1. **依赖收集**: 使用响应式解析器收集依赖关系
2. **位图构建**: 构建依赖位图
3. **依赖传播**: 计算依赖传播路径

### 4. IR构建

1. **组件节点创建**: 创建组件IR节点
2. **语句生成**: 生成IR语句
3. **作用域管理**: 管理变量作用域

### 5. 代码生成

1. **视图代码生成**: 生成视图相关代码
2. **依赖代码生成**: 生成依赖管理代码
3. **优化代码生成**: 应用各种优化策略

## 性能优化策略

### 1. 位图优化

- **快速依赖检查**: 使用位运算进行O(1)的依赖检查
- **批量更新**: 支持批量状态更新
- **增量更新**: 只更新受影响的组件

### 2. 缓存策略

- **表达式缓存**: 缓存复杂表达式的计算结果
- **位置缓存**: 缓存DOM位置信息
- **依赖缓存**: 缓存依赖关系计算结果

### 3. 静态提升

- **静态骨架提升**: 将静态部分提前编译
- **模板克隆**: 复用静态模板
- **事件优化**: 优化事件处理器

### 4. 内存优化

- **对象池**: 重用对象减少GC压力
- **字符串优化**: 优化字符串操作
- **内存对齐**: 优化内存布局

## 错误处理

### 1. 错误类型

```rust
pub enum CompilerError {
    ParseError(String),
    AnalysisError(String),
    CodegenError(String),
    ValidationError(String),
}
```

### 2. 错误恢复

- **语法错误恢复**: 尝试从语法错误中恢复
- **语义错误提示**: 提供详细的错误信息
- **警告系统**: 非致命错误的警告机制

### 3. 调试支持

- **Source Map**: 支持源码映射
- **调试信息**: 保留调试信息
- **性能分析**: 提供性能分析工具

## 扩展性设计

### 1. 插件系统

- **语法糖插件**: 支持自定义语法糖
- **分析器插件**: 支持自定义分析器
- **生成器插件**: 支持自定义代码生成

### 2. 配置系统

- **编译选项**: 灵活的编译配置
- **目标平台**: 支持多平台编译
- **优化级别**: 可配置的优化策略

### 3. API设计

- **模块化设计**: 清晰的模块边界
- **类型安全**: 强类型系统
- **错误处理**: 完善的错误处理机制

## 测试策略

### 1. 单元测试

- **组件测试**: 测试各个组件的功能
- **边界测试**: 测试边界情况
- **错误测试**: 测试错误处理

### 2. 集成测试

- **端到端测试**: 完整的编译流程测试
- **一致性测试**: 与TypeScript版本的一致性测试
- **性能测试**: 性能基准测试

### 3. 基准测试

- **编译性能**: 编译速度基准
- **内存使用**: 内存使用基准
- **代码质量**: 生成代码质量评估

