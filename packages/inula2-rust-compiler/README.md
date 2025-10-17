## openInula 2.0 编译器（Rust 版）

本仓库提供 openInula 2.0 的 Rust 实现，面向“编译时响应式”（Compile-time Reactivity）。源码位于 `src`，包含：

- `jsx_parser::JsxParser`：将 JSX/JS 表达式解析为中间视图单元（`ViewUnit`）数组，并进行模板动静分离。
- `reactivity_parser::ReactivityParser`：对视图单元与表达式进行依赖分析，产出依赖位图与缓存。
- `generator::Generator`：基于视图单元与依赖信息生成可执行 JavaScript 代码（创建 DOM、绑定属性与事件等）。
- 顶层导出函数：`compile_jsx`、`analyze_reactivity`、`generate_code`（均可在 WASM 环境中直接调用）。

### 设计要点

- **编译期依赖追踪**：通过 SWC 解析 AST，抽取标识符依赖，使用 `bitvec` 维护位图（`DependencyInfo.total_bitmap`）。
- **动静分离与模板提升**：`JsxParser` 会把纯静态结构提升为 `TemplateUnit.template`，动态点记录在 `TemplateUnit.mutable_units` 与 `TemplateUnit.props`。
- **事件与属性**：事件以 `onXxx` 识别并标记为 `is_event`，在依赖分析阶段跳过；普通属性根据是否存在依赖决定是静态还是动态设置。
- **结构化 IR（ViewUnit）**：支持 `Html/Text/Exp/For/If/Fragment/Context/Suspense/Template/State/Computed` 等多种单元，便于后端生成器按需处理。

### 导出 API（WASM）

- `compile_jsx(jsx: &str) -> JsValue`：解析 JSX/JS 代码，返回 `Vec<ViewUnit>` 的 JSON 字符串。
- `analyze_reactivity(view_unit_json: &str) -> JsValue`：对视图单元 JSON 做依赖分析，返回 `DependencyInfo` 的 JSON。
- `generate_code(view_unit_json: &str, dep_info_json: &str) -> JsValue`：基于视图单元与依赖信息生成 JavaScript 代码字符串。

示例（概念流程）：

```js
// 伪代码，假设已通过 wasm-pack 构建并引入
import { compile_jsx, analyze_reactivity, generate_code } from 'inula2-rust-compiler-wasm-pkg';

const jsx = `<template><div className="card">{count}</div><button onClick={handleClick}>Click</button></template>`;
const viewUnitJson = compile_jsx(jsx);               // string(JSON)
const depInfoJson = analyze_reactivity(viewUnitJson); // string(JSON)
const code = generate_code(viewUnitJson, depInfoJson); // string(JS)
```

对应实现位置：

```1201:1217:src/lib.rs
#[wasm_bindgen]
pub fn compile_jsx(jsx: &str) -> Result<JsValue, JsValue> { /* ... */ }

#[wasm_bindgen]
pub fn analyze_reactivity(view_unit_json: &str) -> Result<JsValue, JsValue> { /* ... */ }

#[wasm_bindgen]
pub fn generate_code(view_unit_json: &str, dep_info_json: &str) -> Result<JsValue, JsValue> { /* ... */ }
```

### 视图单元与数据结构

核心类型定义见 `src/types.rs`：

```102:116:src/types.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ViewUnit {
    Html(HtmlUnit),
    Text(TextUnit),
    Exp(ExpUnit),
    For(ForUnit),
    If(IfUnit),
    Fragment(FragmentUnit),
    Context(ContextUnit),
    Suspense(Box<SuspenseUnit>),
    Template(TemplateUnit),
    State(StateUnit),
    Computed(ComputedUnit),
}
```

部分关键结构：

- `HtmlUnit { tag, props, children }`：普通元素；`props` 中依赖为空且非事件的属性会在模板阶段当作静态属性提升。
- `TemplateUnit { template, mutable_units, props }`：`template` 为纯静态骨架；`mutable_units` 记录表达式/循环等动态节点路径；`props` 收集动态/事件属性并记录路径。
- `PropValue { value, dep_id_bitmap, dependencies, is_event }`：属性值与其依赖信息；事件为 `is_event=true`。
- `DependencyInfo { dependencies, total_bitmap, cache }`：分析结果，包含依赖名→位索引映射、总位图，以及复杂表达式缓存。

对应实现位置：

```1167:1199:src/lib.rs
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyInfo { /* ... */ }

impl DependencyInfo { /* add_dependency / merge ... */ }
```

### 模块功能概览

- `jsx_parser::JsxParser`
  - 入口：`JsxParser::parse(&self, code: &str) -> Result<JsValue, JsValue>`
  - 能力：
    - 解析 `JSXElement/JSXFragment`，识别 `Context`、`Suspense`、`For`、`If`、普通 `HTML` 标签；
    - 识别 `useState` 形式的状态声明为 `ViewUnit::State`；
    - 将静态结构提升为模板，动态部分收集到 `TemplateUnit.mutable_units/props`；
    - 属性表达式通过 `ReactivityParser::analyze_expression_str` 获取依赖集合与位图长度，用于后续生成。

