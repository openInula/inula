#[cfg(feature = "frontend_swc")]
mod imp {
    use crate::frontend::{ParseSummary, ParserFrontend};
    use swc_common::{sync::Lrc, FileName, SourceMap};
    use swc_ecma_ast::EsVersion;
    use swc_ecma_ast::*;
    use swc_ecma_parser::{lexer::Lexer, EsSyntax, Parser, StringInput, Syntax, TsSyntax};

    pub struct SwcFrontend;

    impl SwcFrontend {
        pub fn new() -> Self {
            Self
        }
    }

    impl ParserFrontend for SwcFrontend {
        fn scan_summary(
            &self,
            code: &str,
            is_ts: bool,
            is_jsx: bool,
        ) -> Result<ParseSummary, String> {
            let cm: Lrc<SourceMap> = Default::default();
            let fm =
                cm.new_source_file(FileName::Custom("input.js".into()).into(), code.to_string());

            let syntax = if is_ts {
                Syntax::Typescript(TsSyntax {
                    tsx: is_jsx,
                    decorators: true,
                    ..Default::default()
                })
            } else {
                Syntax::Es(EsSyntax {
                    jsx: is_jsx,
                    decorators: true,
                    ..Default::default()
                })
            };

            let lexer = Lexer::new(syntax, EsVersion::Es2022, StringInput::from(&*fm), None);
            let mut parser = Parser::new_from(lexer);

            let module = parser
                .parse_module()
                .map_err(|e| format!("解析失败: {:?}", e))?;

            let mut summary = ParseSummary::default();

            for item in module.body.iter() {
                match item {
                    ModuleItem::Stmt(Stmt::Decl(Decl::Fn(_))) => summary.functions += 1,
                    ModuleItem::Stmt(Stmt::Decl(Decl::Var(v))) => {
                        summary.variables += v.decls.len() as u32
                    }
                    _ => {}
                }
                collect_jsx_in_item(item, &mut summary);
            }

            summary.length = code.len();
            Ok(summary)
        }
    }

    fn collect_jsx_in_item(item: &ModuleItem, sum: &mut ParseSummary) {
        match item {
            ModuleItem::ModuleDecl(_) => {}
            ModuleItem::Stmt(stmt) => collect_jsx_in_stmt(stmt, sum),
        }
    }

    fn collect_jsx_in_stmt(stmt: &Stmt, sum: &mut ParseSummary) {
        match stmt {
            Stmt::Expr(e) => collect_jsx_in_expr(&e.expr, sum),
            Stmt::Return(r) => {
                if let Some(arg) = &r.arg {
                    collect_jsx_in_expr(arg, sum)
                }
            }
            Stmt::Decl(Decl::Var(v)) => {
                for d in &v.decls {
                    if let Some(init) = &d.init {
                        collect_jsx_in_expr(init, sum);
                    }
                }
            }
            _ => {}
        }
    }

    fn collect_jsx_in_expr(expr: &Expr, sum: &mut ParseSummary) {
        match expr {
            Expr::JSXElement(_) => sum.jsx_elements += 1,
            Expr::JSXFragment(_) => sum.jsx_fragments += 1,
            Expr::Call(c) => {
                for a in &c.args {
                    collect_jsx_in_expr(&a.expr, sum);
                }
            }
            Expr::Array(a) => {
                for e in &a.elems {
                    if let Some(e) = e {
                        collect_jsx_in_expr(&e.expr, sum);
                    }
                }
            }
            Expr::Paren(p) => collect_jsx_in_expr(&p.expr, sum),
            Expr::Cond(c) => {
                collect_jsx_in_expr(&c.test, sum);
                collect_jsx_in_expr(&c.cons, sum);
                collect_jsx_in_expr(&c.alt, sum);
            }
            Expr::Bin(b) => {
                collect_jsx_in_expr(&b.left, sum);
                collect_jsx_in_expr(&b.right, sum);
            }
            _ => {}
        }
    }
}

#[cfg(feature = "frontend_swc")]
pub use imp::SwcFrontend;
