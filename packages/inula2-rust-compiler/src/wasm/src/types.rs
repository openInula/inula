// types.rs
use std::borrow::Cow;
use std::collections::HashMap;
// serde derives are disabled in migration; re-enable later if needed
// 移除未使用的导入

// 导入SWC AST类型
use swc_common;
use swc_ecma_ast::Expr;

// 属性类型枚举 - 与TypeScript版保持一致
#[derive(Debug, Clone, PartialEq)]
pub enum PropType {
    SINGLE,
    REST,
    WHOLE,
}

// 属性来源枚举 - 与TypeScript版保持一致
#[derive(Debug, Clone, PartialEq)]
pub enum PropsSource {
    PROPS,
    CtxProps, // 修复命名规范
}

// 节点类型枚举 - 用于node_interface.rs文件
#[derive(Debug, Clone)]
pub enum NodeType<'a> {
    Text(Cow<'a, str>),
    HTML,
    Component,
    Fragment,
    Expression,
    For,
    If,
    Context,
    Suspense,
    Template,
    RawHtml,
    Teleport,
    Slot,
    Comment,
}

// 为了与TypeScript版保持一致，添加对JavaScript表达式的类型定义
pub struct JSExpression {
    // 这里简化处理，实际项目中可能需要更复杂的AST表示
    pub code: String,
}

// 事件定义
#[derive(Debug, Clone)]
pub struct Event<'a> {
    pub name: Cow<'a, str>,
    pub handler: Cow<'a, str>,
    pub dependencies: Vec<Cow<'a, str>>,
    pub is_capture: bool,
    pub modifiers: Vec<Cow<'a, str>>,
    pub bitmap: u32, // 简化为u32类型
}
// 与JS版对齐的中间表示结构
#[derive(Debug, Clone)]
pub struct ComponentNode<'a> {
    pub name: Cow<'a, str>,
    pub body: Vec<IRStmt<'a>>,
    pub scope: Scope<'a>,
    pub parent: Option<Box<ComponentNode<'a>>>,
    pub version: Cow<'a, str>,
    pub is_default: bool,
    pub export_type: Cow<'a, str>,
    // 新增字段以匹配原版
    pub export_names: Vec<Cow<'a, str>>, // 导出名称列表
    pub events: Vec<Event<'a>>,          // 组件级事件
    pub has_async: bool,                 // 是否包含异步逻辑（如 useEffect）
    pub dependencies: Vec<Cow<'a, str>>, // 响应式依赖
}

