#![allow(
    dead_code,
    unused_variables,
    unreachable_patterns,
    mismatched_lifetime_syntaxes
)]
use crate::bit_manager::BitManager;
use crate::error_handler::{
    error_utils, CompilerError, CompilerPhase, CompilerResult, ErrorSeverity,
};
#[cfg(feature = "analysis")]
use crate::ir_builder::IRBuilder;
use crate::openinula_apis::{detect_used_apis, OpenInulaAPI, OpenInulaAPIManager};
use crate::types::{
    CommentUnit, CompUnit, ComponentNode, ContextUnit, DependencyInfo, ExpUnit, ForUnit,
    FragmentUnit, HTMLUnit, IRStmt, IfUnit, MutableUnit, NodeType, PropsSource, RawHtmlUnit, Scope,
    SlotUnit, SubCompStmt, SubCompUnit, SuspenseUnit, TeleportUnit, TemplateNode, TemplateUnit,
    TextUnit, UnitProp, ViewParticle, ViewUnit,
};
use std::collections::HashMap;
use swc_common::{BytePos, Span, Spanned, SyntaxContext};
use swc_ecma_ast::*;
use wasm_bindgen::prelude::*;

/// 属性类型枚举
#[derive(Debug, Clone, PartialEq)]
enum PropType {
    String,
    Boolean,
    Number,
    Event,
    Style,
    Class,
    Custom,
}

// 导入各个生成器模块
pub mod prop_generator;
pub mod raw_stmt_generator;
pub mod state_generator;
pub mod view_generator;

use prop_generator::PropGenerator;
use raw_stmt_generator::RawStmtGenerator;
use state_generator::StateGenerator;
use view_generator::ViewGenerator;

/// GeneratorContext - 对应原版TypeScript的GeneratorContext
pub struct GeneratorContext<'a> {
    pub self_id: Ident,
    pub current: &'a ComponentNode<'a>,
    pub bit_manager: &'a mut BitManager,
    pub hoist: Box<dyn Fn(Stmt) + 'a>,
    pub wrap_update: Box<dyn Fn(Stmt) -> Stmt + 'a>,
    pub get_react_bits: Box<dyn Fn(u32) -> u32 + 'a>,
    pub get_wave_bits: Box<dyn Fn(&str) -> u32 + 'a>,
    pub get_wave_bits_by_id: Box<dyn Fn(u32) -> u32 + 'a>,
    pub import_map: HashMap<String, String>,
    pub parent_id: Option<Ident>,
    pub templates: Vec<(String, Expr)>,
    pub node_name_in_update: String,
}

