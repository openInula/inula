// prop_generator.rs - 属性生成器，对应原版 propGenerator.ts
use crate::error_handler::CompilerResult;
use crate::generator::GeneratorContext;
use crate::types::{IRStmt, RestPropStmt, SinglePropStmt, UseContextStmt, WholePropStmt};
use swc_ecma_ast::*;

/// 属性生成器 - 对应原版 propGenerator
pub struct PropGenerator;

impl PropGenerator {
    /// 生成单个属性语句
    pub fn generate_single_prop(
        &self,
        stmt: &SinglePropStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
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
                init: Some(Box::new(Expr::Lit(Lit::Str(Str {
                    value: stmt.value.clone().into(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    raw: None,
                })))),
                definite: false,
            }],
            declare: false,
        };

        Ok(Stmt::Decl(Decl::Var(Box::new(var_decl))))
    }

    /// 生成剩余属性语句
    pub fn generate_rest_prop(
        &self,
        stmt: &RestPropStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
        // 与 TS 对齐：将剩余属性通过 setHTMLSpread($$node, rest) 注入
        let call = Expr::Call(CallExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "setHTMLSpread".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Ident(Ident::new(
                        ctx.node_name_in_update.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ))),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Ident(Ident::new(
                        stmt.name.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ))),
                },
            ],
            type_args: None,
        });

        Ok(Stmt::Expr(ExprStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            expr: Box::new(call),
        }))
    }

    /// 生成整体属性语句
    pub fn generate_whole_prop(
        &self,
        stmt: &WholePropStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
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
                init: Some(Box::new(Expr::Lit(Lit::Str(Str {
                    value: stmt.value.clone().into(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    raw: None,
                })))),
                definite: false,
            }],
            declare: false,
        };

        Ok(Stmt::Decl(Decl::Var(Box::new(var_decl))))
    }

    /// 生成 useContext 语句
    pub fn generate_use_context(
        &self,
        stmt: &UseContextStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
        let use_context_call = Expr::Call(CallExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "useContext".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args: vec![ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Ident(Ident::new(
                    stmt.context.clone().into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                ))),
            }],
            type_args: None,
        });

        let var_decl = VarDecl {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            kind: VarDeclKind::Let,
            decls: vec![VarDeclarator {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                name: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        stmt.l_val.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                }),
                init: Some(Box::new(use_context_call)),
                definite: false,
            }],
            declare: false,
        };

        Ok(Stmt::Decl(Decl::Var(Box::new(var_decl))))
    }
}