impl<'a> Default for ComponentNode<'a> {
    fn default() -> Self {
        ComponentNode {
            name: Cow::Borrowed("AnonymousComponent"),
            body: Vec::new(),
            scope: Scope::default(),
            parent: None,
            version: Cow::Borrowed("2.0.0"), // 匹配原版版本
            is_default: false,
            export_type: Cow::Borrowed("function"),
            export_names: Vec::new(),
            events: Vec::new(),
            has_async: false,
            dependencies: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Scope<'a> {
    pub reactive_map: HashMap<Cow<'a, str>, usize>,
    pub computed_map: HashMap<Cow<'a, str>, ComputedInfo<'a>>,
    pub used_id_bits: u32,
    pub level: u32,
    pub prop_deps: HashMap<Cow<'a, str>, Vec<Cow<'a, str>>>,
    pub is_closure: bool,
    // 新增字段
    pub event_map: HashMap<Cow<'a, str>, Event<'a>>,
    pub hooks: Vec<Cow<'a, str>>, // 存储 hooks（如 useState、useEffect）
}

impl<'a> Default for Scope<'a> {
    fn default() -> Self {
        Scope {
            reactive_map: HashMap::new(),
            computed_map: HashMap::new(),
            used_id_bits: 0,
            level: 0,
            prop_deps: HashMap::new(),
            is_closure: false,
            event_map: HashMap::new(),
            hooks: Vec::new(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ComputedInfo<'a> {
    pub deps: Vec<Cow<'a, str>>,
    pub dep_id_bitmap: u32,
    pub getter: Cow<'a, str>,
    pub setter: Option<Cow<'a, str>>,
    pub dependencies: Vec<Cow<'a, str>>,
}

#[derive(Debug, Clone)]
pub enum IRStmt<'a> {
    State(StateStmt<'a>),
    Derived(DerivedStmt<'a>),
    Prop(PropStmt<'a>),
    ViewReturn(ViewReturnStmt<'a>),
    SubComp(SubCompStmt<'a>),
    Raw(RawStmt),
    // 添加JS版对应的IR语句类型
    Ref(RefStmt<'a>),
    Effect(EffectStmt<'a>),
    Watch(WatchStmt<'a>),
    Lifecycle(LifecycleStmt<'a>),
    HookCall(HookCall<'a>),
    // 添加analyzer需要的类型
    SingleProp(SinglePropStmt),
    RestProp(RestPropStmt<'a>),
    WholeProp(WholePropStmt),
    UseContext(UseContextStmt),
    HookReturn(HookReturnStmt),
}

#[derive(Debug, Clone)]
pub struct StateStmt<'a> {
    pub name: Cow<'a, str>,
    pub value: Option<Cow<'a, str>>,
    pub reactive_id: u32,
    // 添加JS版对应的字段
    pub is_const: bool,
    pub is_shallow: bool,
    // Hook类型信息
    pub hook_type: Cow<'a, str>,
    // setter函数名（用于useState解构赋值）
    pub setter_name: Cow<'a, str>,
    // 依赖数组（用于useMemo和useCallback）
    pub dependencies: Cow<'a, str>,
}

#[derive(Debug, Clone)]
pub struct DerivedStmt<'a> {
    pub name: Cow<'a, str>,
    pub value: Cow<'a, str>,
    pub reactive_id: u32,
    pub dependency: Option<Dependency>,
    // 添加JS版对应的字段
    pub getter: Cow<'a, str>,
    pub setter: Option<Cow<'a, str>>,
}

#[derive(Debug, Clone)]
pub struct PropStmt<'a> {
    pub name: Cow<'a, str>,
    pub value: Cow<'a, str>,
    pub reactive_id: u32,
    pub prop_type: Cow<'a, str>,
    // 添加JS版对应的字段
    pub is_required: bool,
    pub default_value: Option<Cow<'a, str>>,
    pub validator: Option<Cow<'a, str>>,
}

#[derive(Debug, Clone)]
pub struct ViewReturnStmt<'a> {
    pub value: ViewParticle<'a>,
    // 添加JS版对应的字段
    pub is_conditional: bool,
    pub has_loop: bool,
}

impl<'a> Default for ViewReturnStmt<'a> {
    fn default() -> Self {
        ViewReturnStmt {
            value: ViewParticle::default(),
            is_conditional: false,
            has_loop: false,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SubCompStmt<'a> {
    pub name: Cow<'a, str>,
    pub component: ComponentNode<'a>,
    pub props: HashMap<Cow<'a, str>, Cow<'a, str>>,
}

#[derive(Debug, Clone)]
pub struct RefStmt<'a> {
    pub name: Cow<'a, str>,
    pub initial_value: Option<Cow<'a, str>>,
    pub reactive_id: u32,
}

#[derive(Debug, Clone)]
pub struct EffectStmt<'a> {
    pub callback: Cow<'a, str>,
    pub body: Vec<IRStmt<'a>>,
    pub dependencies: Vec<Cow<'a, str>>,
    pub reactive_id: u32,
    pub cleanup: Option<Vec<IRStmt<'a>>>,
}

#[derive(Debug, Clone)]
pub struct WatchStmt<'a> {
    pub dependencies: Vec<Cow<'a, str>>,
    pub callback: Cow<'a, str>,
    pub immediate: bool,
    pub reactive_id: u32,
}

#[derive(Debug, Clone)]
pub struct LifecycleStmt<'a> {
    pub hook: Cow<'a, str>,
    pub callback: Cow<'a, str>,
    pub reactive_id: u32,
}

#[derive(Debug, Clone)]
pub struct HookCall<'a> {
    pub hook_type: Cow<'a, str>,
    pub variable_name: Cow<'a, str>,
    pub initial_value: Option<Cow<'a, str>>,
    pub effect_body: Option<Cow<'a, str>>,
    pub dependencies: Vec<Cow<'a, str>>,
    pub reactive_id: u32,
}

// 添加analyzer需要的类型定义
#[derive(Debug, Clone)]
pub struct RawStmt {
    pub value: String, // 替换为字符串表示
}

#[derive(Debug, Clone)]
pub struct SinglePropStmt {
    pub name: String,
    pub value: String, // 替换为字符串表示
    pub reactive_id: u32,
    pub type_: PropType,
    pub is_destructured: bool,
    pub defaultValue: Option<String>, // 替换为字符串表示
    pub source: String,
    pub ctx_name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RestPropStmt<'a> {
    pub name: String,
    pub type_: PropType,
    pub reactive_id: u32,
    pub source: String,
    pub ctx_name: Option<String>,
    // 占位以使用生命周期参数 'a
    pub _phantom: std::marker::PhantomData<&'a ()>,
}

#[derive(Debug, Clone)]
pub struct WholePropStmt {
    pub name: String,
    pub value: String, // 替换为字符串表示
    pub reactive_id: u32,
    pub type_: PropType,
    pub source: String,
    pub ctx_name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct UseContextStmt {
    pub l_val: String,   // 替换为字符串表示
    pub context: String, // 替换为字符串表示
}

#[derive(Debug, Clone)]
pub struct HookReturnStmt {
    pub value: String, // 替换为字符串表示
    pub dependency: Option<Dependency>,
}

#[derive(Debug, Clone)]
pub enum DerivedSource {
    Hook,
    State,
}

#[derive(Debug, Clone)]
pub struct Dependency {
    pub dep_id_bitmap: u32,
    pub dep_names: Vec<String>,
}

// 移除重复的Dependency定义，使用新的Dependency类型

// 与TypeScript版完全对齐的UnitProp定义
#[derive(Debug, Clone)]
pub struct UnitProp<'a> {
    pub value: Cow<'a, str>, // 对应JS版的t.Expression
    pub view_prop_map: HashMap<String, Vec<ViewUnit<'a>>>, // 与JS版完全一致
    pub specifier: Option<Cow<'a, str>>, // 与JS版完全一致
    // 以下字段是为了兼容现有代码而添加的
    pub is_event: bool,                  // 兼容现有代码的字段
    pub is_function: bool,               // 兼容现有代码的字段
    pub dependencies: Vec<Cow<'a, str>>, // 添加缺少的dependencies字段
}

impl<'a> Default for UnitProp<'a> {
    fn default() -> Self {
        UnitProp {
            value: Cow::Borrowed(""),
            view_prop_map: HashMap::new(),
            specifier: None,
            is_event: false,
            is_function: false,
            dependencies: Vec::new(),
        }
    }
}

// 文本单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct TextUnit<'a> {
    pub type_: Cow<'a, str>,
    pub content: Cow<'a, str>,
    pub is_empty: bool,
    pub is_whitespace: bool,
}

impl<'a> Default for TextUnit<'a> {
    fn default() -> Self {
        TextUnit {
            type_: "text".into(),
            content: "".into(),
            is_empty: true,
            is_whitespace: false,
        }
    }
}

// 表达式单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct ExpUnit<'a> {
    pub type_: Cow<'a, str>,
    pub content: UnitProp<'a>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub dep_id_bitmap: u32,
    pub dependencies: Vec<Cow<'a, str>>,
    pub is_method: bool,
}

impl<'a> Default for ExpUnit<'a> {
    fn default() -> Self {
        ExpUnit {
            type_: Cow::Borrowed("exp"),
            content: UnitProp::default(),
            props: HashMap::new(),
            dependencies: Vec::new(),
            dep_id_bitmap: 0,
            is_method: false,
        }
    }
}

// HTML单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct HTMLUnit<'a> {
    pub type_: Cow<'a, str>,
    pub tag: Cow<'a, str>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub is_self_closing: bool,
    pub namespace: Option<Cow<'a, str>>,
    pub is_component: bool,
}

impl<'a> Default for HTMLUnit<'a> {
    fn default() -> Self {
        Self {
            type_: Cow::Borrowed("html"),
            tag: Cow::Borrowed(""),
            props: HashMap::new(),
            children: vec![],
            is_self_closing: false,
            namespace: None,
            is_component: false,
        }
    }
}

// For循环单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct ForUnit<'a> {
    pub type_: Cow<'a, str>,
    pub item: Cow<'a, str>,
    pub array: UnitProp<'a>,
    pub key: Option<Cow<'a, str>>,
    pub index: Option<Cow<'a, str>>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub is_reverse: bool,
    pub track_by: Option<UnitProp<'a>>,
}

// If分支结构体
#[derive(Debug, Clone)]
pub struct IfBranch<'a> {
    pub condition: Cow<'a, str>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub is_else: bool,
    // 添加缺少的字段以支持代码生成
    pub dep_id_bitmap: u32,      // 依赖位图
    pub dependencies_node: Expr, // 依赖节点表达式
}

impl<'a> Default for IfBranch<'a> {
    fn default() -> Self {
        IfBranch {
            condition: Cow::Borrowed(""),
            children: Vec::new(),
            is_else: false,
            dep_id_bitmap: 0,
            dependencies_node: Expr::Array(swc_ecma_ast::ArrayLit {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                elems: vec![],
            }),
        }
    }
}

// If条件单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct IfUnit<'a> {
    pub type_: Cow<'a, str>,
    pub branches: Vec<Box<IfBranch<'a>>>,
    pub has_else: bool,
}

impl<'a> Default for IfUnit<'a> {
    fn default() -> Self {
        IfUnit {
            type_: Cow::Borrowed("if"),
            branches: Vec::new(),
            has_else: false,
        }
    }
}

// Fragment片段单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct FragmentUnit<'a> {
    pub type_: Cow<'a, str>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub key: Option<Cow<'a, str>>,
}

// Context上下文单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct ContextUnit<'a> {
    pub type_: Cow<'a, str>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub context_name: Cow<'a, str>,
    pub value: Cow<'a, str>,
    pub provider: Cow<'a, str>,
    pub dependencies: Vec<Cow<'a, str>>,
    pub dep_id_bitmap: u32,
}