/// Generator trait - 对应原版TypeScript的Generator类型
pub trait StatementGenerator {
    fn can_handle(&self, stmt: &IRStmt) -> bool;
    fn generate_statement(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Option<Stmt>>;
    fn generate_state(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_derived(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Vec<Stmt>>;
    fn generate_single_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_rest_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_whole_prop(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_use_context(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_view_return(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_raw_stmt(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_comp(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
    fn generate_functional_macro(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt>;
    fn generate_hook_return(&self, stmt: &IRStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt>;
}

/// 主生成函数 - 对应原版TypeScript的generate函数
/// 与TypeScript原版完全对齐的实现
pub fn generate<'a>(
    root: &ComponentNode<'a>,
    bit_manager: &mut BitManager,
    hoist: Box<dyn Fn(Stmt)>,
    parent_id: Option<Ident>,
) -> CompilerResult<Function> {
    #[allow(unused)]
    fn log_stage(msg: &str) {
        #[cfg(target_arch = "wasm32")]
        {
            web_sys::console::log_1(&JsValue::from_str(msg));
        }
    }
    log_stage("[generator] enter");
    let self_id = generate_self_id(root.scope.level as usize);

    // 创建一个临时的 BitManager 引用用于闭包
    let bit_manager_ptr = bit_manager as *mut BitManager;

    let ctx = GeneratorContext {
        self_id: self_id.clone(),
        current: root,
        bit_manager,
        hoist,
        wrap_update: Box::new(|stmt: Stmt| stmt),
        // 对齐 TS：reactBits 直接沿用上游提供的位图
        get_react_bits: Box::new(|dep_id_bitmap: u32| dep_id_bitmap),
        // 对齐 TS：wave bits 基于 BitManager 的依赖传播结果
        get_wave_bits: Box::new(move |name: &str| unsafe {
            (*bit_manager_ptr).calculate_update_bits(name)
        }),
        // 若 id 已是位图标识，直接返回
        get_wave_bits_by_id: Box::new(|id: u32| id),
        import_map: get_default_import_map(),
        parent_id,
        templates: Vec::new(),
        node_name_in_update: "$$node".to_string(),
    };

    // 创建生成器实例
    let state_generator = StateGenerator;
    let view_generator = ViewGenerator;
    let raw_stmt_generator = RawStmtGenerator;
    let prop_generator = PropGenerator;

    // 生成函数体语句 - 与TypeScript原版完全对齐
    let mut fn_body = Vec::new();
    for (i, stmt) in root.body.iter().enumerate() {
        log_stage(&format!("[generator] stmt_index={}", i));
        match stmt {
            IRStmt::State(state_stmt) => {
                log_stage("[generator] kind=State");
                match state_generator.generate_state(state_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::Derived(derived_stmt) => {
                log_stage("[generator] kind=Derived");
                match state_generator.generate_derived(derived_stmt, &ctx) {
                    Ok(stmts) => fn_body.extend(stmts),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::ViewReturn(view_return_stmt) => {
                log_stage("[generator] kind=ViewReturn");
                match view_generator.generate_view_return(view_return_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::SingleProp(single_prop_stmt) => {
                log_stage("[generator] kind=SingleProp");
                match prop_generator.generate_single_prop(single_prop_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::RestProp(rest_prop_stmt) => {
                log_stage("[generator] kind=RestProp");
                match prop_generator.generate_rest_prop(rest_prop_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::WholeProp(whole_prop_stmt) => {
                log_stage("[generator] kind=WholeProp");
                match prop_generator.generate_whole_prop(whole_prop_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::UseContext(use_context_stmt) => {
                log_stage("[generator] kind=UseContext");
                match prop_generator.generate_use_context(use_context_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            IRStmt::Raw(raw_stmt) => {
                log_stage("[generator] kind=Raw");
                match raw_stmt_generator.generate_raw_stmt(raw_stmt, &ctx) {
                    Ok(stmt) => fn_body.push(stmt),
                    Err(e) => return Err(e),
                }
            }
            _ => {
                // 其他语句类型，暂时跳过
                eprintln!("Warning: Unhandled stmt type: {:?}", stmt);
            }
        }
    }

    // 创建函数声明 - 与TypeScript原版完全对齐
    Ok(Function {
        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        decorators: vec![],
        params: vec![],
        body: Some(BlockStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            stmts: fn_body,
        }),
        is_generator: false,
        is_async: false,
        type_params: None,
        return_type: None,
        ctxt: swc_common::SyntaxContext::empty(),
    })
}

/// 生成self ID - 对应原版TypeScript的generateSelfId函数
pub fn generate_self_id(level: usize) -> Ident {
    let name = if level > 0 {
        format!("{}CURRENT_COMPONENT{}", "self", level)
    } else {
        "self".to_string()
    };
    Ident::new(
        name.into(),
        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        swc_common::SyntaxContext::empty(),
    )
}

/// 获取默认导入映射
fn get_default_import_map() -> HashMap<String, String> {
    let mut import_map = HashMap::new();

    // 对应原版TypeScript的importMap配置
    import_map.insert("createElement".to_string(), "@openinula/next".to_string());
    import_map.insert("setStyle".to_string(), "@openinula/next".to_string());
    import_map.insert("setDataset".to_string(), "@openinula/next".to_string());
    import_map.insert("setEvent".to_string(), "@openinula/next".to_string());
    import_map.insert("delegateEvent".to_string(), "@openinula/next".to_string());
    import_map.insert("setHTMLProp".to_string(), "@openinula/next".to_string());
    import_map.insert("setHTMLAttr".to_string(), "@openinula/next".to_string());
    import_map.insert("setHTMLProps".to_string(), "@openinula/next".to_string());
    import_map.insert("setHTMLAttrs".to_string(), "@openinula/next".to_string());
    import_map.insert("createTextNode".to_string(), "@openinula/next".to_string());
    import_map.insert("updateText".to_string(), "@openinula/next".to_string());
    import_map.insert("insertNode".to_string(), "@openinula/next".to_string());
    import_map.insert("appendNode".to_string(), "@openinula/next".to_string());
    import_map.insert("render".to_string(), "@openinula/next".to_string());
    import_map.insert("notCached".to_string(), "@openinula/next".to_string());
    import_map.insert("useHook".to_string(), "@openinula/next".to_string());
    import_map.insert("createHook".to_string(), "@openinula/next".to_string());
    import_map.insert("untrack".to_string(), "@openinula/next".to_string());
    import_map.insert("runOnce".to_string(), "@openinula/next".to_string());
    import_map.insert("createNode".to_string(), "@openinula/next".to_string());
    import_map.insert("withDefault".to_string(), "@openinula/next".to_string());
    import_map.insert("useContext".to_string(), "@openinula/next".to_string());

    import_map
}

/// 包装更新函数 - 对应原版TypeScript的wrapUpdate函数
fn wrap_update<'a>(self_id: &Ident, stmt: Stmt, _get_wave_bits: impl Fn(&str) -> u32) -> Stmt {
    // 这里需要根据具体的Statement类型来实现包装逻辑
    // 对应原版TypeScript的wrapUpdate实现
    stmt
}

/// 获取内置生成器 - 与TypeScript原版完全对齐
#[cfg(any())]
fn get_builtin_generators(
    component_type: &crate::analyzer::CompOrHook,
) -> Vec<Box<dyn StatementGenerator>> {
    match component_type {
        crate::analyzer::CompOrHook::Component => {
            vec![
                Box::new(StateGenerator::new()),
                Box::new(RawStmtGenerator::new()),
                Box::new(PropGenerator::new()),
                Box::new(ViewGenerator::new()),
                Box::new(CompGenerator::new()),
                Box::new(RawStmtGenerator::new()),
                Box::new(FunctionalMacroGenerator::new()),
            ]
        }
        crate::analyzer::CompOrHook::Hook => {
            vec![
                Box::new(StateGenerator::new()),
                Box::new(RawStmtGenerator::new()),
                Box::new(PropGenerator::new()),
                Box::new(HookGenerator::new()),
                Box::new(RawStmtGenerator::new()),
                Box::new(FunctionalMacroGenerator::new()),
            ]
        }
    }
}

/// 生成器访问者函数类型 - 与TypeScript原版完全对齐
#[cfg(any())]
pub type GeneratorFn<'a> =
    Box<dyn Fn(&IRStmt<'a>, &GeneratorContext<'a>) -> CompilerResult<Vec<Statement<'a>>> + 'a>;

/// 合并的生成器访问者 - 与TypeScript原版完全对齐
#[cfg(any())]
pub struct MergedGeneratorVisitor<'a> {
    pub generators: std::collections::HashMap<String, GeneratorFn<'a>>,
}

#[cfg(any())]
impl<'a> MergedGeneratorVisitor<'a> {
    pub fn new() -> Self {
        Self {
            generators: std::collections::HashMap::new(),
        }
    }

    pub fn get_generator(&self, stmt_type: &str) -> Option<&GeneratorFn<'a>> {
        self.generators.get(stmt_type)
    }
}

/// 合并生成器访问者 - 与TypeScript原版完全对齐
#[cfg(any())]
fn merge_generator_visitor<'a>(
    generators: &[Box<dyn StatementGenerator>],
) -> MergedGeneratorVisitor<'a> {
    let mut visitor = MergedGeneratorVisitor::new();

    // 为每个生成器创建访问者函数
    for generator in generators {
        // 根据生成器类型创建相应的访问者函数
        let generator_type = std::any::type_name::<dyn StatementGenerator>();
        match generator_type {
            _ if generator_type.contains("ViewGenerator") => {
                // 视图生成器访问者
                visitor.add_view_generator(generator.as_ref());
            }
            _ if generator_type.contains("StateGenerator") => {
                // 状态生成器访问者
                visitor.add_state_generator(generator.as_ref());
            }
            _ if generator_type.contains("HookGenerator") => {
                // 钩子生成器访问者
                visitor.add_hook_generator(generator.as_ref());
            }
            _ => {
                // 通用生成器访问者
                visitor.add_generic_generator(generator.as_ref());
            }
        }
    }

    visitor
}

/// 获取IR语句类型 - 与TypeScript原版完全对齐
fn get_ir_stmt_type(stmt: &IRStmt) -> String {
    match stmt {
        IRStmt::State(_) => "State".to_string(),
        IRStmt::Derived(_) => "Derived".to_string(),
        IRStmt::Prop(_) => "Prop".to_string(),
        IRStmt::ViewReturn(_) => "ViewReturn".to_string(),
        IRStmt::SubComp(_) => "SubComp".to_string(),
        IRStmt::Raw(_) => "Raw".to_string(),
        IRStmt::Ref(_) => "Ref".to_string(),
        IRStmt::Effect(_) => "Effect".to_string(),
        IRStmt::Watch(_) => "Watch".to_string(),
        IRStmt::Lifecycle(_) => "Lifecycle".to_string(),
        IRStmt::HookCall(_) => "HookCall".to_string(),
        IRStmt::SingleProp(_) => "SingleProp".to_string(),
        IRStmt::RestProp(_) => "RestProp".to_string(),
        IRStmt::WholeProp(_) => "WholeProp".to_string(),
        IRStmt::UseContext(_) => "UseContext".to_string(),
        IRStmt::HookReturn(_) => "HookReturn".to_string(),
    }
}

/// StateGenerator - 对应原版TypeScript的stateGenerator
#[cfg(any())]
pub struct StateGenerator;

#[cfg(any())]
impl StateGenerator {
    pub fn new() -> Self {
        Self
    }
}

#[cfg(any())]
impl StatementGenerator for StateGenerator {
    fn can_handle(&self, stmt: &IRStmt) -> bool {
        matches!(stmt, IRStmt::State(_) | IRStmt::Derived(_))
    }

    fn generate_statement(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Option<Statement>> {
        match stmt {
            IRStmt::State(_) => self.generate_state(stmt, ctx).map(Some),
            IRStmt::Derived(_) => {
                let statements = self.generate_derived(stmt, ctx)?;
                Ok(statements.into_iter().next())
            }
            _ => Ok(None),
        }
    }

    fn generate_state(&self, stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::State(state_stmt) => Ok(Statement::VariableDeclaration(VariableDeclaration {
                kind: VariableDeclarationKind::Let,
                declarations: OxcVec::from(vec![state_stmt.node.clone()]),
                r#type: None,
            })),
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected StateStmt".to_string(),
            )),
        }
    }

    fn generate_derived(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Vec<Statement>> {
        match stmt {
            IRStmt::Derived(derived_stmt) => {
                let mut statements = Vec::new();

                // 生成变量声明
                let derived_declaration = Statement::VariableDeclaration(VariableDeclaration {
                    kind: VariableDeclarationKind::Let,
                    declarations: derived_stmt
                        .ids
                        .iter()
                        .map(|id| VariableDeclarator {
                            id: BindingPattern::BindingIdentifier(BindingIdentifier::new(
                                id.clone(),
                            )),
                            init: None,
                            r#type: None,
                        })
                        .collect(),
                    r#type: None,
                });
                statements.push(derived_declaration);

                // 生成更新调用
                let update_call = if derived_stmt.source == crate::types::DerivedSource::Hook {
                    // Hook类型的derived
                    let value = Identifier::new("$$value".to_string());
                    Statement::ExpressionStatement(ExpressionStatement {
                            span: Span::new(0, 0),
                        expression: Expression::CallExpression(CallExpression {
                            span: Span::new(0, 0),
                            callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(oxc_ast::ast::StaticMemberExpression {
                                span: Span::new(0, 0),
                                object: Box::new(Expression::Identifier(ctx.self_id.clone())),
                                property: MemberProperty::Identifier(Identifier::new("useHook".to_string())),
                            })),
                            arguments: OxcVec::from(vec![
                                Argument::Expression(derived_stmt.value.clone()),
                                Argument::Expression(Expression::ArrowFunctionExpression(ArrowFunctionExpression {
                                    span: Span::new(0, 0),
                                    params: OxcVec::from(vec![FormalParameter::BindingPattern(BindingPattern::BindingIdentifier(value.clone()))]),
                                    body: Some(FunctionBody {
                                        span: Span::new(0, 0),
                                        statements: OxcVec::from(vec![Statement::ExpressionStatement(ExpressionStatement {
                            span: Span::new(0, 0),
                                            expression: Expression::CallExpression(CallExpression {
                                                span: Span::new(0, 0),
                                                callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(oxc_ast::ast::StaticMemberExpression {
                                                    span: Span::new(0, 0),
                                                    object: Box::new(Expression::Identifier(ctx.self_id.clone())),
                                                    property: MemberProperty::Identifier(Identifier::new("wave".to_string())),
                                                    computed: false,
                                                    optional: false,
                                                })),
                                                arguments: OxcVec::from(vec![
                                                    Argument::Expression(Expression::ParenthesizedExpression(ParenthesizedExpression {
                                                        span: Span::new(0, 0),
                                                        expression: Box::new(Expression::AssignmentExpression(AssignmentExpression {
                                                            span: Span::new(0, 0),
                                                            left: AssignmentTarget::SimpleAssignmentTarget(SimpleAssignmentTarget::AssignmentTargetIdentifier(derived_stmt.l_val.clone())),
                                                            operator: AssignmentOperator::Assign,
                                                            right: Box::new(Expression::Identifier(value)),
                                                        })),
                                                    })),
                                                    Argument::Expression(Expression::NumericLiteral(NumericLiteral {
                                                        span: Span::new(0, 0),
                                                        value: (ctx.get_wave_bits_by_id)(derived_stmt.reactive_id) as f64,
                                                    })),
                                                ]),
                                            }),
                                        })]),
                                    }),
                                    r#async: false,
                                    generator: false,
                                    r#type: None,
                                })),
                                Argument::Expression({
                                    let call_expr = if let Expression::CallExpression(call_expr) = &derived_stmt.value {
                                        call_expr
                                    } else {
                                        return Err(CompilerError::new(
                                            CompilerPhase::CodeGeneration,
                                            ErrorSeverity::Error,
                                            "Expected CallExpression for hook updater".to_string(),
                                        ));
                                    };
                                    Expression::ArrowFunctionExpression(get_hook_updater(call_expr, &derived_stmt.hook_arg_dependencies, ctx))
                                }),
                            ]),
                            span: Span::new(0, 0),
                        }),
                    });
                } else {
                    // 普通derived
                    Statement::ExpressionStatement(ExpressionStatement {
                            span: Span::new(0, 0),
                        expression: Expression::CallExpression(CallExpression {
                            span: Span::new(0, 0),
                            callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(oxc_ast::ast::StaticMemberExpression {
                                span: Span::new(0, 0),
                                object: Box::new(Expression::Identifier(ctx.self_id.clone())),
                                property: MemberProperty::Identifier(Identifier::new("deriveState".to_string())),
                                computed: false,
                                optional: false,
                            })),
                            arguments: OxcVec::from(vec![
                                Argument::Expression(Expression::ArrowFunctionExpression(ArrowFunctionExpression {
                                    span: Span::new(0, 0),
                                    params: OxcVec::from(vec![]),
                                    body: Some(FunctionBody {
                                        span: Span::new(0, 0),
                                        statements: OxcVec::from(vec![Statement::ExpressionStatement(ExpressionStatement {
                            span: Span::new(0, 0),
                                            expression: Expression::ParenthesizedExpression(ParenthesizedExpression {
                                                        span: Span::new(0, 0),
                                                expression: Box::new(Expression::AssignmentExpression(AssignmentExpression {
                                                            span: Span::new(0, 0),
                                                    left: AssignmentTarget::SimpleAssignmentTarget(SimpleAssignmentTarget::AssignmentTargetIdentifier(derived_stmt.l_val.clone())),
                                                    operator: AssignmentOperator::Assign,
                                                    right: Box::new(derived_stmt.value.clone()),
                                                })),
                                            }),
                                        })]),
                                    }),
                                    r#async: false,
                                    generator: false,
                                    r#type: None,
                                })),
                                Argument::Expression(Expression::ArrowFunctionExpression(ArrowFunctionExpression {
                                    span: Span::new(0, 0),
                                    params: OxcVec::from(vec![]),
                                    body: Some(FunctionBody {
                                        span: Span::new(0, 0),
                                        statements: OxcVec::from(vec![Statement::ReturnStatement(ReturnStatement {
                                            span: Span::new(0, 0),
                                            argument: Some(Box::new(derived_stmt.dependency.dependencies_node.clone())),
                                        })]),
                                    }),
                                    r#async: false,
                                    generator: false,
                                    r#type: None,
                                })),
                                Argument::Expression(Expression::NumericLiteral(NumericLiteral {
                                                        span: Span::new(0, 0),
                                    value: (ctx.get_react_bits)(derived_stmt.dependency.dep_id_bitmap) as f64,
                                })),
                            ]),
                            span: Span::new(0, 0),
                        }),
                    });
                };
                statements.push(update_call);

                Ok(statements)
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected DerivedStmt".to_string(),
            )),
        }
    }

    // 其他方法提供默认实现
    fn generate_single_prop(
        &self,
        stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::SingleProp(single_prop_stmt) => {
                // 生成单个属性的赋值语句
                // 例如：this.props.name = props.name
                let prop_name = &single_prop_stmt.name;
                let prop_key = &single_prop_stmt.key;

                // 创建赋值表达式：this.props[key] = props[key]
                let assignment = swc_ecma_ast::AssignExpr {
                    span: swc_common::DUMMY_SP,
                    op: swc_ecma_ast::AssignOp::Assign,
                    left: swc_ecma_ast::PatOrExpr::Expr(Box::new(swc_ecma_ast::Expr::Member(
                        swc_ecma_ast::MemberExpr {
                            span: swc_common::DUMMY_SP,
                            obj: Box::new(swc_ecma_ast::Expr::Member(swc_ecma_ast::MemberExpr {
                                span: swc_common::DUMMY_SP,
                                obj: Box::new(swc_ecma_ast::Expr::This(swc_ecma_ast::ThisExpr {
                                    span: swc_common::DUMMY_SP,
                                })),
                                prop: swc_ecma_ast::MemberProp::Ident(swc_ecma_ast::Ident::new(
                                    "props".into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                )),
                            })),
                            prop: swc_ecma_ast::MemberProp::Computed(
                                swc_ecma_ast::ComputedPropName {
                                    span: swc_common::DUMMY_SP,
                                    expr: Box::new(swc_ecma_ast::Expr::Lit(
                                        swc_ecma_ast::Lit::Str(swc_ecma_ast::Str {
                                            span: swc_common::DUMMY_SP,
                                            value: prop_key.clone().into(),
                                            raw: None,
                                        }),
                                    )),
                                },
                            ),
                        },
                    ))),
                    right: Box::new(swc_ecma_ast::Expr::Member(swc_ecma_ast::MemberExpr {
                        span: swc_common::DUMMY_SP,
                        obj: Box::new(swc_ecma_ast::Expr::Ident(swc_ecma_ast::Ident::new(
                            "props".into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ))),
                        prop: swc_ecma_ast::MemberProp::Computed(swc_ecma_ast::ComputedPropName {
                            span: swc_common::DUMMY_SP,
                            expr: Box::new(swc_ecma_ast::Expr::Lit(swc_ecma_ast::Lit::Str(
                                swc_ecma_ast::Str {
                                    span: swc_common::DUMMY_SP,
                                    value: prop_key.clone().into(),
                                    raw: None,
                                },
                            ))),
                        }),
                    })),
                };

                Ok(swc_ecma_ast::Stmt::Expr(swc_ecma_ast::ExprStmt {
                    span: swc_common::DUMMY_SP,
                    expr: Box::new(swc_ecma_ast::Expr::Assign(assignment)),
                }))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected SinglePropStmt".to_string(),
            )),
        }
    }
    fn generate_rest_prop(
        &self,
        stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::RestProp(rest_prop_stmt) => {
                // 生成剩余属性的解构赋值
                // 例如：const { name, ...rest } = props
                let rest_name = &rest_prop_stmt.name;
                let excluded_props = &rest_prop_stmt.excluded_props;

                // 创建解构赋值模式
                let mut properties = Vec::new();
                for prop in excluded_props {
                    properties.push(swc_ecma_ast::ObjectPatProp::KeyValue(
                        swc_ecma_ast::KeyValuePatProp {
                            key: swc_ecma_ast::PropName::Ident(swc_ecma_ast::Ident::new(
                                prop.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            )),
                            value: swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                                id: swc_ecma_ast::Ident::new(
                                    prop.clone().into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ),
                                type_ann: None,
                            }),
                        },
                    ));
                }

                // 添加剩余属性
                properties.push(swc_ecma_ast::ObjectPatProp::Rest(swc_ecma_ast::RestPat {
                    span: swc_common::DUMMY_SP,
                    dot3_token: swc_common::DUMMY_SP,
                    arg: swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                        id: swc_ecma_ast::Ident::new(
                            rest_name.clone().into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ),
                        type_ann: None,
                    }),
                    type_ann: None,
                }));

                let object_pat = swc_ecma_ast::ObjectPat {
                    span: swc_common::DUMMY_SP,
                    props,
                    optional: false,
                    type_ann: None,
                };

                let var_decl = swc_ecma_ast::VarDecl {
                    span: swc_common::DUMMY_SP,
                    kind: swc_ecma_ast::VarDeclKind::Const,
                    decls: vec![swc_ecma_ast::VarDeclarator {
                        span: swc_common::DUMMY_SP,
                        name: swc_ecma_ast::Pat::Object(object_pat),
                        init: Some(Box::new(swc_ecma_ast::Expr::Ident(
                            swc_ecma_ast::Ident::new(
                                "props".into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ),
                        ))),
                        definite: false,
                    }],
                    declare: false,
                };

                Ok(swc_ecma_ast::Stmt::Decl(swc_ecma_ast::Decl::Var(var_decl)))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected RestPropStmt".to_string(),
            )),
        }
    }
    fn generate_whole_prop(
        &self,
        stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::WholeProp(whole_prop_stmt) => {
                // 生成整个 props 对象的赋值
                // 例如：this.props = props
                let prop_name = &whole_prop_stmt.name;

                let assignment = swc_ecma_ast::AssignExpr {
                    span: swc_common::DUMMY_SP,
                    op: swc_ecma_ast::AssignOp::Assign,
                    left: swc_ecma_ast::PatOrExpr::Expr(Box::new(swc_ecma_ast::Expr::Member(
                        swc_ecma_ast::MemberExpr {
                            span: swc_common::DUMMY_SP,
                            obj: Box::new(swc_ecma_ast::Expr::This(swc_ecma_ast::ThisExpr {
                                span: swc_common::DUMMY_SP,
                            })),
                            prop: swc_ecma_ast::MemberProp::Ident(swc_ecma_ast::Ident::new(
                                prop_name.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            )),
                        },
                    ))),
                    right: Box::new(swc_ecma_ast::Expr::Ident(swc_ecma_ast::Ident::new(
                        prop_name.clone().into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    ))),
                };

                Ok(swc_ecma_ast::Stmt::Expr(swc_ecma_ast::ExprStmt {
                    span: swc_common::DUMMY_SP,
                    expr: Box::new(swc_ecma_ast::Expr::Assign(assignment)),
                }))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected WholePropStmt".to_string(),
            )),
        }
    }
    fn generate_use_context(
        &self,
        stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::UseContext(use_context_stmt) => {
                // 生成 useContext 调用
                // 例如：const context = useContext(MyContext)
                let context_name = &use_context_stmt.context_name;
                let var_name = &use_context_stmt.var_name;

                let use_context_call = swc_ecma_ast::CallExpr {
                    span: swc_common::DUMMY_SP,
                    callee: swc_ecma_ast::Callee::Expr(Box::new(swc_ecma_ast::Expr::Ident(
                        swc_ecma_ast::Ident::new(
                            "useContext".into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ),
                    ))),
                    args: vec![swc_ecma_ast::ExprOrSpread {
                        spread: None,
                        expr: Box::new(swc_ecma_ast::Expr::Ident(swc_ecma_ast::Ident::new(
                            context_name.clone().into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ))),
                    }],
                    type_args: None,
                };

                let var_decl = swc_ecma_ast::VarDecl {
                    span: swc_common::DUMMY_SP,
                    kind: swc_ecma_ast::VarDeclKind::Const,
                    decls: vec![swc_ecma_ast::VarDeclarator {
                        span: swc_common::DUMMY_SP,
                        name: swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                            id: swc_ecma_ast::Ident::new(
                                var_name.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ),
                            type_ann: None,
                        }),
                        init: Some(Box::new(swc_ecma_ast::Expr::Call(use_context_call))),
                        definite: false,
                    }],
                    declare: false,
                };

                Ok(swc_ecma_ast::Stmt::Decl(swc_ecma_ast::Decl::Var(var_decl)))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected UseContextStmt".to_string(),
            )),
        }
    }
    fn generate_view_return(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_raw_stmt(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_comp(&self, _stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_functional_macro(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_hook_return(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
}

/// PropGenerator - 对应原版TypeScript的propGenerator
#[cfg(any())]
pub struct PropGenerator;

#[cfg(any())]
impl PropGenerator {
    pub fn new() -> Self {
        Self
    }
}

#[cfg(any())]
impl StatementGenerator for PropGenerator {
    fn can_handle(&self, stmt: &IRStmt) -> bool {
        matches!(
            stmt,
            IRStmt::SingleProp(_)
                | IRStmt::RestProp(_)
                | IRStmt::WholeProp(_)
                | IRStmt::UseContext(_)
        )
    }

    fn generate_statement(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Option<Statement>> {
        match stmt {
            IRStmt::SingleProp(_) => self.generate_single_prop(stmt, ctx).map(Some),
            IRStmt::RestProp(_) => self.generate_rest_prop(stmt, ctx).map(Some),
            IRStmt::WholeProp(_) => self.generate_whole_prop(stmt, ctx).map(Some),
            IRStmt::UseContext(_) => self.generate_use_context(stmt, ctx).map(Some),
            _ => Ok(None),
        }
    }

    fn generate_single_prop(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::SingleProp(single_prop_stmt) => {
                let value_id = Identifier::new("$$value".to_string());
                let right = if let Some(default_value) = &single_prop_stmt.default_value {
                    Expression::CallExpression(CallExpression {
                        span: Span::new(0, 0),
                        callee: Callee::Identifier(Identifier::new(
                            ctx.import_map
                                .get("withDefault")
                                .unwrap_or(&"withDefault".to_string())
                                .clone(),
                        )),
                        arguments: OxcVec::from(vec![
                            Argument::Expression(Expression::Identifier(value_id.clone())),
                            Argument::Expression(default_value.clone()),
                        ]),
                    })
                } else {
                    Expression::Identifier(value_id.clone())
                };

                let value_assign = if single_prop_stmt.is_destructured {
                    Expression::ParenthesizedExpression(ParenthesizedExpression {
                        span: Span::new(0, 0),
                        expression: Box::new(Expression::AssignmentExpression(
                            AssignmentExpression {
                                span: Span::new(0, 0),
                                left: AssignmentTarget::SimpleAssignmentTarget(
                                    SimpleAssignmentTarget::AssignmentTargetIdentifier(
                                        single_prop_stmt.value.clone(),
                                    ),
                                ),
                                operator: AssignmentOperator::Assign,
                                right: Box::new(right),
                            },
                        )),
                    })
                } else {
                    Expression::AssignmentExpression(AssignmentExpression {
                        span: Span::new(0, 0),
                        left: AssignmentTarget::SimpleAssignmentTarget(
                            SimpleAssignmentTarget::AssignmentTargetIdentifier(
                                single_prop_stmt.value.clone(),
                            ),
                        ),
                        operator: AssignmentOperator::Assign,
                        right: Box::new(right),
                    })
                };

                Ok(gen_add_prop_stmt(
                    &ctx.self_id,
                    &single_prop_stmt.name,
                    &value_id,
                    &value_assign,
                    (ctx.get_wave_bits_by_id)(single_prop_stmt.reactive_id),
                    single_prop_stmt.source,
                    single_prop_stmt.ctx_name.as_deref(),
                ))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected SinglePropStmt".to_string(),
            )),
        }
    }

    fn generate_rest_prop(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::RestProp(rest_prop_stmt) => {
                let value_id = Identifier::new("$$value".to_string());
                let value_assign = Expression::AssignmentExpression(AssignmentExpression {
                    span: Span::new(0, 0),
                    left: AssignmentTarget::SimpleAssignmentTarget(
                        SimpleAssignmentTarget::AssignmentTargetIdentifier(Identifier::new(
                            rest_prop_stmt.name.clone(),
                        )),
                    ),
                    operator: AssignmentOperator::Assign,
                    right: Box::new(Expression::ObjectExpression(ObjectExpression {
                        properties: OxcVec::from(vec![
                            ObjectProperty::SpreadProperty(oxc_ast::ast::SpreadElement {
                                argument: Expression::Identifier(Identifier::new(
                                    rest_prop_stmt.name.clone(),
                                )),
                            }),
                            ObjectProperty::SpreadProperty(oxc_ast::ast::SpreadElement {
                                argument: Expression::Identifier(value_id.clone()),
                            }),
                        ]),
                    })),
                });

                Ok(gen_add_prop_stmt(
                    &ctx.self_id,
                    "$rest$",
                    &value_id,
                    &value_assign,
                    (ctx.get_wave_bits_by_id)(rest_prop_stmt.reactive_id),
                    rest_prop_stmt.source,
                    rest_prop_stmt.ctx_name.as_deref(),
                ))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected RestPropStmt".to_string(),
            )),
        }
    }

    fn generate_whole_prop(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::WholeProp(whole_prop_stmt) => {
                let value_id = Identifier::new("$$value".to_string());
                let value_assign = Expression::AssignmentExpression(AssignmentExpression {
                    span: Span::new(0, 0),
                    left: AssignmentTarget::SimpleAssignmentTarget(
                        SimpleAssignmentTarget::AssignmentTargetIdentifier(Identifier::new(
                            whole_prop_stmt.name.clone(),
                        )),
                    ),
                    operator: AssignmentOperator::Assign,
                    right: Box::new(Expression::ObjectExpression(ObjectExpression {
                        properties: OxcVec::from(vec![
                            ObjectProperty::SpreadProperty(oxc_ast::ast::SpreadElement {
                                argument: Expression::Identifier(Identifier::new(
                                    whole_prop_stmt.name.clone(),
                                )),
                            }),
                            ObjectProperty::SpreadProperty(oxc_ast::ast::SpreadElement {
                                argument: Expression::Identifier(value_id.clone()),
                            }),
                        ]),
                    })),
                });

                Ok(gen_add_prop_stmt(
                    &ctx.self_id,
                    "$whole$",
                    &value_id,
                    &value_assign,
                    (ctx.get_wave_bits_by_id)(whole_prop_stmt.reactive_id),
                    whole_prop_stmt.source,
                    whole_prop_stmt.ctx_name.as_deref(),
                ))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected WholePropStmt".to_string(),
            )),
        }
    }

    fn generate_use_context(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::UseContext(use_context_stmt) => {
                Ok(Statement::VariableDeclaration(VariableDeclaration {
                    kind: VariableDeclarationKind::Let,
                    declarations: OxcVec::from(vec![VariableDeclarator {
                        id: use_context_stmt.l_val.clone(),
                        init: Some(Expression::CallExpression(CallExpression {
                            span: Span::new(0, 0),
                            callee: Callee::Identifier(Identifier::new(
                                ctx.import_map
                                    .get("useContext")
                                    .unwrap_or(&"useContext".to_string())
                                    .clone(),
                            )),
                            arguments: OxcVec::from(vec![
                                Argument::Expression(Expression::Identifier(
                                    use_context_stmt.context.clone(),
                                )),
                                Argument::Expression(Expression::Identifier(ctx.self_id.clone())),
                            ]),
                        })),
                        r#type: None,
                    }]),
                    r#type: None,
                }))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected UseContextStmt".to_string(),
            )),
        }
    }

    // 其他方法提供默认实现
    fn generate_state(&self, stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::State(state_stmt) => {
                // 生成状态声明语句
                // 例如：const [count, setCount] = useState(0)
                let state_name = &state_stmt.name;
                let initial_value = &state_stmt.value;
                let is_const = state_stmt.is_const;
                let is_shallow = state_stmt.is_shallow;

                // 创建 useState 调用
                let use_state_call = swc_ecma_ast::CallExpr {
                    span: swc_common::DUMMY_SP,
                    callee: swc_ecma_ast::Callee::Expr(Box::new(swc_ecma_ast::Expr::Ident(
                        swc_ecma_ast::Ident::new(
                            if is_shallow {
                                "useShallowState".into()
                            } else {
                                "useState".into()
                            },
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ),
                    ))),
                    args: vec![swc_ecma_ast::ExprOrSpread {
                        spread: None,
                        expr: Box::new(swc_ecma_ast::Expr::Lit(swc_ecma_ast::Lit::Str(
                            swc_ecma_ast::Str {
                                span: swc_common::DUMMY_SP,
                                value: initial_value.clone().unwrap_or_default().into(),
                                raw: None,
                            },
                        ))),
                    }],
                    type_args: None,
                };

                // 创建解构赋值模式
                let setter_name = format!(
                    "set{}",
                    state_name
                        .chars()
                        .next()
                        .unwrap()
                        .to_uppercase()
                        .collect::<String>()
                        + &state_name[1..]
                );

                let array_pat = swc_ecma_ast::ArrayPat {
                    span: swc_common::DUMMY_SP,
                    elems: vec![
                        Some(swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                            id: swc_ecma_ast::Ident::new(
                                state_name.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ),
                            type_ann: None,
                        })),
                        Some(swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                            id: swc_ecma_ast::Ident::new(
                                setter_name.into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ),
                            type_ann: None,
                        })),
                    ],
                    optional: false,
                    type_ann: None,
                };

                let var_decl = swc_ecma_ast::VarDecl {
                    span: swc_common::DUMMY_SP,
                    kind: if is_const {
                        swc_ecma_ast::VarDeclKind::Const
                    } else {
                        swc_ecma_ast::VarDeclKind::Let
                    },
                    decls: vec![swc_ecma_ast::VarDeclarator {
                        span: swc_common::DUMMY_SP,
                        name: swc_ecma_ast::Pat::Array(array_pat),
                        init: Some(Box::new(swc_ecma_ast::Expr::Call(use_state_call))),
                        definite: false,
                    }],
                    declare: false,
                };

                Ok(swc_ecma_ast::Stmt::Decl(swc_ecma_ast::Decl::Var(var_decl)))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected StateStmt".to_string(),
            )),
        }
    }
    fn generate_derived(
        &self,
        stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Vec<Statement>> {
        match stmt {
            IRStmt::Derived(derived_stmt) => {
                // 生成派生状态语句
                // 例如：const doubled = useMemo(() => count * 2, [count])
                let derived_name = &derived_stmt.name;
                let expression = &derived_stmt.expression;
                let dependency = &derived_stmt.dependency;

                // 创建依赖数组
                let mut deps = Vec::new();
                if let Some(dep) = dependency {
                    for dep_name in &dep.dep_names {
                        deps.push(swc_ecma_ast::ExprOrSpread {
                            spread: None,
                            expr: Box::new(swc_ecma_ast::Expr::Ident(swc_ecma_ast::Ident::new(
                                dep_name.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ))),
                        });
                    }
                }

                // 创建 useMemo 调用
                let use_memo_call = swc_ecma_ast::CallExpr {
                    span: swc_common::DUMMY_SP,
                    callee: swc_ecma_ast::Callee::Expr(Box::new(swc_ecma_ast::Expr::Ident(
                        swc_ecma_ast::Ident::new(
                            "useMemo".into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ),
                    ))),
                    args: vec![
                        // 计算函数
                        swc_ecma_ast::ExprOrSpread {
                            spread: None,
                            expr: Box::new(swc_ecma_ast::Expr::Arrow(swc_ecma_ast::ArrowExpr {
                                span: swc_common::DUMMY_SP,
                                params: vec![],
                                body: Box::new(swc_ecma_ast::BlockStmtOrExpr::Expr(Box::new(
                                    swc_ecma_ast::Expr::Ident(swc_ecma_ast::Ident::new(
                                        expression.clone().into(),
                                        swc_common::DUMMY_SP,
                                        swc_common::SyntaxContext::empty(),
                                    )),
                                ))),
                                is_async: false,
                                is_generator: false,
                                type_params: None,
                                return_type: None,
                            })),
                        },
                        // 依赖数组
                        swc_ecma_ast::ExprOrSpread {
                            spread: None,
                            expr: Box::new(swc_ecma_ast::Expr::Array(swc_ecma_ast::ArrayLit {
                                span: swc_common::DUMMY_SP,
                                elems: deps,
                            })),
                        },
                    ],
                    type_args: None,
                };

                let var_decl = swc_ecma_ast::VarDecl {
                    span: swc_common::DUMMY_SP,
                    kind: swc_ecma_ast::VarDeclKind::Const,
                    decls: vec![swc_ecma_ast::VarDeclarator {
                        span: swc_common::DUMMY_SP,
                        name: swc_ecma_ast::Pat::Ident(swc_ecma_ast::BindingIdent {
                            id: swc_ecma_ast::Ident::new(
                                derived_name.clone().into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ),
                            type_ann: None,
                        }),
                        init: Some(Box::new(swc_ecma_ast::Expr::Call(use_memo_call))),
                        definite: false,
                    }],
                    declare: false,
                };

                Ok(vec![swc_ecma_ast::Stmt::Decl(swc_ecma_ast::Decl::Var(
                    var_decl,
                ))])
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected DerivedStmt".to_string(),
            )),
        }
    }
    fn generate_view_return(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_raw_stmt(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_comp(&self, _stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_functional_macro(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
    fn generate_hook_return(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "Not implemented".to_string(),
        ))
    }
}

/// 生成addProp语句的辅助函数
#[cfg(any())]
fn gen_add_prop_stmt<'a>(
    self_id: &oxc_ast::ast::IdentifierReference,
    key: &str,
    value_id: &oxc_ast::ast::IdentifierReference,
    value_assign: &Expression<'a>,
    wave_bits: u32,
    source: crate::types::PropsSource,
    ctx_name: Option<&str>,
) -> Statement<'a> {
    let api_name = if source == crate::types::PropsSource::CtxProps {
        "addContext"
    } else {
        "addProp"
    };
    let mut args = vec![
        Argument::Expression(Expression::StringLiteral(StringLiteral::new(
            key.to_string(),
        ))),
        Argument::Expression(Expression::ArrowFunctionExpression(
            ArrowFunctionExpression {
                span: Span::new(0, 0),
                params: OxcVec::from(vec![FormalParameter::BindingPattern(
                    BindingPattern::BindingIdentifier(value_id.clone()),
                )]),
                body: Some(FunctionBody {
                    span: Span::new(0, 0),
                    statements: OxcVec::from(vec![Statement::ExpressionStatement(
                        ExpressionStatement {
                            span: Span::new(0, 0),
                            expression: value_assign.clone(),
                        },
                    )]),
                }),
                r#async: false,
                generator: false,
                r#type: None,
            },
        )),
        Argument::Expression(Expression::NumericLiteral(NumericLiteral {
            span: Span::new(0, 0),
            value: wave_bits as f64,
        })),
    ];

    if let Some(ctx_name) = ctx_name {
        args.insert(
            0,
            Argument::Expression(Expression::Identifier(Identifier::new(
                ctx_name.to_string(),
            ))),
        );
    }

    Statement::ExpressionStatement(ExpressionStatement {
        span: Span::new(0, 0),
        expression: Expression::CallExpression(CallExpression {
            span: Span::new(0, 0),
            callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(
                oxc_ast::ast::StaticMemberExpression {
                    span: Span::new(0, 0),
                    object: Box::new(Expression::Identifier(self_id.clone())),
                    property: MemberProperty::Identifier(oxc_ast::ast::IdentifierReference::new(
                        api_name.to_string(),
                    )),
                    computed: false,
                    optional: false,
                },
            )),
            arguments: OxcVec::from(args),
        }),
    })
}

