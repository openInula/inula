use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::generator::prop_generator::PropGenerator;
use crate::generator::raw_stmt_generator::RawStmtGenerator;
use crate::generator::state_generator::StateGenerator;
use crate::generator::view_generator::ViewGenerator;
use crate::generator::GeneratorContext;
use crate::types::{ComponentNode, IRStmt};
use std::collections::HashMap;
use swc_common::{BytePos, Span, SyntaxContext};
use swc_ecma_ast::*;

/// 主要的生成函数 - 从 IR 生成 AST
pub fn generate(
    ir: &ComponentNode,
    bit_manager: &mut BitManager,
    hoist_fn: Box<dyn Fn(Stmt)>,
    _options: Option<()>,
) -> CompilerResult<swc_ecma_ast::Function> {
    // 创建生成器上下文
    let self_id = Ident::new(
        "self".into(),
        Span::new(BytePos(0), BytePos(0)),
        SyntaxContext::empty(),
    );

    let mut ctx = GeneratorContext {
        self_id: self_id.clone(),
        current: ir,
        bit_manager,
        hoist: hoist_fn,
        wrap_update: Box::new(|stmt| stmt),
        get_react_bits: Box::new(|_| 0),
        get_wave_bits: Box::new(|_| 0),
        get_wave_bits_by_id: Box::new(|_| 0),
        import_map: HashMap::new(),
        parent_id: None,
        templates: Vec::new(),
        node_name_in_update: "$$node".to_string(),
    };

    // 使用 ViewGenerator 生成代码
    let view_generator = ViewGenerator;
    let mut statements = Vec::new();

    // 处理 IR 中的每个语句
    for stmt in &ir.body {
        match stmt {
            IRStmt::ViewReturn(view_return) => {
                let return_stmt = view_generator.generate_view_return(view_return, &ctx)?;
                statements.push(return_stmt);
            }
            IRStmt::Raw(raw_stmt) => {
                let raw_generator = RawStmtGenerator;
                let stmt = raw_generator.generate_raw_stmt(raw_stmt, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::WholeProp(whole_prop) => {
                let prop_generator = PropGenerator;
                let stmt = prop_generator.generate_whole_prop(whole_prop, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::SingleProp(single_prop) => {
                let prop_generator = PropGenerator;
                let stmt = prop_generator.generate_single_prop(single_prop, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::RestProp(rest_prop) => {
                let prop_generator = PropGenerator;
                let stmt = prop_generator.generate_rest_prop(rest_prop, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::UseContext(use_context) => {
                let prop_generator = PropGenerator;
                let stmt = prop_generator.generate_use_context(use_context, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::State(state_stmt) => {
                let state_generator = StateGenerator;
                let stmt = state_generator.generate_state(state_stmt, &ctx)?;
                statements.push(stmt);
            }
            IRStmt::Derived(derived_stmt) => {
                let state_generator = StateGenerator;
                let stmts = state_generator.generate_derived(derived_stmt, &ctx)?;
                statements.extend(stmts);
            }
            _ => {
                // 处理其他类型的语句
                continue;
            }
        }
    }

    // 创建函数 AST
    Ok(swc_ecma_ast::Function {
        span: Span::new(BytePos(0), BytePos(0)),
        ctxt: SyntaxContext::empty(),
        decorators: vec![],
        params: vec![],
        body: Some(swc_ecma_ast::BlockStmt {
            span: Span::new(BytePos(0), BytePos(0)),
            ctxt: SyntaxContext::empty(),
            stmts: statements,
        }),
        is_generator: false,
        is_async: false,
        type_params: None,
        return_type: None,
    })
}