// Suspense单元 - 与TS版保持一致
#[derive(Debug, Clone)]
pub struct SuspenseUnit<'a> {
    pub type_: Cow<'a, str>,
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub fallback: Option<Box<ViewUnit<'a>>>,
    pub timeout: Option<Cow<'a, str>>,
}

impl<'a> Default for SuspenseUnit<'a> {
    fn default() -> Self {
        SuspenseUnit {
            type_: Cow::Borrowed("suspense"),
            children: Vec::new(),
            fallback: None,
            timeout: None,
        }
    }
}

// 与TypeScript版完全对齐的TemplateUnit定义
#[derive(Debug, Clone, Default)]
pub struct TemplateUnit<'a> {
    pub type_: Cow<'a, str>,                  // 固定为'template'
    pub tag: Cow<'a, str>,                    // 对应JS版的t.Identifier
    pub props: HashMap<String, UnitProp<'a>>, // 使用与JS版相同的UnitProp类型
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub is_element: bool,
    pub is_text: bool,
}

// 与TypeScript版完全对齐的CompUnit定义
#[derive(Debug, Clone)]
pub struct CompUnit<'a> {
    pub type_: Cow<'a, str>,                  // 固定为'comp'
    pub tag: Cow<'a, str>,                    // 对应JS版的t.Expression
    pub name: Cow<'a, str>,                   // 组件名称
    pub props: HashMap<String, UnitProp<'a>>, // 使用与JS版相同的UnitProp类型
    pub children: Vec<Box<ViewUnit<'a>>>,
    pub hooks: Vec<ViewUnit<'a>>,      // Hooks列表
    pub other_statements: Vec<String>, // 其他JavaScript语句
}

impl<'a> Default for CompUnit<'a> {
    fn default() -> Self {
        CompUnit {
            type_: Cow::Borrowed("comp"),
            tag: Cow::Borrowed(""),
            name: Cow::Borrowed(""),
            props: HashMap::new(),
            children: Vec::new(),
            hooks: Vec::new(),
            other_statements: Vec::new(),
        }
    }
}

impl<'a> Default for SlotUnit<'a> {
    fn default() -> Self {
        SlotUnit {
            type_: Cow::Borrowed("slot"),
            name: None,
            props: HashMap::new(),
            children: Vec::new(),
        }
    }
}

// Comment单元
#[derive(Debug, Clone)]
pub struct CommentUnit<'a> {
    pub type_: Cow<'a, str>,
    pub content: Cow<'a, str>,
}

// RawHtml单元
#[derive(Debug, Clone)]
pub struct RawHtmlUnit<'a> {
    pub type_: Cow<'a, str>,
    pub content: UnitProp<'a>,
}

// Teleport单元
#[derive(Debug, Clone)]
pub struct TeleportUnit<'a> {
    pub type_: Cow<'a, str>,
    pub to: UnitProp<'a>,
    pub children: Vec<Box<ViewUnit<'a>>>,
}

// Slot单元
#[derive(Debug, Clone)]
pub struct SlotUnit<'a> {
    pub type_: Cow<'a, str>,
    pub name: Option<Cow<'a, str>>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<Box<ViewUnit<'a>>>,
}

// State单元
#[derive(Debug, Clone)]
pub struct StateUnit<'a> {
    pub type_: Cow<'a, str>,
    pub name: Cow<'a, str>,
    pub initial_value: Cow<'a, str>,
    pub is_reactive: bool,
    pub is_shallow: bool,
    pub is_readonly: bool,
    // setter函数名（用于useState解构赋值）
    pub setter_name: Cow<'a, str>,
    // 依赖数组（用于useMemo和useCallback）
    pub dependencies: Cow<'a, str>,
}

// Computed单元
#[derive(Debug, Clone)]
pub struct ComputedUnit<'a> {
    pub type_: Cow<'a, str>,
    pub name: Cow<'a, str>,
    pub getter: Cow<'a, str>,
    pub setter: Option<Cow<'a, str>>,
    pub is_readonly: bool,
}

// SubComp单元
#[derive(Debug, Clone)]
pub struct SubCompUnit<'a> {
    pub type_: Cow<'a, str>,
    pub name: Cow<'a, str>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<Box<ViewUnit<'a>>>,
}

impl<'a> Default for SubCompUnit<'a> {
    fn default() -> Self {
        SubCompUnit {
            type_: Cow::Borrowed("subComp"),
            name: Cow::Borrowed(""),
            props: HashMap::new(),
            children: Vec::new(),
        }
    }
}

