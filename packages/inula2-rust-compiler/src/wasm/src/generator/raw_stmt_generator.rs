// raw_stmt_generator.rs - 原始语句生成器，对应原版 rawStmtGenerator.ts
use crate::error_handler::CompilerResult;
use crate::generator::GeneratorContext;
use crate::types::{IRStmt, RawStmt};
use swc_ecma_ast::*;

/// 原始语句生成器 - 对应原版 rawStmtGenerator
pub struct RawStmtGenerator;

impl RawStmtGenerator {
    /// 生成原始语句
    pub fn generate_raw_stmt(
        &self,
        stmt: &RawStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
        self.parse_raw_statement(&stmt.value)
    }

    fn parse_raw_statement(&self, stmt_str: &str) -> CompilerResult<Stmt> {
        if stmt_str.starts_with("const ")
            || stmt_str.starts_with("let ")
            || stmt_str.starts_with("var ")
        {
            self.parse_variable_declaration(stmt_str)
        } else if stmt_str.starts_with("return ") || stmt_str == "return;" {
            self.parse_return_statement(stmt_str)
        } else if stmt_str.starts_with("if ") {
            self.parse_if_statement(stmt_str)
        } else if stmt_str.starts_with("for ") {
            self.parse_for_statement(stmt_str)
        } else if stmt_str.starts_with("while ") {
            self.parse_while_statement(stmt_str)
        } else {
            self.parse_expression_statement(stmt_str)
        }
    }

    fn parse_variable_declaration(&self, stmt_str: &str) -> CompilerResult<Stmt> {
        let kind = if stmt_str.starts_with("const ") {
            VarDeclKind::Const
        } else if stmt_str.starts_with("let ") {
            VarDeclKind::Let
        } else {
            VarDeclKind::Var
        };
        let var_name = self.extract_variable_name(stmt_str);

        let var_decl = VarDecl {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            kind,
            decls: vec![VarDeclarator {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                name: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        var_name.into(),
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

    fn parse_return_statement(&self, stmt_str: &str) -> CompilerResult<Stmt> {
        let return_value = if stmt_str == "return;" {
            None
        } else {
            let value_str = stmt_str.strip_prefix("return ").unwrap_or("undefined");
            Some(Box::new(Expr::Lit(Lit::Str(Str {
                value: value_str.into(),
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                raw: None,
            }))))
        };

        Ok(Stmt::Return(ReturnStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            arg: return_value,
        }))
    }

    fn parse_if_statement(&self, _stmt_str: &str) -> CompilerResult<Stmt> {
        let condition = Expr::Lit(Lit::Bool(Bool {
            value: true,
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        }));

        let consequent = BlockStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            stmts: vec![],
        };

        Ok(Stmt::If(IfStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            test: Box::new(condition),
            cons: Box::new(Stmt::Block(consequent)),
            alt: None,
        }))
    }

    fn parse_for_statement(&self, _stmt_str: &str) -> CompilerResult<Stmt> {
        let init = Some(VarDeclOrExpr::VarDecl(Box::new(VarDecl {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            kind: VarDeclKind::Let,
            decls: vec![],
            declare: false,
        })));

        let test = Some(Expr::Lit(Lit::Bool(Bool {
            value: true,
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        })));

        let update = Some(Expr::Lit(Lit::Num(Number {
            value: 1.0,
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            raw: None,
        })));

        let body = BlockStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            stmts: vec![],
        };

        Ok(Stmt::For(ForStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            init,
            test: test.map(Box::new),
            update: update.map(Box::new),
            body: Box::new(Stmt::Block(body)),
        }))
    }

    fn parse_while_statement(&self, _stmt_str: &str) -> CompilerResult<Stmt> {
        let test = Expr::Lit(Lit::Bool(Bool {
            value: true,
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        }));

        let body = BlockStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            ctxt: swc_common::SyntaxContext::empty(),
            stmts: vec![],
        };

        Ok(Stmt::While(WhileStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            test: Box::new(test),
            body: Box::new(Stmt::Block(body)),
        }))
    }

    fn parse_expression_statement(&self, stmt_str: &str) -> CompilerResult<Stmt> {
        let expr = if stmt_str.ends_with(';') {
            let trimmed = stmt_str.trim_end_matches(';');
            Expr::Ident(Ident::new(
                trimmed.into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ))
        } else {
            Expr::Ident(Ident::new(
                stmt_str.into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ))
        };

        Ok(Stmt::Expr(ExprStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            expr: Box::new(expr),
        }))
    }

    fn extract_variable_name(&self, stmt_str: &str) -> String {
        let parts: Vec<&str> = stmt_str.split_whitespace().collect();
        if parts.len() > 1 {
            parts[1].to_string()
        } else {
            "unknown".to_string()
        }
    }
}
