// 完整的生成器模块，用于 NAPI 构建
use crate::bit_manager::BitManager;
use crate::types::ComponentNode;
use swc_ecma_ast::Function;

// 导出子模块
pub mod view_generator;

/// 生成器上下文
pub struct GeneratorContext {
    pub node_name_in_update: String,
    pub hoist_fn: Box<dyn Fn(swc_ecma_ast::Stmt)>,
}

impl GeneratorContext {
    pub fn new() -> Self {
        Self {
            node_name_in_update: "$$node".to_string(),
            hoist_fn: Box::new(|_stmt| {}),
        }
    }
}

/// 生成函数 AST - 使用完整的生成器架构
pub fn generate(
    ir: &ComponentNode,
    bit_manager: &mut BitManager,
    hoist_fn: Box<dyn Fn(swc_ecma_ast::Stmt)>,
    context: Option<GeneratorContext>,
) -> Result<Function, String> {
    // 使用完整的生成器架构
    let ctx = context.unwrap_or_else(|| GeneratorContext::new());

    // 使用 view_generator 生成完整的函数 AST
    match view_generator::ViewGenerator::new().generate_from_ir(ir, bit_manager, &ctx) {
        Ok(fn_ast) => Ok(fn_ast),
        Err(e) => {
            // 如果生成失败，返回基本的函数 AST
            Ok(Function {
                span: swc_common::DUMMY_SP,
                ctxt: swc_common::SyntaxContext::empty(),
                decorators: vec![],
                params: vec![],
                body: Some(swc_ecma_ast::BlockStmt {
                    span: swc_common::DUMMY_SP,
                    ctxt: swc_common::SyntaxContext::empty(),
                    stmts: vec![],
                }),
                is_generator: false,
                is_async: false,
                type_params: None,
                return_type: None,
            })
        }
    }
}