// 视图单元枚举 - 与TS版保持一致
#[derive(Debug, Clone)]
pub enum ViewUnit<'a> {
    Html(HTMLUnit<'a>),
    Text(TextUnit<'a>),
    Exp(ExpUnit<'a>),
    Fragment(FragmentUnit<'a>),
    Comp(CompUnit<'a>),
    For(ForUnit<'a>),
    If(IfUnit<'a>),
    Context(ContextUnit<'a>),
    Suspense(Box<SuspenseUnit<'a>>),
    Template(TemplateUnit<'a>),
    Comment(CommentUnit<'a>),
    RawHtml(RawHtmlUnit<'a>),
    Teleport(TeleportUnit<'a>),
    Slot(SlotUnit<'a>),
    State(StateUnit<'a>),
    Computed(ComputedUnit<'a>),
    SubComp(SubCompUnit<'a>),
}

// 为ViewUnit实现Default trait
impl<'a> Default for ViewUnit<'a> {
    fn default() -> Self {
        ViewUnit::Text(TextUnit::default())
    }
}

// 与TypeScript版reactivity-parser/src/types.ts完全对齐的ViewParticle类型定义

// ExpressionUnit类型 - 与json_generator.rs中使用的类型匹配
#[derive(Debug, Clone, Default)]
pub struct ExpressionUnit {
    pub content: String,
    pub dependencies: Vec<String>,
}

// RefInfo类型 - 与json_generator.rs中使用的类型匹配
#[derive(Debug, Clone, Default)]
pub struct RefInfo {
    pub content: String,
    pub dependencies: Vec<String>,
}

// Directive类型 - 与json_generator.rs中使用的类型匹配
#[derive(Debug, Clone, Default)]
pub struct Directive {
    pub name: String,
    pub value: String,
    pub modifiers: Vec<String>,
    pub loc: Option<String>,
}

// EventHandler类型 - 与json_generator.rs中使用的类型匹配
#[derive(Debug, Clone, Default)]
pub struct EventHandler {
    pub content: String,
    pub loc: Option<String>,
}

// 模板粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct TemplateParticle<'a> {
    pub type_: String, // 固定为'template'
    pub template: HTMLParticle<'a>,
    pub mutable_particles: Vec<MutableParticle<'a>>,
    pub props: Vec<TemplateProp>,
}

// 文本粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct TextParticle {
    pub type_: String,                    // 固定为'text'
    pub content: DependencyValue<String>, // 替换为字符串表示
}

// HTML粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct HTMLParticle<'a> {
    pub type_: String,                                   // 固定为'html'
    pub tag: String,                                     // 替换为字符串表示
    pub props: HashMap<String, DependencyValue<String>>, // 替换为字符串表示
    pub children: Vec<ViewParticle<'a>>,
}

// 组件粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct CompParticle<'a> {
    pub type_: String,                              // 固定为'comp'
    pub tag: String,                                // 替换为字符串表示
    pub props: HashMap<String, DependencyProp<'a>>, // 对应TS版的Record<string, DependencyProp>
    pub children: Vec<ViewParticle<'a>>,
}

// For粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct ForParticle<'a> {
    pub type_: String,                  // 固定为'for'
    pub item: String,                   // 替换为字符串表示
    pub index: Option<String>,          // 替换为字符串表示
    pub array: DependencyValue<String>, // 替换为字符串表示
    pub key: Option<String>,            // 替换为字符串表示
    pub children: Vec<ViewParticle<'a>>,
}

// If分支类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct IfBranchParticle<'a> {
    pub condition: DependencyValue<String>, // 替换为字符串表示
    pub children: Vec<ViewParticle<'a>>,
}

// If粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct IfParticle<'a> {
    pub type_: String, // 固定为'if'
    pub branches: Vec<IfBranchParticle<'a>>,
}

// Context粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct ContextParticle<'a> {
    pub type_: String,                              // 固定为'context'
    pub props: HashMap<String, DependencyProp<'a>>, // 对应TS版的Record<string, DependencyProp>
    pub children: Vec<ViewParticle<'a>>,
    pub context_name: String,
}

// Suspense粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct SuspenseParticle<'a> {
    pub type_: String, // 固定为'suspense'
    pub children: Vec<ViewParticle<'a>>,
    pub fallback: Option<UnitProp<'a>>, // 对应TS版的UnitProp | null
}

// Exp粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct ExpParticle<'a> {
    pub type_: String, // 固定为'exp'
    pub content: DependencyProp<'a>,
}

// Fragment粒子类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct FragmentParticle<'a> {
    pub type_: String, // 固定为'fragment'
    pub children: Vec<ViewParticle<'a>>,
}

// MutableParticle类型 - 与TS版本完全对齐
#[derive(Debug, Clone, Default)]
pub struct MutableParticle<'a> {
    pub path: Vec<usize>,
    pub particle: ViewParticle<'a>, // 对应TS版的ViewParticle & { path: number[] }
}

// 新增：TS 同构的视图粒子枚举，用于代码生成阶段按类型分发
#[derive(Debug, Clone)]
pub enum TsViewParticle<'a> {
    Template(TemplateParticle<'a>),
    Text(TextParticle),
    HTML(HTMLParticle<'a>),
    Comp(CompParticle<'a>),
    For(ForParticle<'a>),
    If(IfParticle<'a>),
    Context(ContextParticle<'a>),
    Exp(ExpParticle<'a>),
    Fragment(FragmentParticle<'a>),
    Suspense(SuspenseParticle<'a>),
}

// 与TypeScript版reactivity-parser/src/types.ts完全对齐的ViewParticle结构体
// 暂时保持结构体设计以兼容现有代码，后续可以逐步迁移到枚举
#[derive(Debug, Clone)]
pub struct ViewParticle<'a> {
    pub template: TemplateNode<'a>,
    pub mutable_units: Vec<MutableUnit<'a>>,
    pub is_root: bool,
    pub has_async: bool,
    pub events: Vec<Event<'a>>,
    pub dynamic_props: HashMap<String, Cow<'a, str>>,
    pub dependencies: Vec<String>,
    // 新增字段以支持新的功能
    pub particle_type: Option<String>, // 用于标识粒子类型
    pub particle_data: Option<String>, // 替换为字符串表示
    // 添加缺少的字段以支持代码生成
    pub dep_id_bitmap: Option<u32>,          // 依赖位图
    pub branches: Option<Vec<IfBranch<'a>>>, // 条件分支
}

impl<'a> Default for ViewParticle<'a> {
    fn default() -> Self {
        ViewParticle {
            template: TemplateNode {
                tag: Cow::Borrowed("div"),
                props: HashMap::new(),
                children: Vec::new(),
                is_element: true,
                is_text: false,
                events: Vec::new(),
                key: None,
                ref_id: None,
                node_type: NodeType::HTML,
            },
            mutable_units: Vec::new(),
            is_root: false,
            has_async: false,
            events: Vec::new(),
            dynamic_props: HashMap::new(),
            dependencies: Vec::new(),
            particle_type: None,
            particle_data: None,
            dep_id_bitmap: None,
            branches: None,
        }
    }
}

// 响应式引用类型
#[derive(Debug, Clone, Default)]
pub struct MaybeRef {
    pub ref_id: String,
    pub is_ref: bool,
}

// 响应式位图类型 - 与TS版本对齐
pub type ReactiveBitMap = HashMap<String, u32>; // 对应TS版的Map<string, Bitmap>
pub type Bitmap = u32; // 对应TS版的Bitmap

// ReactivityParser配置 - 与TS版本完全对齐
#[derive(Debug, Clone)]
pub struct ReactivityParserConfig {
    pub reactive_map: ReactiveBitMap,
    pub dependency_parse_type: Option<String>, // 对应TS版的'property' | 'identifier'
    pub parse_template: Option<bool>,
    pub reactivity_func_names: Vec<String>,
    pub derived_map: Option<HashMap<String, Vec<String>>>, // 对应TS版的Map<string, string[]>
}

// 属性值类型
#[derive(Debug, Clone, Default)]
pub struct PropValue<'a> {
    pub value: Cow<'a, str>,
    pub dependencies: Vec<Cow<'a, str>>,
    pub is_event: bool,
    pub dep_id_bitmap: u32,
    pub is_boolean: bool,
    pub is_function: bool,
    pub is_number: bool,
    pub is_object: bool,
}

// 依赖信息类型 - 与TS版本对齐
#[derive(Debug, Clone, Default)]
pub struct DependencyInfo {
    pub dependencies: HashMap<String, usize>,
    pub total_bitmap: ReactiveBitMap,
    pub cache: HashMap<String, String>,
    // 新增：节点路径（如 "0_1_2"）到依赖名数组的映射
    pub node_deps: HashMap<String, Vec<String>>,
}

// 依赖类型 - 与TS版本完全对齐 (使用上面定义的版本)

// 依赖值类型 - 与TS版本对齐
#[derive(Debug, Clone, Default)]
pub struct DependencyValue<T> {
    pub value: T,
    pub dependencies_node: String, // 替换为字符串表示
    pub dep_id_bitmap: u32,        // 对应TS版的Bitmap
}

// 依赖属性类型 - 与TS版本对齐
#[derive(Debug, Clone, Default)]
pub struct DependencyProp<'a> {
    pub value: String,                                         // 替换为字符串表示
    pub dependencies_node: String,                             // 替换为字符串表示
    pub dep_id_bitmap: u32,                                    // 对应TS版的Bitmap
    pub view_prop_map: HashMap<String, Vec<ViewParticle<'a>>>, // 与TS版完全一致
}

// 模板属性类型 - 与TS版本对齐
#[derive(Debug, Clone, Default)]
pub struct TemplateProp {
    pub tag: String,               // 对应TS版的string
    pub key: String,               // 对应TS版的string
    pub path: Vec<usize>,          // 对应TS版的number[]
    pub value: String,             // 替换为字符串表示
    pub dependencies_node: String, // 替换为字符串表示
    pub dep_id_bitmap: u32,        // 对应TS版的Bitmap
}

// 用于兼容性的类型定义 - 保留原始结构
#[derive(Debug, Clone, Default)]
pub struct MutableUnit<'a> {
    pub path: Vec<usize>,
    pub unit: ViewUnit<'a>,
    // 以下字段是为了兼容现有代码而添加的
    pub type_: Cow<'a, str>,
    pub name: Cow<'a, str>,
    pub value: Cow<'a, str>,
    pub ast: String, // 替换为字符串表示
    pub is_static: bool,
    pub is_dynamic: bool,
    pub dependencies: Vec<Cow<'a, str>>,
}

// 用于兼容性的类型定义 - 保留原始结构
#[derive(Debug, Clone)]
pub struct TemplateNode<'a> {
    pub tag: Cow<'a, str>,
    pub props: HashMap<String, Cow<'a, str>>,
    pub children: Vec<ViewParticle<'a>>,
    pub is_element: bool,
    pub is_text: bool,
    // 新增字段
    pub events: Vec<Event<'a>>,
    pub ref_id: Option<Cow<'a, str>>,
    pub key: Option<Cow<'a, str>>, // 支持列表渲染的 key
    pub node_type: NodeType<'a>,
}

impl<'a> Default for TemplateNode<'a> {
    fn default() -> Self {
        TemplateNode {
            tag: Cow::Borrowed("div"),
            props: HashMap::new(),
            children: Vec::new(),
            is_element: true,
            is_text: false,
            events: Vec::new(),
            ref_id: None,
            key: None,
            node_type: NodeType::HTML,
        }
    }
}

// 工具函数: 检查表达式是否为简单标识符
pub fn is_simple_identifier(expr: &str) -> bool {
    // 简单判断：仅包含字母、数字和下划线，且不以数字开头
    let chars: Vec<char> = expr.chars().collect();
    if chars.is_empty() {
        return false;
    }

    if !chars[0].is_alphabetic() && chars[0] != '_' {
        return false;
    }

    for c in &chars[1..] {
        if !c.is_alphanumeric() && *c != '_' && *c != '$' {
            return false;
        }
    }

    true
}

// 工具函数: 提取表达式中的所有标识符
pub fn extract_identifiers(expr: &str) -> Vec<String> {
    let mut identifiers = Vec::new();
    let mut current_id = String::new();
    let mut in_string = false;
    let mut in_template = false;
    let mut template_expr_depth = 0;

    for c in expr.chars() {
        if c == '"' || c == '\'' {
            in_string = !in_string;
        } else if c == '`' {
            if !in_template {
                in_template = true;
            } else if template_expr_depth == 0 {
                in_template = false;
            }
        } else if in_template && c == '{' {
            template_expr_depth += 1;
        } else if in_template && c == '}' {
            if template_expr_depth > 0 {
                template_expr_depth -= 1;
            }
        }

        if !in_string && !in_template && (c.is_alphabetic() || c == '_') {
            current_id.push(c);
        } else if !in_string
            && !in_template
            && (c.is_numeric() || c == '$')
            && !current_id.is_empty()
        {
            current_id.push(c);
        } else if !current_id.is_empty() {
            identifiers.push(current_id.clone());
            current_id.clear();
        }
    }

    if !current_id.is_empty() {
        identifiers.push(current_id);
    }

    identifiers
}

// 将ComponentNode转换为静态生命周期
impl ComponentNode<'_> {
    pub fn to_static(&self) -> ComponentNode<'static> {
        ComponentNode {
            name: Cow::Owned(self.name.to_string()),
            body: self.body.iter().map(|stmt| stmt.to_static()).collect(),
            scope: self.scope.to_static(),
            parent: None, // 静态版本中不保留父组件引用
            version: Cow::Owned(self.version.to_string()),
            is_default: self.is_default,
            export_type: Cow::Owned(self.export_type.to_string()),
            export_names: self
                .export_names
                .iter()
                .map(|n| Cow::Owned(n.to_string()))
                .collect(),
            events: self.events.iter().map(|e| e.to_static()).collect(),
            has_async: self.has_async,
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
        }
    }
}

// 将ComputedInfo转换为静态生命周期
impl ComputedInfo<'_> {
    pub fn to_static(&self) -> ComputedInfo<'static> {
        ComputedInfo {
            deps: self
                .deps
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
            dep_id_bitmap: self.dep_id_bitmap,
            getter: Cow::Owned(self.getter.to_string()),
            setter: self.setter.as_ref().map(|s| Cow::Owned(s.to_string())),
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
        }
    }
}

// 将Scope转换为静态生命周期
impl Scope<'_> {
    pub fn to_static(&self) -> Scope<'static> {
        Scope {
            reactive_map: self
                .reactive_map
                .iter()
                .map(|(k, v)| (Cow::Owned(k.to_string()), *v))
                .collect(),
            computed_map: self
                .computed_map
                .iter()
                .map(|(k, v)| (Cow::Owned(k.to_string()), v.to_static()))
                .collect(),
            used_id_bits: self.used_id_bits,
            level: self.level,
            prop_deps: self
                .prop_deps
                .iter()
                .map(|(k, v)| {
                    (
                        Cow::Owned(k.to_string()),
                        v.iter().map(|d| Cow::Owned(d.to_string())).collect(),
                    )
                })
                .collect(),
            is_closure: self.is_closure,
            event_map: self
                .event_map
                .iter()
                .map(|(k, v)| (Cow::Owned(k.to_string()), v.to_static()))
                .collect(),
            hooks: self
                .hooks
                .iter()
                .map(|h| Cow::Owned(h.to_string()))
                .collect(),
        }
    }
}

// 将IRStmt转换为静态生命周期
impl<'a> IRStmt<'a> {
    pub fn to_static(&self) -> IRStmt<'static> {
        match self {
            IRStmt::ViewReturn(view_return) => IRStmt::ViewReturn(ViewReturnStmt {
                value: view_return.value.to_static(),
                has_loop: view_return.has_loop,
                is_conditional: view_return.is_conditional,
            }),
            IRStmt::Effect(effect) => IRStmt::Effect(EffectStmt {
                callback: Cow::Owned(effect.callback.to_string()),
                dependencies: effect
                    .dependencies
                    .iter()
                    .map(|d| Cow::Owned(d.to_string()))
                    .collect(),
                body: effect.body.iter().map(|s| s.to_static()).collect(),
                cleanup: effect
                    .cleanup
                    .as_ref()
                    .map(|c| c.iter().map(|s| s.to_static()).collect()),
                reactive_id: effect.reactive_id,
            }),
            IRStmt::State(state) => IRStmt::State(StateStmt {
                name: Cow::Owned(state.name.to_string()),
                value: state.value.as_ref().map(|v| Cow::Owned(v.to_string())),
                reactive_id: state.reactive_id,
                is_const: state.is_const,
                is_shallow: state.is_shallow,
                hook_type: Cow::Owned(state.hook_type.to_string()),
                setter_name: Cow::Owned(state.setter_name.to_string()),
                dependencies: Cow::Owned(state.dependencies.to_string()),
            }),
            IRStmt::Derived(derived) => IRStmt::Derived(DerivedStmt {
                name: Cow::Owned(derived.name.to_string()),
                value: Cow::Owned(derived.value.to_string()),
                reactive_id: derived.reactive_id,
                dependency: derived.dependency.as_ref().map(|d| Dependency {
                    dep_id_bitmap: d.dep_id_bitmap,
                    dep_names: d.dep_names.clone(),
                }),
                getter: Cow::Owned(derived.getter.to_string()),
                setter: derived.setter.as_ref().map(|v| Cow::Owned(v.to_string())),
            }),
            IRStmt::SubComp(sub_comp) => IRStmt::SubComp(SubCompStmt {
                name: Cow::Owned(sub_comp.name.to_string()),
                component: sub_comp.component.to_static(),
                props: sub_comp
                    .props
                    .iter()
                    .map(|(k, v)| (Cow::Owned(k.to_string()), Cow::Owned(v.to_string())))
                    .collect(),
            }),
            IRStmt::Raw(raw) => {
                // 确保将raw转换为'static生命周期
                IRStmt::Raw(RawStmt {
                    value: raw.value.clone(),
                })
            }
            IRStmt::Prop(prop) => IRStmt::Prop(PropStmt {
                name: Cow::Owned(prop.name.to_string()),
                value: Cow::Owned(prop.value.to_string()),
                reactive_id: prop.reactive_id,
                prop_type: Cow::Owned(prop.prop_type.to_string()),
                is_required: prop.is_required,
                default_value: prop
                    .default_value
                    .as_ref()
                    .map(|v| Cow::Owned(v.to_string())),
                validator: prop.validator.as_ref().map(|v| Cow::Owned(v.to_string())),
            }),
            IRStmt::Watch(watch) => IRStmt::Watch(WatchStmt {
                dependencies: watch
                    .dependencies
                    .iter()
                    .map(|d| Cow::Owned(d.to_string()))
                    .collect(),
                callback: Cow::Owned(watch.callback.to_string()),
                immediate: watch.immediate,
                reactive_id: watch.reactive_id,
            }),
            IRStmt::Ref(r#ref) => IRStmt::Ref(RefStmt {
                name: Cow::Owned(r#ref.name.to_string()),
                initial_value: r#ref
                    .initial_value
                    .as_ref()
                    .map(|v| Cow::Owned(v.to_string())),
                reactive_id: r#ref.reactive_id,
            }),
            IRStmt::Lifecycle(lifecycle) => IRStmt::Lifecycle(LifecycleStmt {
                hook: Cow::Owned(lifecycle.hook.to_string()),
                callback: Cow::Owned(lifecycle.callback.to_string()),
                reactive_id: lifecycle.reactive_id,
            }),
            IRStmt::HookCall(hook_call) => IRStmt::HookCall(HookCall {
                hook_type: Cow::Owned(hook_call.hook_type.to_string()),
                variable_name: Cow::Owned(hook_call.variable_name.to_string()),
                initial_value: hook_call
                    .initial_value
                    .as_ref()
                    .map(|v| Cow::Owned(v.to_string())),
                effect_body: hook_call
                    .effect_body
                    .as_ref()
                    .map(|v| Cow::Owned(v.to_string())),
                dependencies: hook_call
                    .dependencies
                    .iter()
                    .map(|d| Cow::Owned(d.to_string()))
                    .collect(),
                reactive_id: hook_call.reactive_id,
            }),
            IRStmt::SingleProp(single_prop) => IRStmt::SingleProp(SinglePropStmt {
                name: single_prop.name.clone(),
                value: single_prop.value.clone(),
                reactive_id: single_prop.reactive_id,
                type_: single_prop.type_.clone(),
                is_destructured: single_prop.is_destructured,
                defaultValue: single_prop.defaultValue.clone(),
                source: single_prop.source.clone(),
                ctx_name: single_prop.ctx_name.clone(),
            }),
            IRStmt::RestProp(rest_prop) => IRStmt::RestProp(RestPropStmt {
                name: rest_prop.name.clone(),
                type_: rest_prop.type_.clone(),
                reactive_id: rest_prop.reactive_id,
                source: rest_prop.source.clone(),
                ctx_name: rest_prop.ctx_name.clone(),
                _phantom: std::marker::PhantomData,
            }),
            IRStmt::WholeProp(whole_prop) => IRStmt::WholeProp(WholePropStmt {
                name: whole_prop.name.clone(),
                value: whole_prop.value.clone(),
                reactive_id: whole_prop.reactive_id,
                type_: whole_prop.type_.clone(),
                source: whole_prop.source.clone(),
                ctx_name: whole_prop.ctx_name.clone(),
            }),
            IRStmt::UseContext(use_context) => IRStmt::UseContext(UseContextStmt {
                l_val: use_context.l_val.clone(),
                context: use_context.context.clone(),
            }),
            IRStmt::HookReturn(hook_return) => IRStmt::HookReturn(HookReturnStmt {
                value: hook_return.value.clone(),
                dependency: hook_return.dependency.as_ref().map(|d| Dependency {
                    dep_id_bitmap: d.dep_id_bitmap,
                    dep_names: d.dep_names.clone(),
                }),
            }),
        }
    }
}