- `reactivity_parser::ReactivityParser`
  - 入口：`analyze(&mut self, view_unit_json)` 与 `analyze_expression_str(&mut self, expr)`
  - 能力：
    - 解析 `ViewUnit` JSON，递归分析节点与属性（跳过 `is_event`）；
    - 解析 JS 表达式，收集标识符依赖，复杂对象/数组表达式写入 `cache`；
    - 产出 `DependencyInfo`：依赖名→位索引、位图与缓存。

- `generator::Generator`
  - 入口：`generate(&self, view_unit_json, dep_info_json)`
  - 能力：
    - 生成 `useState`/计算属性声明（基于 `ViewUnit::State/Computed`）；
    - 为 `Html/Template/Text/For` 等节点生成 `document.createElement/textNode` 与属性/事件设置；
    - 根据 `TemplateProp.path` 与 `MutableUnit.path` 生成动态节点引用与插入逻辑。

实现位置示例：

```17:75:src/lib.rs
pub mod jsx_parser { /* JsxParser::parse / transform_template / generate_template ... */ }
```

```729:958:src/lib.rs
pub mod reactivity_parser { /* ReactivityParser::{analyze, analyze_expression_str, analyze_view_unit} ... */ }
```

```961:1164:src/lib.rs
pub mod generator { /* Generator::{generate, generate_view_unit, get_node_ref} ... */ }
```

### 构建与使用

先决条件：

- Rust stable 工具链
- Node.js（用于打包 WASM/NAPI 与示例）

构建（推荐）：

```bash
# 构建 WASM 包（Node.js 目标）
npm run build:wasm

# 构建 NAPI 原生扩展（如需）
npm run build:napi

# 构建 Node.js 封装（如需）
npm run build:nodejs

# 一次性构建全部
npm run build:all
```

脚本来源：`package.json` 中的 `scripts`。

### 使用示例

在 Node.js 中通过 WASM 包（以 `wasm-pack` 产物为例）：

```js
import { compile_jsx, analyze_reactivity, generate_code } from './src/wasm/pkg';

const jsx = `<div className="card">{count + 1}</div>`;
const viewUnitJson = compile_jsx(jsx).toString();
const depInfoJson = analyze_reactivity(viewUnitJson).toString();
const code = generate_code(viewUnitJson, depInfoJson).toString();
console.log(code);
```

在 Rust/WASM 环境中直接调用（省略 wasm 绑定初始化）：

```rust
use inula2_rust_compiler::{compile_jsx, analyze_reactivity, generate_code};

let jsx = r#"<template><button onClick={handleClick}>{count}</button></template>"#;
let view_unit = compile_jsx(jsx).unwrap();
let view_unit_json = view_unit.as_string().unwrap();
let dep_info = analyze_reactivity(&view_unit_json).unwrap();
let dep_info_json = dep_info.as_string().unwrap();
let code = generate_code(&view_unit_json, &dep_info_json).unwrap();
println!("{}", code.as_string().unwrap());
```

### 行为细节与约束

- 表达式到字符串：`JsxParser` 对部分表达式（标识符、字面量、对象字面量、`array.map(arrow)`）进行字符串化；其他情况回退到 SWC 代码生成并去除末尾分号。
- 事件识别：属性名以 `on` 开头且第三个字符为大写字母时标记为事件（如 `onClick`）。事件不会参与依赖分析，仅在代码生成阶段添加 `addEventListener`。
- 复杂表达式缓存：包含 `{` 或 `[` 的表达式会写入 `DependencyInfo.cache`，用于潜在的二次利用或跳过重复计算。
- `For`/`If`：
  - `For` 要求最少提供 `array` 与 `item` 属性，内部子节点作为循环体；
  - `If` 由若干分支组成，每个分支通过 `condition` 指定条件，子节点作为该分支的内容。

### 工具函数

位图工具位于 `src/utils.rs`：

- `merge_bitmaps(bitmaps: &[BitVec<u8>]) -> BitVec<u8>`：合并多个位图。
- `bitmap_to_string(bitmap: &BitVec<u8>) -> String`：位图转字符串（如 `101001`）。
- `get_dependencies_from_bitmap(bitmap: &BitVec<u8>, reactive_map: &HashMap<String, usize>) -> Vec<String>`：从位图和依赖表反查依赖名。

### 开发与测试

常用脚本：

```bash
npm test            # 运行单元/集成/性能测试（如有对应目录与脚本）
npm run clean       # 清理构建产物
npm run benchmark   # 运行基准（如有对应目录与脚本）
```

仓库工作区（`Cargo.toml`）定义了 `src/napi` 与 `src/wasm` 两个子包，可分别用于 NAPI 扩展与 WASM 产物。

### 许可证

MIT