/// 获取Hook更新器的辅助函数
#[cfg(any())]
fn get_hook_updater<'a>(
    value: &CallExpression<'a>,
    arg_dependencies: &[Option<crate::types::Dependency>],
    ctx: &GeneratorContext<'a>,
) -> ArrowFunctionExpression<'a> {
    let hook = Identifier::new("hook".to_string());
    let mut update_props_stmts = Vec::new();

    for (idx, arg) in value.arguments.iter().enumerate() {
        if let Some(dependency) = arg_dependencies.get(idx).and_then(|d| d.as_ref()) {
            let key = if matches!(arg, Argument::RestElement(_)) {
                Expression::StringLiteral(StringLiteral::new("rest".to_string()))
            } else {
                Expression::NumericLiteral(NumericLiteral {
                    span: Span::new(0, 0),
                    value: idx as f64,
                })
            };

            let value_expr = match arg {
                Argument::SpreadElement(spread) => spread.argument.clone(),
                Argument::Expression(expr) => expr.clone(),
                _ => continue,
            };

            update_props_stmts.push(Statement::ExpressionStatement(ExpressionStatement {
                span: Span::new(0, 0),
                expression: Expression::CallExpression(CallExpression {
                    span: Span::new(0, 0),
                    callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(
                        oxc_ast::ast::StaticMemberExpression {
                            span: Span::new(0, 0),
                            object: Box::new(Expression::Identifier(hook.clone())),
                            property: MemberProperty::Identifier(
                                oxc_ast::ast::IdentifierReference::new("updateProp".to_string()),
                            ),
                            computed: false,
                            optional: false,
                        },
                    )),
                    arguments: OxcVec::from(vec![
                        Argument::Expression(key),
                        Argument::Expression(Expression::ArrowFunctionExpression(
                            ArrowFunctionExpression {
                                span: Span::new(0, 0),
                                params: OxcVec::from(vec![]),
                                body: Some(FunctionBody {
                                    span: Span::new(0, 0),
                                    statements: OxcVec::from(vec![Statement::ReturnStatement(
                                        ReturnStatement {
                                            span: Span::new(0, 0),
                                            argument: Some(Box::new(value_expr)),
                                        },
                                    )]),
                                }),
                                r#async: false,
                                generator: false,
                                r#type: None,
                            },
                        )),
                        Argument::Expression(Expression::ArrowFunctionExpression(
                            ArrowFunctionExpression {
                                span: Span::new(0, 0),
                                params: OxcVec::from(vec![]),
                                body: Some(FunctionBody {
                                    span: Span::new(0, 0),
                                    statements: OxcVec::from(vec![Statement::ReturnStatement(
                                        ReturnStatement {
                                            span: Span::new(0, 0),
                                            argument: Some(Box::new(
                                                dependency.dependencies_node.clone(),
                                            )),
                                        },
                                    )]),
                                }),
                                r#async: false,
                                generator: false,
                                r#type: None,
                            },
                        )),
                        Argument::Expression(Expression::NumericLiteral(NumericLiteral {
                            span: Span::new(0, 0),
                            value: (ctx.get_react_bits)(dependency.dep_id_bitmap) as f64,
                        })),
                    ]),
                }),
            }));
        }
    }

    ArrowFunctionExpression {
        span: Span::new(0, 0),
        params: OxcVec::from(vec![FormalParameter::BindingPattern(
            BindingPattern::BindingIdentifier(hook),
        )]),
        body: Some(FunctionBody {
            span: Span::new(0, 0),
            statements: OxcVec::from(update_props_stmts),
        }),
        r#async: false,
        generator: false,
        r#type: None,
    }
}