// 将ViewParticle转换为静态生命周期
impl ViewParticle<'_> {
    pub fn to_static(&self) -> ViewParticle<'static> {
        ViewParticle {
            template: self.template.to_static(),
            mutable_units: self.mutable_units.iter().map(|mu| mu.to_static()).collect(),
            is_root: self.is_root,
            has_async: self.has_async,
            events: self.events.iter().map(|e| e.to_static()).collect(),
            dynamic_props: self
                .dynamic_props
                .iter()
                .map(|(k, v)| (k.clone(), Cow::Owned(v.to_string())))
                .collect(),
            dependencies: self.dependencies.clone(),
            particle_type: self.particle_type.clone(),
            particle_data: self.particle_data.clone(),
            dep_id_bitmap: self.dep_id_bitmap,
            branches: self.branches.as_ref().map(|branches| {
                branches
                    .iter()
                    .map(|branch| IfBranch {
                        condition: Cow::Owned(branch.condition.to_string()),
                        children: branch
                            .children
                            .iter()
                            .map(|c| Box::new(c.to_static()))
                            .collect(),
                        is_else: branch.is_else,
                        dep_id_bitmap: branch.dep_id_bitmap,
                        dependencies_node: branch.dependencies_node.clone(), // Expr is already 'static
                    })
                    .collect()
            }),
        }
    }
}

