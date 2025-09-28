// state_generator.rs - 状态生成器，对应原版 stateGenerator.ts
use crate::error_handler::CompilerResult;
use crate::generator::GeneratorContext;
use crate::types::{DerivedSource, DerivedStmt, IRStmt, StateStmt};
use swc_ecma_ast::*;

/// 状态生成器 - 对应原版 stateGenerator
pub struct StateGenerator;

impl StateGenerator {
    /// 生成状态语句 - 与TypeScript原版完全对齐
    pub fn generate_state(&self, stmt: &StateStmt, ctx: &GeneratorContext) -> CompilerResult<Stmt> {
        // 对应原版: t.variableDeclaration('let', [stmt.node])
        let var_decl = VarDecl {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            kind: VarDeclKind::Let,
            decls: vec![VarDeclarator {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                name: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        stmt.name.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                }),
                init: stmt.value.as_ref().map(|v| {
                    Box::new(Expr::Lit(Lit::Str(Str {
                        value: v.clone().into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    })))
                }),
                definite: false,
            }],
            declare: false,
        };

        Ok(Stmt::Decl(Decl::Var(Box::new(var_decl))))
    }

    /// 生成派生状态语句
    pub fn generate_derived(
        &self,
        stmt: &DerivedStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Vec<Stmt>> {
        // 对应原版的 derived 函数
        let mut statements = Vec::new();

        // 1. 变量声明
        let derived_declaration = self.create_derived_declaration(stmt)?;
        statements.push(derived_declaration);

        // 2. 更新调用
        let update_call = self.create_update_call(stmt, ctx)?;
        statements.push(update_call);

        Ok(statements)
    }

    /// 创建派生状态声明
    fn create_derived_declaration(&self, stmt: &DerivedStmt) -> CompilerResult<Stmt> {
        let var_decl = VarDecl {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            kind: VarDeclKind::Let,
            decls: vec![VarDeclarator {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                name: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        stmt.name.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                }),
                init: None,
                definite: false,
            }],
            declare: false,
        };

        Ok(Stmt::Decl(Decl::Var(Box::new(var_decl))))
    }

    /// 创建更新调用
    fn create_update_call(
        &self,
        stmt: &DerivedStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
        // 根据原版逻辑创建更新调用
        let update_call = if stmt.getter.contains("useHook") {
            // Hook 源
            self.create_hook_update_call(stmt, ctx)?
        } else {
            // 普通派生状态
            self.create_derive_state_call(stmt, ctx)?
        };

        Ok(Stmt::Expr(ExprStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            expr: Box::new(update_call),
        }))
    }

    /// 创建 Hook 更新调用
    fn create_hook_update_call(
        &self,
        stmt: &DerivedStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 对应原版的 Hook 更新逻辑
        let value_ident = Ident::new(
            "$$value".into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        );

        let update_fn = Expr::Arrow(ArrowExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            params: vec![Pat::Ident(BindingIdent {
                id: value_ident.clone(),
                type_ann: None,
            })],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Call(CallExpr {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                ctxt: swc_common::SyntaxContext::empty(),
                callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    obj: Box::new(Expr::Ident(ctx.self_id.clone())),
                    prop: MemberProp::Ident(
                        Ident::new(
                            "wave".into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        )
                        .into(),
                    ),
                }))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Paren(ParenExpr {
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            expr: Box::new(Expr::Assign(AssignExpr {
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                left: AssignTarget::Simple(SimpleAssignTarget::Ident(
                                    BindingIdent {
                                        id: Ident::new(
                                            stmt.name.clone().into(),
                                            swc_common::Span::new(
                                                swc_common::BytePos(0),
                                                swc_common::BytePos(0),
                                            ),
                                            swc_common::SyntaxContext::empty(),
                                        ),
                                        type_ann: None,
                                    },
                                )),
                                op: AssignOp::Assign,
                                right: Box::new(Expr::Ident(value_ident)),
                            })),
                        })),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            value: (ctx.get_wave_bits_by_id)(stmt.reactive_id) as f64,
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))),
                    },
                ],
                type_args: None,
            })))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
            ctxt: swc_common::SyntaxContext::empty(),
        });

        let use_hook_call = Expr::Call(CallExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                obj: Box::new(Expr::Ident(ctx.self_id.clone())),
                prop: MemberProp::Ident(
                    Ident::new(
                        "useHook".into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    )
                    .into(),
                ),
            }))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                        value: stmt.value.clone().into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(update_fn),
                },
            ],
            type_args: None,
        });

        Ok(use_hook_call)
    }

    /// 创建派生状态调用
    fn create_derive_state_call(
        &self,
        stmt: &DerivedStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 对应原版的 deriveState 调用
        let update_fn = Expr::Arrow(ArrowExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Paren(ParenExpr {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                expr: Box::new(Expr::Assign(AssignExpr {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    left: AssignTarget::Simple(SimpleAssignTarget::Ident(BindingIdent {
                        id: Ident::new(
                            stmt.name.clone().into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ),
                        type_ann: None,
                    })),
                    op: AssignOp::Assign,
                    right: Box::new(Expr::Lit(Lit::Str(Str {
                        value: stmt.value.clone().into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))),
                })),
            })))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
            ctxt: swc_common::SyntaxContext::empty(),
        });

        let dependencies_fn = Expr::Arrow(ArrowExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Array(ArrayLit {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                elems: vec![],
            })))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
            ctxt: swc_common::SyntaxContext::empty(),
        });

        let derive_state_call = Expr::Call(CallExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                obj: Box::new(Expr::Ident(ctx.self_id.clone())),
                prop: MemberProp::Ident(
                    Ident::new(
                        "deriveState".into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    )
                    .into(),
                ),
            }))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(update_fn),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(dependencies_fn),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Num(Number {
                        value: (ctx.get_react_bits)(
                            stmt.dependency
                                .as_ref()
                                .map(|d| d.dep_id_bitmap)
                                .unwrap_or(0),
                        ) as f64,
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))),
                },
            ],
            type_args: None,
        });

        Ok(derive_state_call)
    }
}