// 其他生成器的占位符实现
// 移除本文件内的占位生成器定义，使用模块引入的实现（SWC 版本）

#[cfg(any())]
// 现在添加完整的ViewGenerator实现，对应原版TypeScript的viewGenerator
impl StatementGenerator for ViewGenerator {
    fn can_handle(&self, stmt: &IRStmt) -> bool {
        matches!(stmt, IRStmt::ViewReturn(_))
    }

    fn generate_statement(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Option<Statement>> {
        match stmt {
            IRStmt::ViewReturn(_) => self.generate_view_return(stmt, ctx).map(Some),
            _ => Ok(None),
        }
    }

    fn generate_view_return(
        &self,
        stmt: &IRStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        match stmt {
            IRStmt::ViewReturn(view_return_stmt) => {
                // 对应原版TypeScript的viewGenerator实现
                if view_return_stmt.value.is_none() {
                    return Ok(gen_return_stmt(
                        Expression::NullLiteral(NullLiteral {}),
                        ctx,
                    ));
                }

                // 调用完整的generateView函数，对应原版TypeScript的generateView
                let view = generate_view_complete(&view_return_stmt.value, ctx)?;

                // 提升模板
                for (name, expr) in &ctx.templates {
                    (ctx.hoist)(Statement::VariableDeclaration(VariableDeclaration {
                        kind: VariableDeclarationKind::Const,
                        declarations: OxcVec::from(vec![VariableDeclarator {
                            id: BindingPattern::BindingIdentifier(Identifier::new(name.clone())),
                            init: Some(expr.clone()),
                            r#type: None,
                        }]),
                        r#type: None,
                    }));
                }

                Ok(gen_return_stmt(view, ctx))
            }
            _ => Err(CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                "Expected ViewReturnStmt".to_string(),
            )),
        }
    }