// 将TemplateNode转换为静态生命周期
impl<'a> TemplateNode<'a> {
    pub fn to_static(&self) -> TemplateNode<'static> {
        // 创建一个全新的静态版本TemplateNode，不依赖原始的生命周期
        let static_tag = Cow::Owned(self.tag.to_string());

        // 处理props
        let mut static_props = HashMap::new();
        for (k, v) in &self.props {
            static_props.insert(k.to_string(), Cow::Owned(v.to_string()));
        }

        // 处理children - 这里使用Vec::with_capacity和push来避免编译器的生命周期推理问题
        let mut static_children = Vec::with_capacity(self.children.len());
        for child in &self.children {
            static_children.push(child.to_static());
        }

        // 处理events - 使用Event结构体自己的to_static方法
        let mut static_events = Vec::with_capacity(self.events.len());
        for event in &self.events {
            static_events.push(event.to_static());
        }

        // 处理ref_id和key
        let static_ref_id = self.ref_id.as_ref().map(|id| Cow::Owned(id.to_string()));
        let static_key = self.key.as_ref().map(|k| Cow::Owned(k.to_string()));

        // 处理node_type - 为所有变体创建全新的、无生命周期依赖的实例
        let static_node_type = match &self.node_type {
            NodeType::Text(text) => NodeType::Text(Cow::Owned(text.to_string())),
            NodeType::HTML => NodeType::HTML,
            NodeType::Component => NodeType::Component,
            NodeType::Fragment => NodeType::Fragment,
            NodeType::Expression => NodeType::Expression,
            NodeType::For => NodeType::For,
            NodeType::If => NodeType::If,
            NodeType::Context => NodeType::Context,
            NodeType::Suspense => NodeType::Suspense,
            NodeType::Template => NodeType::Template,
            NodeType::RawHtml => NodeType::RawHtml,
            NodeType::Teleport => NodeType::Teleport,
            NodeType::Slot => NodeType::Slot,
            NodeType::Comment => NodeType::Comment,
        };

        TemplateNode {
            tag: static_tag,
            props: static_props,
            children: static_children,
            is_element: self.is_element,
            is_text: self.is_text,
            events: static_events,
            ref_id: static_ref_id,
            key: static_key,
            node_type: static_node_type,
        }
    }
}

// 将MutableUnit转换为静态生命周期
impl MutableUnit<'_> {
    pub fn to_static(&self) -> MutableUnit<'static> {
        MutableUnit {
            unit: self.unit.to_static(),
            path: self.path.clone(),
            type_: Cow::Owned(self.type_.to_string()),
            name: Cow::Owned(self.name.to_string()),
            value: Cow::Owned(self.value.to_string()),
            ast: self.ast.clone(),
            is_static: self.is_static,
            is_dynamic: self.is_dynamic,
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
        }
    }
}

// 将ViewUnit转换为静态生命周期
impl ViewUnit<'_> {
    pub fn to_static(&self) -> ViewUnit<'static> {
        match self {
            ViewUnit::Html(html) => ViewUnit::Html(HTMLUnit {
                type_: Cow::Owned(html.type_.to_string()),
                tag: Cow::Owned(html.tag.to_string()),
                props: html
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: html
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                is_component: html.is_component,
                is_self_closing: html.is_self_closing,
                namespace: html.namespace.clone().map(|ns| Cow::Owned(ns.to_string())),
            }),
            ViewUnit::Text(text) => ViewUnit::Text(TextUnit {
                type_: Cow::Owned(text.type_.to_string()),
                content: Cow::Owned(text.content.to_string()),
                is_whitespace: text.is_whitespace,
                is_empty: text.is_empty,
            }),
            ViewUnit::Exp(exp) => ViewUnit::Exp(ExpUnit {
                type_: Cow::Owned(exp.type_.to_string()),
                content: exp.content.to_static(),
                props: exp
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                dependencies: exp
                    .dependencies
                    .iter()
                    .map(|d| Cow::Owned(d.to_string()))
                    .collect(),
                dep_id_bitmap: exp.dep_id_bitmap,
                is_method: exp.is_method,
            }),
            ViewUnit::Fragment(fragment) => ViewUnit::Fragment(FragmentUnit {
                type_: Cow::Owned(fragment.type_.to_string()),
                children: fragment
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                key: fragment.key.as_ref().map(|k| Cow::Owned(k.to_string())),
            }),
            ViewUnit::Comp(comp) => ViewUnit::Comp(CompUnit {
                type_: Cow::Owned(comp.type_.to_string()),
                tag: Cow::Owned(comp.tag.to_string()),
                name: Cow::Owned(comp.name.to_string()),
                props: comp
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: comp
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                hooks: comp.hooks.iter().map(|h| h.to_static()).collect(),
                other_statements: comp.other_statements.iter().map(|s| s.clone()).collect(),
            }),
            ViewUnit::SubComp(sub_comp) => ViewUnit::SubComp(SubCompUnit {
                type_: Cow::Owned(sub_comp.type_.to_string()),
                name: Cow::Owned(sub_comp.name.to_string()),
                props: sub_comp
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: sub_comp
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
            }),
            ViewUnit::For(for_unit) => ViewUnit::For(ForUnit {
                type_: Cow::Owned(for_unit.type_.to_string()),
                item: Cow::Owned(for_unit.item.to_string()),
                index: for_unit.index.as_ref().map(|i| Cow::Owned(i.to_string())),
                array: for_unit.array.to_static(),
                key: for_unit.key.as_ref().map(|k| Cow::Owned(k.to_string())),
                children: for_unit
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                is_reverse: for_unit.is_reverse,
                track_by: for_unit.track_by.as_ref().map(|tb| tb.to_static()),
            }),
            ViewUnit::If(if_unit) => ViewUnit::If(IfUnit {
                type_: Cow::Owned(if_unit.type_.to_string()),
                branches: if_unit
                    .branches
                    .iter()
                    .map(|b| {
                        Box::new(IfBranch {
                            condition: Cow::Owned(b.condition.to_string()),
                            children: b.children.iter().map(|c| Box::new(c.to_static())).collect(),
                            is_else: b.is_else,
                            dep_id_bitmap: b.dep_id_bitmap,
                            dependencies_node: b.dependencies_node.clone(),
                        })
                    })
                    .collect(),
                has_else: if_unit.has_else,
            }),
            ViewUnit::Context(context) => ViewUnit::Context(ContextUnit {
                type_: Cow::Owned(context.type_.to_string()),
                provider: Cow::Owned(context.provider.to_string()),
                context_name: Cow::Owned(context.context_name.to_string()),
                value: Cow::Owned(context.value.to_string()),
                props: context
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: context
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                dependencies: context
                    .dependencies
                    .iter()
                    .map(|d| Cow::Owned(d.to_string()))
                    .collect(),
                dep_id_bitmap: context.dep_id_bitmap,
            }),
            ViewUnit::Suspense(suspense) => ViewUnit::Suspense(Box::new(SuspenseUnit {
                type_: Cow::Owned(suspense.type_.to_string()),
                fallback: suspense.fallback.as_ref().map(|f| Box::new(f.to_static())),
                children: suspense
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                timeout: suspense.timeout.as_ref().map(|t| Cow::Owned(t.to_string())),
            })),
            ViewUnit::RawHtml(raw_html) => ViewUnit::RawHtml(RawHtmlUnit {
                type_: Cow::Owned(raw_html.type_.to_string()),
                content: raw_html.content.to_static(),
            }),
            ViewUnit::Teleport(teleport) => ViewUnit::Teleport(TeleportUnit {
                type_: Cow::Owned(teleport.type_.to_string()),
                to: teleport.to.to_static(),
                children: teleport
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
            }),
            ViewUnit::Slot(slot) => ViewUnit::Slot(SlotUnit {
                type_: Cow::Owned(slot.type_.to_string()),
                name: slot.name.as_ref().map(|n| Cow::Owned(n.to_string())),
                props: slot
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: slot
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
            }),
            ViewUnit::State(state) => ViewUnit::State(StateUnit {
                type_: Cow::Owned(state.type_.to_string()),
                name: Cow::Owned(state.name.to_string()),
                initial_value: Cow::Owned(state.initial_value.to_string()),
                is_reactive: state.is_reactive,
                is_shallow: state.is_shallow,
                is_readonly: state.is_readonly,
                setter_name: Cow::Owned(state.setter_name.to_string()),
                dependencies: Cow::Owned(state.dependencies.to_string()),
            }),
            ViewUnit::Computed(computed) => ViewUnit::Computed(ComputedUnit {
                type_: Cow::Owned(computed.type_.to_string()),
                name: Cow::Owned(computed.name.to_string()),
                getter: Cow::Owned(computed.getter.to_string()),
                setter: computed.setter.as_ref().map(|s| Cow::Owned(s.to_string())),
                is_readonly: computed.is_readonly,
            }),
            ViewUnit::Template(template) => ViewUnit::Template(TemplateUnit {
                type_: Cow::Owned(template.type_.to_string()),
                tag: Cow::Owned(template.tag.to_string()),
                props: template
                    .props
                    .iter()
                    .map(|(k, v)| (k.clone(), v.to_static()))
                    .collect(),
                children: template
                    .children
                    .iter()
                    .map(|c| Box::new(c.to_static()))
                    .collect(),
                is_element: template.is_element,
                is_text: template.is_text,
            }),
            ViewUnit::Comment(comment) => ViewUnit::Comment(CommentUnit {
                type_: Cow::Owned(comment.type_.to_string()),
                content: Cow::Owned(comment.content.to_string()),
            }),
        }
    }
}