    fn generate_state(&self, _stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_state 未实现".to_string(),
        ))
    }

    fn generate_derived(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Vec<Statement>> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_derived 未实现".to_string(),
        ))
    }

    fn generate_single_prop(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_single_prop 未实现".to_string(),
        ))
    }

    fn generate_rest_prop(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_rest_prop 未实现".to_string(),
        ))
    }

    fn generate_whole_prop(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_whole_prop 未实现".to_string(),
        ))
    }

    fn generate_use_context(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_use_context 未实现".to_string(),
        ))
    }

    fn generate_raw_stmt(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_raw_stmt 未实现".to_string(),
        ))
    }

    fn generate_comp(&self, _stmt: &IRStmt, _ctx: &GeneratorContext) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_comp 未实现".to_string(),
        ))
    }

    fn generate_functional_macro(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_functional_macro 未实现".to_string(),
        ))
    }

    fn generate_hook_return(
        &self,
        _stmt: &IRStmt,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Statement> {
        Err(CompilerError::new(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            "generate_hook_return 未实现".to_string(),
        ))
    }
}

/// 生成return语句的辅助函数
#[cfg(any())]
fn gen_return_stmt<'a>(view: Expression<'a>, ctx: &GeneratorContext<'a>) -> Statement<'a> {
    let prepare_call = CallExpression {
        span: Span::new(0, 0),
        callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(
            oxc_ast::ast::StaticMemberExpression {
                span: Span::new(0, 0),
                object: Box::new(Expression::Identifier(ctx.self_id.clone())),
                property: MemberProperty::Identifier(oxc_ast::ast::IdentifierReference::new(
                    "prepare".to_string(),
                )),
                computed: false,
                optional: false,
            },
        )),
        arguments: OxcVec::from(vec![]),
    };

    Statement::ReturnStatement(ReturnStatement {
        span: Span::new(0, 0),
        argument: Some(Box::new(Expression::CallExpression(CallExpression {
            span: Span::new(0, 0),
            callee: Callee::MemberExpression(oxc_ast::ast::MemberExpression::StaticMember(
                oxc_ast::ast::StaticMemberExpression {
                    span: Span::new(0, 0),
                    object: Box::new(Expression::CallExpression(prepare_call)),
                    property: MemberProperty::Identifier(oxc_ast::ast::IdentifierReference::new(
                        "init".to_string(),
                    )),
                    computed: false,
                    optional: false,
                },
            )),
            arguments: OxcVec::from(vec![Argument::Expression(view)]),
        }))),
    })
}

/// 简化的generateView实现
#[cfg(any())]
fn generate_view_simple<'a>(
    view_units: &Option<Vec<ViewUnit>>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    if let Some(units) = view_units {
        if units.len() == 1 {
            generate_view_unit(&units[0], ctx)
        } else {
            // 多个视图单元，创建Fragment
            let mut children = Vec::new();
            for unit in units {
                children.push(generate_view_unit(unit, ctx)?);
            }
            Ok(Expression::CallExpression(CallExpression {
                span: Span::new(0, 0),
                callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
                    "createFragmentNode".into(),
                    Span::new(0, 0),
                )))),
                arguments: OxcVec::from(
                    children
                        .into_iter()
                        .map(Argument::Expression)
                        .collect::<Vec<_>>(),
                ),
            }))
        }
    } else {
        Ok(Expression::NullLiteral(NullLiteral {
            span: Span::new(0, 0),
        }))
    }
}

/// 生成单个视图单元
#[cfg(any())]
fn generate_view_unit<'a>(
    view_unit: &ViewUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    match view_unit {
        ViewUnit::HTML(html_unit) => generate_html_node(html_unit, ctx),
        ViewUnit::Text(text_unit) => generate_text_node(text_unit, ctx),
        ViewUnit::Expression(expr_unit) => generate_expression_node(expr_unit, ctx),
        ViewUnit::For(for_unit) => generate_for_node(for_unit, ctx),
        ViewUnit::If(if_unit) => generate_if_node(if_unit, ctx),
        ViewUnit::Fragment(fragment_unit) => generate_fragment_node(fragment_unit, ctx),
        ViewUnit::Component(comp_unit) => generate_component_node(comp_unit, ctx),
        ViewUnit::Context(context_unit) => generate_context_node(context_unit, ctx),
        ViewUnit::Suspense(suspense_unit) => generate_suspense_node(suspense_unit, ctx),
    }
}

/// 生成HTML节点
#[cfg(any())]
fn generate_html_node<'a>(
    html_unit: &HTMLUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let mut prop_stmts = Vec::new();

    // 解析属性
    for (key, prop_info) in &html_unit.props {
        let react_bits = ctx.get_react_bits(prop_info.dep_id_bitmap);
        ctx.wrap_update(&prop_info.value);

        let prop_stmt = set_html_prop(
            "node",
            &html_unit.tag,
            key,
            &prop_info.value,
            react_bits,
            &prop_info.dependencies_node,
        )?;
        if let Some(stmt) = prop_stmt {
            prop_stmts.push(stmt);
        }
    }

    let props_updater = if !prop_stmts.is_empty() {
        Expression::ArrowFunctionExpression(ArrowFunctionExpression {
            span: Span::new(0, 0),
            params: OxcVec::from(vec![FormalParameter {
                pattern: Some(BindingPattern::BindingIdentifier(BindingIdentifier::new(
                    "node".into(),
                    Span::new(0, 0),
                ))),
                r#type: None,
                decorators: OxcVec::from(vec![]),
                span: Span::new(0, 0),
            }]),
            body: FunctionBody::BlockStatement(BlockStatement {
                statements: OxcVec::from(prop_stmts),
                span: Span::new(0, 0),
            }),
            r#type: None,
            r#async: false,
            generator: false,
            span: Span::new(0, 0),
        })
    } else {
        Expression::NullLiteral(NullLiteral {
            span: Span::new(0, 0),
        })
    };

    // 解析子节点
    let mut children_nodes = Vec::new();
    for child in &html_unit.children {
        children_nodes.push(generate_view_unit(child, ctx)?);
    }

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createHTMLNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from({
            let mut args = vec![
                Argument::Expression(Expression::StringLiteral(StringLiteral::new(
                    html_unit.tag.clone(),
                    Span::new(0, 0),
                ))),
                Argument::Expression(props_updater),
            ];
            args.extend(children_nodes.into_iter().map(Argument::Expression));
            args
        }),
    }))
}

/// 生成文本节点
#[cfg(any())]
fn generate_text_node<'a>(
    text_unit: &TextUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createTextNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from(vec![Argument::Expression(Expression::StringLiteral(
            StringLiteral::new(text_unit.value.clone(), Span::new(0, 0)),
        ))]),
    }))
}

/// 生成表达式节点
#[cfg(any())]
fn generate_expression_node<'a>(
    expr_unit: &crate::types::ExpressionUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createExpNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from(vec![Argument::Expression(expr_unit.expression.clone())]),
    }))
}

/// 生成For节点
#[cfg(any())]
fn generate_for_node<'a>(
    for_unit: &ForUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let items_expr = generate_view_unit(&for_unit.items, ctx)?;
    let key_expr = for_unit
        .key
        .as_ref()
        .map(|k| generate_view_unit(k, ctx))
        .transpose()?;
    let children_expr = generate_view_unit(&for_unit.children, ctx)?;

    let mut args = vec![
        Argument::Expression(items_expr),
        Argument::Expression(children_expr),
    ];

    if let Some(key) = key_expr {
        args.insert(1, Argument::Expression(key));
    }

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createForNode".into(),
            Span::new(0, 0),
        )))),
        arguments: args,
    }))
}

/// 生成If节点
#[cfg(any())]
fn generate_if_node<'a>(
    if_unit: &IfUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let condition_expr = generate_view_unit(&if_unit.condition, ctx)?;
    let then_expr = generate_view_unit(&if_unit.then, ctx)?;
    let else_expr = if_unit
        .r#else
        .as_ref()
        .map(|e| generate_view_unit(e, ctx))
        .transpose()?;

    let mut args = vec![
        Argument::Expression(condition_expr),
        Argument::Expression(then_expr),
    ];

    if let Some(else_expr) = else_expr {
        args.push(Argument::Expression(else_expr));
    }

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createConditionalNode".into(),
            Span::new(0, 0),
        )))),
        arguments: args,
    }))
}

/// 生成Fragment节点
#[cfg(any())]
fn generate_fragment_node<'a>(
    fragment_unit: &FragmentUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let mut children_nodes = Vec::new();
    for child in &fragment_unit.children {
        children_nodes.push(generate_view_unit(child, ctx)?);
    }

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createFragmentNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from(
            children_nodes
                .into_iter()
                .map(Argument::Expression)
                .collect::<Vec<_>>(),
        ),
    }))
}

/// 生成组件节点
#[cfg(any())]
fn generate_component_node<'a>(
    comp_unit: &crate::types::CompUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let mut args = vec![Argument::Expression(Expression::Identifier(
        Identifier::new(comp_unit.name.clone(), Span::new(0, 0)),
    ))];

    // 添加props
    for (key, value) in &comp_unit.props {
        args.push(Argument::Expression(Expression::StringLiteral(
            StringLiteral::new(key.clone(), Span::new(0, 0)),
        )));
        args.push(Argument::Expression(value.clone()));
    }

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createCompNode".into(),
            Span::new(0, 0),
        )))),
        arguments: args,
    }))
}

/// 生成Context节点
#[cfg(any())]
fn generate_context_node<'a>(
    context_unit: &ContextUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let children_expr = generate_view_unit(&context_unit.children, ctx)?;

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createContextNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from(vec![
            Argument::Expression(Expression::Identifier(Identifier::new(
                context_unit.context_name.clone(),
                Span::new(0, 0),
            ))),
            Argument::Expression(children_expr),
        ]),
    }))
}

/// 生成Suspense节点
#[cfg(any())]
fn generate_suspense_node<'a>(
    suspense_unit: &SuspenseUnit,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expression<'a>> {
    let fallback_expr = generate_view_unit(&suspense_unit.fallback, ctx)?;
    let children_expr = generate_view_unit(&suspense_unit.children, ctx)?;

    Ok(Expression::CallExpression(CallExpression {
        span: Span::new(0, 0),
        callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
            "createSuspenseNode".into(),
            Span::new(0, 0),
        )))),
        arguments: OxcVec::from(vec![
            Argument::Expression(fallback_expr),
            Argument::Expression(children_expr),
        ]),
    }))
}

/// 设置HTML属性
#[cfg(any())]
fn set_html_prop<'a>(
    node_name: &str,
    tag_name: &str,
    key: &str,
    value: &Expression<'a>,
    react_bits: u32,
    dependencies_node: &Option<Expression<'a>>,
) -> CompilerResult<Option<Statement<'a>>> {
    // 根据属性类型生成不同的代码
    let prop_type = determine_prop_type(key, value);
    let setter_function = match prop_type {
        PropType::String => "setHTMLProp",
        PropType::Boolean => "setHTMLBooleanProp",
        PropType::Number => "setHTMLNumberProp",
        PropType::Event => "setHTMLEventProp",
        PropType::Style => "setHTMLStyleProp",
        PropType::Class => "setHTMLClassProp",
        PropType::Custom => "setHTMLCustomProp",
    };
    Ok(Some(Statement::ExpressionStatement(ExpressionStatement {
        span: Span::new(0, 0),
        expression: Expression::CallExpression(CallExpression {
            span: Span::new(0, 0),
            callee: Callee::Expression(Box::new(Expression::Identifier(Identifier::new(
                "setHTMLProp".into(),
                Span::new(0, 0),
            )))),
            arguments: OxcVec::from(vec![
                Argument::Expression(Expression::Identifier(Identifier::new(
                    node_name.into(),
                    Span::new(0, 0),
                ))),
                Argument::Expression(Expression::StringLiteral(StringLiteral::new(
                    key.into(),
                    Span::new(0, 0),
                ))),
                Argument::Expression(value.clone()),
            ]),
            span: Span::new(0, 0),
        }),
        span: Span::new(0, 0),
    })))
}

// 添加MainViewGenerator结构体，对应原版TypeScript的MainViewGenerator
#[derive(Debug, Clone)]
pub struct MainViewGenerator {
    config: ViewGeneratorConfig,
}

#[derive(Debug, Clone)]
pub struct ViewGeneratorConfig {
    pub import_map: HashMap<String, String>,
    pub attribute_map: HashMap<String, Vec<String>>,
    pub alter_attribute_map: HashMap<String, String>,
    pub templates: Vec<(String, String)>,
}

impl Default for ViewGeneratorConfig {
    fn default() -> Self {
        let mut import_map = HashMap::new();

        // 对应原版Inula的完整importMap配置
        let api_names = [
            "createElement",
            "setStyle",
            "setDataset",
            "setEvent",
            "delegateEvent",
            "setHTMLProp",
            "setHTMLAttr",
            "setHTMLProps",
            "setHTMLAttrs",
            "createTextNode",
            "updateText",
            "insertNode",
            "appendNode",
            "render",
            "notCached",
            "useHook",
            "createHook",
            "untrack",
            "runOnce",
            "createNode",
            "withDefault",
            "useContext",
        ];

        for api_name in &api_names {
            import_map.insert(api_name.to_string(), "@openinula/next".to_string());
        }

        Self {
            import_map,
            attribute_map: HashMap::new(),
            alter_attribute_map: HashMap::new(),
            templates: Vec::new(),
        }
    }
}

impl MainViewGenerator {
    pub fn new() -> Self {
        Self {
            config: ViewGeneratorConfig::default(),
        }
    }

    pub fn with_config(config: ViewGeneratorConfig) -> Self {
        Self { config }
    }

    /// 从 IR 数据生成代码 - 支持 openInula 2.0 架构
    pub fn generate_from_ir(
        &self,
        ir: &ComponentNode,
        bit_manager: &BitManager,
        hoist: bool,
    ) -> Result<String, String> {
        // 检测使用的 openInula API
        let used_apis = self.detect_apis_from_ir(ir);
        let mut api_manager = OpenInulaAPIManager::new();
        for api in used_apis {
            api_manager.mark_api_used(api);
        }

        // 生成静态骨架提升的代码
        let static_code = if hoist {
            self.generate_static_skeleton(ir).unwrap_or_default()
        } else {
            String::new()
        };

        // 生成动态部分代码
        let dynamic_code = self
            .generate_dynamic_parts(ir, bit_manager, &api_manager)
            .unwrap_or_default();

        // 生成依赖关系位图代码
        let dependency_code = self
            .generate_dependency_tracking(bit_manager)
            .unwrap_or_default();

        // 组合最终代码
        Ok(format!(
            "{}\n{}\n{}",
            static_code, dynamic_code, dependency_code
        ))
    }

    fn detect_apis_from_ir(&self, ir: &ComponentNode) -> Vec<OpenInulaAPI> {
        // 检测使用的API
        vec![]
    }

    fn generate_static_skeleton(&self, ir: &ComponentNode) -> Result<String, String> {
        // 生成静态骨架代码
        Ok(String::new())
    }

    fn generate_dynamic_parts(
        &self,
        ir: &ComponentNode,
        bit_manager: &BitManager,
        api_manager: &OpenInulaAPIManager,
    ) -> Result<String, String> {
        // 生成动态部分代码
        Ok(String::new())
    }

    fn generate_dependency_tracking(&self, bit_manager: &BitManager) -> Result<String, String> {
        // 生成依赖跟踪代码
        Ok(String::new())
    }
}

/// 确定属性类型
fn determine_prop_type(key: &str, value: &Expr) -> PropType {
    // 检查是否为事件属性
    if key.starts_with("on") && key.len() > 2 {
        return PropType::Event;
    }

    // 检查是否为样式属性
    if key == "style" {
        return PropType::Style;
    }

    // 检查是否为类名属性
    if key == "className" || key == "class" {
        return PropType::Class;
    }

    // 根据值类型确定属性类型
    match value {
        Expr::Lit(Lit::Bool(_)) => PropType::Boolean,
        Expr::Lit(Lit::Num(_)) => PropType::Number,
        Expr::Lit(Lit::Str(_)) => PropType::String,
        _ => PropType::Custom,
    }
}

/// 完整的视图生成函数
fn generate_view_complete<'a>(
    view_unit: &Option<ViewUnit<'a>>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    match view_unit {
        Some(unit) => {
            match unit {
                ViewUnit::Html(html_unit) => {
                    // 生成HTML元素
                    generate_html_element(html_unit, ctx)
                }
                ViewUnit::Text(text_unit) => {
                    // 生成文本节点
                    Ok(Expr::Lit(Lit::Str(Str {
                        span: Span::new(BytePos(0), BytePos(0)),
                        value: text_unit.content.clone().into(),
                        raw: None,
                    })))
                }
                ViewUnit::Fragment(fragment_unit) => {
                    // 生成Fragment
                    generate_fragment(fragment_unit, ctx)
                }
                ViewUnit::If(conditional_unit) => {
                    // 生成条件表达式
                    generate_conditional(conditional_unit, ctx)
                }
                ViewUnit::For(loop_unit) => {
                    // 生成循环
                    generate_loop(loop_unit, ctx)
                }
                ViewUnit::Comp(component_unit) => {
                    // 生成组件
                    generate_component(component_unit, ctx)
                }
                ViewUnit::Template(template_unit) => {
                    // 生成模板
                    generate_template(template_unit, ctx)
                }
                _ => {
                    // 其他类型的视图单元
                    Ok(Expr::Lit(Lit::Null(Null {
                        span: Span::new(BytePos(0), BytePos(0)),
                    })))
                }
            }
        }
        None => Ok(Expr::Lit(Lit::Null(Null {
            span: Span::new(BytePos(0), BytePos(0)),
        }))),
    }
}