// 将Event转换为静态生命周期
impl<'a> Event<'a> {
    pub fn to_static(&self) -> Event<'static> {
        Event {
            name: Cow::Owned(self.name.to_string()),
            handler: Cow::Owned(self.handler.to_string()),
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
            is_capture: self.is_capture,
            modifiers: self
                .modifiers
                .iter()
                .map(|m| Cow::Owned(m.to_string()))
                .collect(),
            bitmap: self.bitmap.clone(),
        }
    }
}

// 将UnitProp转换为静态生命周期
impl UnitProp<'_> {
    pub fn to_static(&self) -> UnitProp<'static> {
        UnitProp {
            value: Cow::Owned(self.value.to_string()),
            view_prop_map: self
                .view_prop_map
                .iter()
                .map(|(k, v)| (k.clone(), v.iter().map(|p| p.to_static()).collect()))
                .collect(),
            specifier: self.specifier.as_ref().map(|s| Cow::Owned(s.to_string())),
            is_event: self.is_event,
            is_function: self.is_function,
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
        }
    }
}

// 将PropValue转换为静态生命周期
impl PropValue<'_> {
    pub fn to_static(&self) -> PropValue<'static> {
        PropValue {
            value: Cow::Owned(self.value.to_string()),
            dependencies: self
                .dependencies
                .iter()
                .map(|d| Cow::Owned(d.to_string()))
                .collect(),
            is_event: self.is_event,
            dep_id_bitmap: self.dep_id_bitmap,
            is_boolean: self.is_boolean,
            is_function: self.is_function,
            is_number: self.is_number,
            is_object: self.is_object,
        }
    }
}

// 将DependencyValue转换为静态生命周期
impl<T: Clone> DependencyValue<T> {
    pub fn to_static(&self) -> DependencyValue<T> {
        DependencyValue {
            value: self.value.clone(),
            dependencies_node: self.dependencies_node.clone(),
            dep_id_bitmap: self.dep_id_bitmap,
        }
    }
}