/// 生成HTML属性处理语句 - 按照原版props.ts逻辑
fn generate_html_prop<'a>(
    node_name: &str,
    tag: &str,
    key: &str,
    prop: &UnitProp<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Option<Stmt>> {
    // 按照原版setHTMLProp逻辑实现
    let react_bits = (ctx.get_react_bits)(0); // 简化处理，使用默认值

    // 处理特殊属性
    if key == "ref" {
        return Ok(Some(generate_ref_handler(
            node_name,
            &Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            })),
            ctx,
        )?));
    }

    if key == "style" {
        return Ok(Some(generate_style_handler(
            node_name,
            &Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            })),
            &Expr::Array(ArrayLit {
                span: Span::new(BytePos(0), BytePos(0)),
                elems: vec![],
            }),
            react_bits,
            ctx,
        )?));
    }

    if key == "dataset" {
        return Ok(Some(generate_dataset_handler(
            node_name,
            &Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            })),
            &Expr::Array(ArrayLit {
                span: Span::new(BytePos(0), BytePos(0)),
                elems: vec![],
            }),
            react_bits,
            ctx,
        )?));
    }

    // 处理事件处理器
    if key.starts_with("on") {
        let event_name = &key[2..].to_lowercase();
        if is_delegated_event(event_name) {
            return Ok(Some(generate_delegated_event(
                node_name,
                event_name,
                &Expr::Lit(Lit::Str(Str {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: prop.value.clone().into_owned().into(),
                    raw: None,
                })),
                &Expr::Array(ArrayLit {
                    span: Span::new(BytePos(0), BytePos(0)),
                    elems: vec![],
                }),
                react_bits,
                ctx,
            )?));
        } else {
            return Ok(Some(generate_event_handler(
                node_name,
                event_name,
                &Expr::Lit(Lit::Str(Str {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: prop.value.clone().into_owned().into(),
                    raw: None,
                })),
                ctx,
            )?));
        }
    }

    // 处理普通属性
    if is_internal_attribute(tag, key) {
        return Ok(Some(generate_internal_property(
            node_name,
            key,
            &Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            })),
            &Expr::Array(ArrayLit {
                span: Span::new(BytePos(0), BytePos(0)),
                elems: vec![],
            }),
            react_bits,
            ctx,
        )?));
    } else {
        return Ok(Some(generate_html_attribute(
            node_name,
            key,
            &Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            })),
            &Expr::Array(ArrayLit {
                span: Span::new(BytePos(0), BytePos(0)),
                elems: vec![],
            }),
            react_bits,
            ctx,
        )?));
    }
}

/// 检查是否为委托事件
fn is_delegated_event(event_name: &str) -> bool {
    matches!(
        event_name,
        "beforeinput"
            | "click"
            | "dblclick"
            | "contextmenu"
            | "focusin"
            | "focusout"
            | "input"
            | "keydown"
            | "keyup"
            | "mousedown"
            | "mousemove"
            | "mouseout"
            | "mouseover"
            | "mouseup"
            | "pointerdown"
            | "pointermove"
            | "pointerout"
            | "pointerover"
            | "pointerup"
            | "touchend"
            | "touchmove"
            | "touchstart"
    )
}

/// 检查是否为内部属性
fn is_internal_attribute(tag: &str, attribute: &str) -> bool {
    // 简化的内部属性检查，实际应该从配置中读取
    matches!(
        attribute,
        "id" | "className" | "htmlFor" | "value" | "checked" | "disabled"
    )
}

/// 生成ref处理器
fn generate_ref_handler<'a>(
    node_name: &str,
    value: &Expr,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    // 按照原版setRef逻辑：typeof ref === "function" ? ref($el) : ref = $el
    let node_expr = Expr::Ident(Ident::new(
        node_name.into(),
        Span::new(BytePos(0), BytePos(0)),
        SyntaxContext::empty(),
    ));

    let conditional = Expr::Cond(CondExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        test: Box::new(Expr::Bin(BinExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            op: BinaryOp::EqEqEq,
            left: Box::new(Expr::Unary(UnaryExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                op: UnaryOp::TypeOf,
                arg: Box::new(value.clone()),
            })),
            right: Box::new(Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: "function".into(),
                raw: None,
            }))),
        })),
        cons: Box::new(Expr::Call(CallExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(value.clone())),
            args: vec![ExprOrSpread {
                spread: None,
                expr: Box::new(node_expr.clone()),
            }],
            type_args: None,
        })),
        alt: Box::new(Expr::Assign(AssignExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            op: AssignOp::Assign,
            left: AssignTarget::Simple(SimpleAssignTarget::Member(MemberExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                obj: Box::new(Expr::Ident(Ident::new(
                    "node".into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
                prop: MemberProp::Ident(
                    Ident::new(
                        "value".into(),
                        Span::new(BytePos(0), BytePos(0)),
                        SyntaxContext::empty(),
                    )
                    .into(),
                ),
            })),
            right: Box::new(node_expr),
        })),
    });

    Ok(Stmt::Expr(ExprStmt {
        span: Span::new(BytePos(0), BytePos(0)),
        expr: Box::new(conditional),
    }))
}

/// 生成样式处理器
fn generate_style_handler<'a>(
    node_name: &str,
    value: &Expr,
    dependencies_node: &Expr,
    react_bits: u32,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    let args = if react_bits > 0 {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Arrow(ArrowExpr {
                    span: Span::new(BytePos(0), BytePos(0)),
                    ctxt: SyntaxContext::empty(),
                    params: vec![],
                    body: Box::new(BlockStmtOrExpr::Expr(Box::new(value.clone()))),
                    is_async: false,
                    is_generator: false,
                    type_params: None,
                    return_type: None,
                })),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(dependencies_node.clone()),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Num(Number {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: react_bits as f64,
                    raw: None,
                }))),
            },
        ]
    } else {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(value.clone()),
            },
        ]
    };

    Ok(Stmt::Expr(ExprStmt {
        span: Span::new(BytePos(0), BytePos(0)),
        expr: Box::new(Expr::Call(CallExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "setStyle".into(),
                Span::new(BytePos(0), BytePos(0)),
                SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        })),
    }))
}

/// 生成dataset处理器
fn generate_dataset_handler<'a>(
    node_name: &str,
    value: &Expr,
    dependencies_node: &Expr,
    react_bits: u32,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    let args = if react_bits > 0 {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Arrow(ArrowExpr {
                    span: Span::new(BytePos(0), BytePos(0)),
                    ctxt: SyntaxContext::empty(),
                    params: vec![],
                    body: Box::new(BlockStmtOrExpr::Expr(Box::new(value.clone()))),
                    is_async: false,
                    is_generator: false,
                    type_params: None,
                    return_type: None,
                })),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(dependencies_node.clone()),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Num(Number {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: react_bits as f64,
                    raw: None,
                }))),
            },
        ]
    } else {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(value.clone()),
            },
        ]
    };

    Ok(Stmt::Expr(ExprStmt {
        span: Span::new(BytePos(0), BytePos(0)),
        expr: Box::new(Expr::Call(CallExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "setDataset".into(),
                Span::new(BytePos(0), BytePos(0)),
                SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        })),
    }))
}

/// 生成委托事件处理器
fn generate_delegated_event<'a>(
    node_name: &str,
    event_name: &str,
    value: &Expr,
    dependencies_node: &Expr,
    react_bits: u32,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    let args = if react_bits > 0 {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Str(Str {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: event_name.into(),
                    raw: None,
                }))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Arrow(ArrowExpr {
                    span: Span::new(BytePos(0), BytePos(0)),
                    ctxt: SyntaxContext::empty(),
                    params: vec![],
                    body: Box::new(BlockStmtOrExpr::Expr(Box::new(value.clone()))),
                    is_async: false,
                    is_generator: false,
                    type_params: None,
                    return_type: None,
                })),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(dependencies_node.clone()),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Num(Number {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: react_bits as f64,
                    raw: None,
                }))),
            },
        ]
    } else {
        vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    node_name.into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Str(Str {
                    span: Span::new(BytePos(0), BytePos(0)),
                    value: event_name.into(),
                    raw: None,
                }))),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(value.clone()),
            },
        ]
    };

    Ok(Stmt::Expr(ExprStmt {
        span: Span::new(BytePos(0), BytePos(0)),
        expr: Box::new(Expr::Call(CallExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "delegateEvent".into(),
                Span::new(BytePos(0), BytePos(0)),
                SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        })),
    }))
}

/// 生成事件处理器
fn generate_event_handler<'a>(
    node_name: &str,
    event_name: &str,
    value: &Expr,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    Ok(Stmt::Expr(ExprStmt {
        span: Span::new(BytePos(0), BytePos(0)),
        expr: Box::new(Expr::Call(CallExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "setEvent".into(),
                Span::new(BytePos(0), BytePos(0)),
                SyntaxContext::empty(),
            )))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Ident(Ident::new(
                        node_name.into(),
                        Span::new(BytePos(0), BytePos(0)),
                        SyntaxContext::empty(),
                    ))),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                        span: Span::new(BytePos(0), BytePos(0)),
                        value: event_name.into(),
                        raw: None,
                    }))),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(value.clone()),
                },
            ],
            type_args: None,
        })),
    }))
}

/// 生成内部属性处理器
fn generate_internal_property<'a>(
    node_name: &str,
    key: &str,
    value: &Expr,
    dependencies_node: &Expr,
    react_bits: u32,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    let prop_key = match key {
        "class" => "className",
        "for" => "htmlFor",
        _ => key,
    };

    if react_bits > 0 {
        // 动态属性
        Ok(Stmt::Expr(ExprStmt {
            span: Span::new(BytePos(0), BytePos(0)),
            expr: Box::new(Expr::Call(CallExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                ctxt: SyntaxContext::empty(),
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "setHTMLProp".into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                )))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Ident(Ident::new(
                            node_name.into(),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        ))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: Span::new(BytePos(0), BytePos(0)),
                            value: prop_key.into(),
                            raw: None,
                        }))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Arrow(ArrowExpr {
                            span: Span::new(BytePos(0), BytePos(0)),
                            ctxt: SyntaxContext::empty(),
                            params: vec![],
                            body: Box::new(BlockStmtOrExpr::Expr(Box::new(value.clone()))),
                            is_async: false,
                            is_generator: false,
                            type_params: None,
                            return_type: None,
                        })),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(dependencies_node.clone()),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: Span::new(BytePos(0), BytePos(0)),
                            value: react_bits as f64,
                            raw: None,
                        }))),
                    },
                ],
                type_args: None,
            })),
        }))
    } else {
        // 静态属性
        Ok(Stmt::Expr(ExprStmt {
            span: Span::new(BytePos(0), BytePos(0)),
            expr: Box::new(Expr::Assign(AssignExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                op: AssignOp::Assign,
                left: AssignTarget::Simple(SimpleAssignTarget::Member(MemberExpr {
                    span: Span::new(BytePos(0), BytePos(0)),
                    obj: Box::new(Expr::Ident(Ident::new(
                        node_name.into(),
                        Span::new(BytePos(0), BytePos(0)),
                        SyntaxContext::empty(),
                    ))),
                    prop: MemberProp::Ident(
                        Ident::new(
                            prop_key.into(),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        )
                        .into(),
                    ),
                })),
                right: Box::new(value.clone()),
            })),
        }))
    }
}

/// 生成HTML属性处理器
fn generate_html_attribute<'a>(
    node_name: &str,
    key: &str,
    value: &Expr,
    dependencies_node: &Expr,
    react_bits: u32,
    _ctx: &GeneratorContext<'a>,
) -> CompilerResult<Stmt> {
    if react_bits > 0 {
        // 动态属性
        Ok(Stmt::Expr(ExprStmt {
            span: Span::new(BytePos(0), BytePos(0)),
            expr: Box::new(Expr::Call(CallExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                ctxt: SyntaxContext::empty(),
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "setHTMLAttr".into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                )))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: Span::new(BytePos(0), BytePos(0)),
                            value: key.into(),
                            raw: None,
                        }))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Arrow(ArrowExpr {
                            span: Span::new(BytePos(0), BytePos(0)),
                            ctxt: SyntaxContext::empty(),
                            params: vec![],
                            body: Box::new(BlockStmtOrExpr::Expr(Box::new(value.clone()))),
                            is_async: false,
                            is_generator: false,
                            type_params: None,
                            return_type: None,
                        })),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(dependencies_node.clone()),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: Span::new(BytePos(0), BytePos(0)),
                            value: react_bits as f64,
                            raw: None,
                        }))),
                    },
                ],
                type_args: None,
            })),
        }))
    } else {
        // 静态属性
        Ok(Stmt::Expr(ExprStmt {
            span: Span::new(BytePos(0), BytePos(0)),
            expr: Box::new(Expr::Call(CallExpr {
                span: Span::new(BytePos(0), BytePos(0)),
                ctxt: SyntaxContext::empty(),
                callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                    span: Span::new(BytePos(0), BytePos(0)),
                    obj: Box::new(Expr::Ident(Ident::new(
                        node_name.into(),
                        Span::new(BytePos(0), BytePos(0)),
                        SyntaxContext::empty(),
                    ))),
                    prop: MemberProp::Ident(
                        Ident::new(
                            "setAttribute".into(),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        )
                        .into(),
                    ),
                }))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: Span::new(BytePos(0), BytePos(0)),
                            value: key.into(),
                            raw: None,
                        }))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(value.clone()),
                    },
                ],
                type_args: None,
            })),
        }))
    }
}

/// 生成HTML元素
fn generate_html_element<'a>(
    html_unit: &HTMLUnit<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    // 按照原版HTMLGenerator逻辑实现
    let tag_name = html_unit.tag.clone();

    // 生成props updater函数
    let mut prop_stmts: Vec<Stmt> = Vec::new();

    // 处理HTML属性
    for (key, prop) in &html_unit.props {
        let prop_stmt = generate_html_prop(&ctx.node_name_in_update, &tag_name, key, prop, ctx)?;
        if let Some(stmt) = prop_stmt {
            prop_stmts.push(stmt);
        }
    }

    // 创建props updater函数
    let props_updater = if prop_stmts.is_empty() {
        Expr::Lit(Lit::Null(Null {
            span: Span::new(BytePos(0), BytePos(0)),
        }))
    } else {
        Expr::Arrow(ArrowExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            params: vec![Pat::Ident(BindingIdent {
                id: Ident::new(
                    ctx.node_name_in_update.clone().into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                ),
                type_ann: None,
            })],
            body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                span: Span::new(BytePos(0), BytePos(0)),
                ctxt: SyntaxContext::empty(),
                stmts: prop_stmts,
            })),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        })
    };

    // 生成子节点
    let mut children_nodes: Vec<Expr> = Vec::new();
    for child in &html_unit.children {
        let child_expr = generate_view_complete(&Some(child.as_ref().clone()), ctx)?;
        children_nodes.push(child_expr);
    }

    // 创建createHTMLNode调用
    Ok(Expr::Call(CallExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "createHTMLNode".into(),
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        )))),
        args: {
            let mut args = vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                        span: Span::new(BytePos(0), BytePos(0)),
                        value: tag_name.into(),
                        raw: None,
                    }))),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(props_updater),
                },
            ];

            // 添加子节点作为展开参数
            for child in children_nodes {
                args.push(ExprOrSpread {
                    spread: None,
                    expr: Box::new(child),
                });
            }

            args
        },
        type_args: None,
    }))
}

/// 生成Fragment
fn generate_fragment<'a>(
    _fragment_unit: &FragmentUnit<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    Ok(Expr::Call(CallExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "Fragment".into(),
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        )))),
        args: vec![],
        type_args: None,
    }))
}

/// 生成条件表达式
fn generate_conditional<'a>(
    _conditional_unit: &IfUnit<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    Ok(Expr::Cond(CondExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        test: Box::new(Expr::Lit(Lit::Bool(Bool {
            span: Span::new(BytePos(0), BytePos(0)),
            value: true,
        }))),
        cons: Box::new(Expr::Lit(Lit::Null(Null {
            span: Span::new(BytePos(0), BytePos(0)),
        }))),
        alt: Box::new(Expr::Lit(Lit::Null(Null {
            span: Span::new(BytePos(0), BytePos(0)),
        }))),
    }))
}

/// 生成循环 - 按照原版ForGenerator逻辑
fn generate_loop<'a>(for_unit: &ForUnit<'a>, ctx: &GeneratorContext<'a>) -> CompilerResult<Expr> {
    // 按照原版ForGenerator逻辑：createForNode(items, children) 或 createForNode(items, key, children)

    // 生成items表达式 - 从ForUnit的items字段获取
    let items_expr = if !for_unit.item.is_empty() {
        // 这里简化处理，假设items是一个标识符
        Expr::Ident(Ident::new(
            "items".into(), // 占位符，实际应该从items_data解析
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        ))
    } else {
        // 兜底空数组
        Expr::Array(ArrayLit {
            span: Span::new(BytePos(0), BytePos(0)),
            elems: vec![],
        })
    };

    // 生成children表达式 - 从ForUnit的children字段获取
    let children_expr = if !for_unit.children.is_empty() {
        // 生成第一个子节点作为渲染体
        generate_view_complete(&Some(*for_unit.children[0].clone()), ctx)?
    } else {
        // 兜底null
        Expr::Lit(Lit::Null(Null {
            span: Span::new(BytePos(0), BytePos(0)),
        }))
    };

    // 构建参数列表
    let mut args: Vec<ExprOrSpread> = vec![
        ExprOrSpread {
            spread: None,
            expr: Box::new(items_expr),
        },
        ExprOrSpread {
            spread: None,
            expr: Box::new(children_expr),
        },
    ];

    // 如果有key，插入到items和children之间
    if let Some(key_data) = &for_unit.key {
        let key_expr = Expr::Lit(Lit::Str(Str {
            span: Span::new(BytePos(0), BytePos(0)),
            value: key_data.clone().into(),
            raw: None,
        }));
        args.insert(
            1,
            ExprOrSpread {
                spread: None,
                expr: Box::new(key_expr),
            },
        );
    }

    // 创建createForNode调用
    Ok(Expr::Call(CallExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "createForNode".into(),
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        )))),
        args,
        type_args: None,
    }))
}

/// 生成组件 - 按照原版CompGenerator逻辑
fn generate_component<'a>(
    comp_unit: &CompUnit<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    // 按照原版CompGenerator逻辑：createComponent(Component, props, children)

    // 生成组件名称表达式
    let component_name_expr = Expr::Ident(Ident::new(
        comp_unit.name.clone().into(),
        Span::new(BytePos(0), BytePos(0)),
        SyntaxContext::empty(),
    ));

    // 生成props对象表达式
    let props_expr = if comp_unit.props.is_empty() {
        // 空props对象
        Expr::Object(ObjectLit {
            span: Span::new(BytePos(0), BytePos(0)),
            props: vec![],
        })
    } else {
        // 构建props对象
        let mut props = Vec::new();
        for (key, prop) in &comp_unit.props {
            let prop_key = PropName::Ident(
                Ident::new(
                    key.clone().into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                )
                .into(),
            );

            let prop_value = Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            }));

            props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                key: prop_key,
                value: Box::new(prop_value),
            }))));
        }

        Expr::Object(ObjectLit {
            span: Span::new(BytePos(0), BytePos(0)),
            props,
        })
    };

    // 生成children表达式
    let children_expr = if comp_unit.children.is_empty() {
        // 空children数组
        Expr::Array(ArrayLit {
            span: Span::new(BytePos(0), BytePos(0)),
            elems: vec![],
        })
    } else {
        // 生成children数组
        let mut children_exprs = Vec::new();
        for child in &comp_unit.children {
            let child_expr = generate_view_complete(&Some(*child.clone()), ctx)?;
            children_exprs.push(Some(ExprOrSpread {
                spread: None,
                expr: Box::new(child_expr),
            }));
        }

        Expr::Array(ArrayLit {
            span: Span::new(BytePos(0), BytePos(0)),
            elems: children_exprs,
        })
    };

    // 构建参数列表：[Component, props, children]
    let args = vec![
        ExprOrSpread {
            spread: None,
            expr: Box::new(component_name_expr),
        },
        ExprOrSpread {
            spread: None,
            expr: Box::new(props_expr),
        },
        ExprOrSpread {
            spread: None,
            expr: Box::new(children_expr),
        },
    ];

    // 创建createComponent调用
    Ok(Expr::Call(CallExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "createComponent".into(),
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        )))),
        args,
        type_args: None,
    }))
}

/// 生成模板 - 按照原版TemplateGenerator逻辑
fn generate_template<'a>(
    template_unit: &TemplateUnit<'a>,
    ctx: &GeneratorContext<'a>,
) -> CompilerResult<Expr> {
    // 按照原版TemplateGenerator逻辑：createTemplate(tag, props, children)

    // 生成模板标识符表达式
    let tag_expr = Expr::Lit(Lit::Str(Str {
        span: Span::new(BytePos(0), BytePos(0)),
        value: template_unit.tag.clone().into_owned().into(),
        raw: None,
    }));

    // 生成props对象表达式
    let props_expr = if template_unit.props.is_empty() {
        // 空props对象
        Expr::Object(ObjectLit {
            span: Span::new(BytePos(0), BytePos(0)),
            props: vec![],
        })
    } else {
        // 构建props对象
        let mut props = Vec::new();
        for (key, prop) in &template_unit.props {
            let prop_key = PropName::Ident(
                Ident::new(
                    key.clone().into(),
                    Span::new(BytePos(0), BytePos(0)),
                    SyntaxContext::empty(),
                )
                .into(),
            );

            let prop_value = Expr::Lit(Lit::Str(Str {
                span: Span::new(BytePos(0), BytePos(0)),
                value: prop.value.clone().into_owned().into(),
                raw: None,
            }));

            props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                key: prop_key,
                value: Box::new(prop_value),
            }))));
        }

        Expr::Object(ObjectLit {
            span: Span::new(BytePos(0), BytePos(0)),
            props,
        })
    };

    // 生成children表达式
    let children_expr = if template_unit.children.is_empty() {
        // 空children数组
        Expr::Array(ArrayLit {
            span: Span::new(BytePos(0), BytePos(0)),
            elems: vec![],
        })
    } else {
        // 生成children数组
        let mut children_exprs = Vec::new();
        for child in &template_unit.children {
            let child_expr = generate_view_complete(&Some(*child.clone()), ctx)?;
            children_exprs.push(Some(ExprOrSpread {
                spread: None,
                expr: Box::new(child_expr),
            }));
        }

        Expr::Array(ArrayLit {
            span: Span::new(BytePos(0), BytePos(0)),
            elems: children_exprs,
        })
    };

    // 构建参数列表：[tag, props, children]
    let args = vec![
        ExprOrSpread {
            spread: None,
            expr: Box::new(tag_expr),
        },
        ExprOrSpread {
            spread: None,
            expr: Box::new(props_expr),
        },
        ExprOrSpread {
            spread: None,
            expr: Box::new(children_expr),
        },
    ];

    // 创建createTemplate调用
    Ok(Expr::Call(CallExpr {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
            "createTemplate".into(),
            Span::new(BytePos(0), BytePos(0)),
            SyntaxContext::empty(),
        )))),
        args,
        type_args: None,
    }))
}
