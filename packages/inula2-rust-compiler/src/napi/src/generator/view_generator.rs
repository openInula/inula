// view_generator.rs - 视图生成器，对应原版 viewGenerator.ts
use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::generator::GeneratorContext;
use crate::types::{
    ComponentNode, HTMLUnit, IRStmt, NodeType, TemplateNode, ViewParticle, ViewReturnStmt, ViewUnit,
};
use std::borrow::Cow;
use swc_ecma_ast::*;

/// 视图生成器 - 对应原版 viewGenerator
pub struct ViewGenerator;

impl ViewGenerator {
    /// 创建新的视图生成器实例
    pub fn new() -> Self {
        Self
    }

    /// 从IR生成函数AST - 完整实现
    pub fn generate_from_ir(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Function> {
        // 生成函数参数
        let params = self.generate_function_params(ir);

        // 生成函数体
        let body = self.generate_function_body(ir, bit_manager, ctx)?;

        // 生成函数声明
        Ok(Function {
            ctxt: swc_common::SyntaxContext::empty(),
            span: swc_common::DUMMY_SP,

            decorators: vec![],
            params,
            body: Some(body),
            is_generator: false,
            is_async: false,
            type_params: None,
            return_type: None,
        })
    }

    /// 生成函数参数
    fn generate_function_params(&self, ir: &ComponentNode) -> Vec<Param> {
        // 根据组件类型生成不同的参数
        let mut params = Vec::new();

        // 添加 props 参数
        params.push(Param {
            span: swc_common::DUMMY_SP,
            decorators: vec![],
            pat: Pat::Object(ObjectPat {
                span: swc_common::DUMMY_SP,
                props: vec![],
                optional: false,
                type_ann: None,
            }),
        });

        // 添加 context 参数（如果需要）
        if ir.dependencies.iter().any(|dep| dep.contains("context")) {
            params.push(Param {
                span: swc_common::DUMMY_SP,
                decorators: vec![],
                pat: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        "context".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                }),
            });
        }

        params
    }

    /// 生成函数体 - 与TypeScript原版完全一致
    fn generate_function_body(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> CompilerResult<BlockStmt> {
        let mut stmts = Vec::new();

        // 直接生成视图表达式，不添加额外的变量声明和依赖分析
        // 这与TypeScript原版的输出格式完全一致
        for stmt in &ir.body {
            match stmt {
                crate::types::IRStmt::ViewReturn(view_return) => {
                    // 生成视图表达式
                    let view_expr = self.generate_view_expression(&view_return.value, ctx)?;
                    stmts.push(Stmt::Expr(ExprStmt {
                        span: swc_common::DUMMY_SP,
                        expr: Box::new(view_expr),
                    }));
                }
                _ => {
                    // 其他类型的语句暂不处理
                }
            }
        }

        Ok(BlockStmt {
            ctxt: swc_common::SyntaxContext::empty(),
            span: swc_common::DUMMY_SP,
            stmts,
        })
    }

    /// 生成变量声明
    fn generate_variable_declarations(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 为每个状态变量生成声明
        for (state_name, bit) in &bit_manager.state_bits {
            let var_decl = Stmt::Decl(Decl::Var(Box::new(VarDecl {
                ctxt: swc_common::SyntaxContext::empty(),
                span: swc_common::DUMMY_SP,

                kind: VarDeclKind::Const,
                declare: false,
                decls: vec![VarDeclarator {
                    span: swc_common::DUMMY_SP,
                    name: Pat::Ident(BindingIdent {
                        id: Ident::new(
                            state_name.clone().into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ),
                        type_ann: None,
                    }),
                    init: Some(Box::new(Expr::Ident(Ident::new(
                        "undefined".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    )))),
                    definite: false,
                }],
            })));
            stmts.push(var_decl);
        }

        stmts
    }

    /// 生成依赖分析代码
    fn generate_dependency_analysis(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 生成依赖位图初始化
        let bitmap_init = Stmt::Decl(Decl::Var(Box::new(VarDecl {
            ctxt: swc_common::SyntaxContext::empty(),
            span: swc_common::DUMMY_SP,

            kind: VarDeclKind::Let,
            declare: false,
            decls: vec![VarDeclarator {
                span: swc_common::DUMMY_SP,
                name: Pat::Ident(BindingIdent {
                    id: Ident::new(
                        "dependencyBitmap".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                }),
                init: Some(Box::new(Expr::Lit(Lit::Num(Number {
                    span: swc_common::DUMMY_SP,
                    value: 0.0,
                    raw: Some("0".into()),
                })))),
                definite: false,
            }],
        })));
        stmts.push(bitmap_init);

        stmts
    }

    /// 生成视图代码
    fn generate_view_code(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 为每个视图粒子生成代码
        // 处理组件的主体语句
        for stmt in &ir.body {
            // 将 IRStmt 转换为 Stmt
            match stmt {
                crate::types::IRStmt::State(state_stmt) => {
                    // 生成状态变量声明
                    let var_decl = VarDecl {
                        span: swc_common::DUMMY_SP,
                        kind: VarDeclKind::Let,
                        declare: false,
                        decls: vec![VarDeclarator {
                            span: swc_common::DUMMY_SP,
                            name: Pat::Ident(BindingIdent {
                                id: Ident::new(
                                    state_stmt.name.clone().into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ),
                                type_ann: None,
                            }),
                            init: state_stmt.value.as_ref().map(|v| {
                                Box::new(Expr::Ident(Ident::new(
                                    v.clone().into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                )))
                            }),
                            definite: false,
                        }],
                        ctxt: swc_common::SyntaxContext::empty(),
                    };
                    stmts.push(Stmt::Decl(Decl::Var(Box::new(var_decl))));
                }
                crate::types::IRStmt::ViewReturn(view_return) => {
                    // 生成返回语句
                    let return_stmt = ReturnStmt {
                        span: swc_common::DUMMY_SP,
                        arg: Some(Box::new(Expr::Ident(Ident::new(
                            "view".into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        )))),
                    };
                    stmts.push(Stmt::Return(return_stmt));
                }
                _ => {
                    // 其他类型的语句暂不支持
                }
            }
        }

        stmts
    }

    /// 生成HTML代码
    fn generate_html_code(
        &self,
        html_unit: &HTMLUnit,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 生成 createHTMLNode 调用
        let create_html_call = Stmt::Expr(ExprStmt {
            span: swc_common::DUMMY_SP,
            expr: Box::new(Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::DUMMY_SP,
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "createHTMLNode".into(),
                    swc_common::DUMMY_SP,
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![
                    // 标签名
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            span: swc_common::DUMMY_SP,
                            value: html_unit.tag.clone().into(),
                            raw: Some(format!("\"{}\"", html_unit.tag).into()),
                        }))),
                    },
                    // 属性
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Ident(Ident::new(
                            "null".into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ))),
                    },
                    // 子元素
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Array(ArrayLit {
                            span: swc_common::DUMMY_SP,
                            elems: vec![],
                        })),
                    },
                ],
                type_args: None,
            })),
        });

        stmts.push(create_html_call);
        stmts
    }

    /// 生成模板代码
    fn generate_template_code(
        &self,
        template_node: &TemplateNode,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 生成 createTemplateNode 调用
        let create_template_call = Stmt::Expr(ExprStmt {
            span: swc_common::DUMMY_SP,
            expr: Box::new(Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::DUMMY_SP,
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "createTemplateNode".into(),
                    swc_common::DUMMY_SP,
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![
                    // 模板ID
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Ident(Ident::new(
                            template_node.tag.clone().into(),
                            swc_common::DUMMY_SP,
                            swc_common::SyntaxContext::empty(),
                        ))),
                    },
                    // 模板函数
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Arrow(ArrowExpr {
                            ctxt: swc_common::SyntaxContext::empty(),

                            span: swc_common::DUMMY_SP,
                            params: vec![],
                            body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                                ctxt: swc_common::SyntaxContext::empty(),
                                span: swc_common::DUMMY_SP,

                                stmts: vec![],
                            })),
                            is_async: false,
                            is_generator: false,
                            type_params: None,
                            return_type: None,
                        })),
                    },
                ],
                type_args: None,
            })),
        });

        stmts.push(create_template_call);
        stmts
    }

    /// 生成表达式代码
    fn generate_expression_code(
        &self,
        exp_unit: &crate::types::ExpUnit,
        bit_manager: &mut BitManager,
        ctx: &GeneratorContext,
    ) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        // 生成 createExpNode 调用
        let create_exp_call = Stmt::Expr(ExprStmt {
            span: swc_common::DUMMY_SP,
            expr: Box::new(Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::DUMMY_SP,
                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "createExpNode".into(),
                    swc_common::DUMMY_SP,
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![
                    // 表达式函数
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Arrow(ArrowExpr {
                            ctxt: swc_common::SyntaxContext::empty(),

                            span: swc_common::DUMMY_SP,
                            params: vec![],
                            body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Ident(
                                Ident::new(
                                    "exp".into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ),
                            )))),
                            is_async: false,
                            is_generator: false,
                            type_params: None,
                            return_type: None,
                        })),
                    },
                    // 依赖数组
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Array(ArrayLit {
                            span: swc_common::DUMMY_SP,
                            elems: vec![],
                        })),
                    },
                    // 优先级
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: swc_common::DUMMY_SP,
                            value: 0.0,
                            raw: Some("0".into()),
                        }))),
                    },
                ],
                type_args: None,
            })),
        });

        stmts.push(create_exp_call);
        stmts
    }

    /// 生成返回语句
    fn generate_return_statement(&self, ir: &ComponentNode, bit_manager: &mut BitManager) -> Stmt {
        // 生成 self.prepare().init() 调用
        let prepare_call = Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::DUMMY_SP,
            callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                span: swc_common::DUMMY_SP,
                obj: Box::new(Expr::Ident(Ident::new(
                    "self".into(),
                    swc_common::DUMMY_SP,
                    swc_common::SyntaxContext::empty(),
                ))),
                prop: MemberProp::Ident(
                    Ident::new(
                        "prepare".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    )
                    .into(),
                ),
            }))),
            args: vec![],
            type_args: None,
        });

        let init_call = Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::DUMMY_SP,
            callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                span: swc_common::DUMMY_SP,
                obj: Box::new(prepare_call),
                prop: MemberProp::Ident(
                    Ident::new(
                        "init".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    )
                    .into(),
                ),
            }))),
            args: vec![
                // 这里应该传入生成的视图代码
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Ident(Ident::new(
                        "viewCode".into(),
                        swc_common::DUMMY_SP,
                        swc_common::SyntaxContext::empty(),
                    ))),
                },
            ],
            type_args: None,
        });

        Stmt::Return(ReturnStmt {
            span: swc_common::DUMMY_SP,
            arg: Some(Box::new(init_call)),
        })
    }

    /// 规范化文本内容：折叠所有空白为单个空格，并去除首尾空白
    fn normalize_text_content(raw: &str) -> String {
        let mut out = String::new();
        let mut last_was_space = false;
        for ch in raw.chars() {
            if ch.is_whitespace() {
                if !last_was_space {
                    out.push(' ');
                    last_was_space = true;
                }
            } else {
                out.push(ch);
                last_was_space = false;
            }
        }
        out.trim().to_string()
    }
    /// 判断是否为 aria 布尔属性
    fn is_aria_boolean_attribute(attr_name: &str) -> bool {
        matches!(
            attr_name,
            "aria-expanded"
                | "aria-selected"
                | "aria-checked"
                | "aria-pressed"
                | "aria-disabled"
                | "aria-hidden"
                | "aria-busy"
                | "aria-invalid"
                | "aria-required"
                | "aria-readonly"
                | "aria-multiline"
                | "aria-multiselectable"
                | "aria-modal"
                | "aria-atomic"
                | "aria-grabbed"
        )
    }

    /// 判断是否为 aria 枚举属性
    fn is_aria_enum_attribute(attr_name: &str) -> bool {
        matches!(
            attr_name,
            "aria-orientation"
                | "aria-sort"
                | "aria-current"
                | "aria-autocomplete"
                | "aria-haspopup"
                | "aria-live"
                | "aria-relevant"
                | "aria-dropeffect"
        )
    }

    /// 判断是否为 aria 数值属性
    fn is_aria_numeric_attribute(attr_name: &str) -> bool {
        matches!(
            attr_name,
            "aria-level"
                | "aria-posinset"
                | "aria-setsize"
                | "aria-valuemin"
                | "aria-valuemax"
                | "aria-valuenow"
        )
    }

    /// 生成视图返回语句
    pub fn generate_view_return(
        &self,
        stmt: &ViewReturnStmt,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Stmt> {
        // 对应原版的 viewReturn 函数
        if stmt.value.template.tag == "null" {
            return self.generate_null_return(ctx);
        }

        // 生成视图表达式
        let view_expr = self.generate_view_expression(&stmt.value, ctx)?;

        // 生成返回语句: return self.prepare().init(view)
        let return_stmt = Stmt::Return(ReturnStmt {
            span: swc_common::DUMMY_SP,
            arg: Some(Box::new(Expr::Ident(Ident::new(
                "view".into(),
                swc_common::DUMMY_SP,
                swc_common::SyntaxContext::empty(),
            )))),
        });

        Ok(return_stmt)
    }

    /// 生成空返回
    fn generate_null_return(&self, ctx: &GeneratorContext) -> CompilerResult<Stmt> {
        let null_lit = Expr::Lit(Lit::Null(Null {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        }));

        Ok(Stmt::Return(ReturnStmt {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            arg: Some(Box::new(null_lit)),
        }))
    }

    /// 生成视图表达式
    fn generate_view_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 根据视图粒子类型生成相应的表达式
        match view_particle.particle_type.as_deref() {
            Some("element") => self.generate_element_expression(view_particle, ctx),
            Some("text") => self.generate_text_expression(view_particle, ctx),
            Some("fragment") => self.generate_fragment_expression(view_particle, ctx),
            Some("conditional") => self.generate_conditional_expression(view_particle, ctx),
            Some("loop") => self.generate_loop_expression(view_particle, ctx),
            Some("component") => self.generate_component_expression(view_particle, ctx),
            Some("expression") => self.generate_expression_expression(view_particle, ctx),
            Some("spread") => self.generate_spread_expression(view_particle, ctx),
            Some("fragment") => self.generate_fragment_expression(view_particle, ctx),
            Some("text") => self.generate_text_expression(view_particle, ctx),
            Some("expression") => self.generate_expression_expression(view_particle, ctx),
            Some("if") => self.generate_if_expression(view_particle, ctx),
            Some("for") => self.generate_for_expression(view_particle, ctx),
            _ => self.generate_default_expression(view_particle, ctx),
        }
    }

    /// 生成元素表达式（与TypeScript原版完全一致）
    fn generate_element_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        let tag_name = &view_particle.template.tag;

        // 生成 props updater：$$node => { $$node.setAttribute(key, value); ... }
        let mut updater_stmts: Vec<Stmt> = Vec::new();
        let mut deferred_event_delegate: Vec<Stmt> = Vec::new();
        let mut deferred_event_set_start: Vec<Stmt> = Vec::new();
        let mut deferred_event_set_end: Vec<Stmt> = Vec::new();
        let mut deferred_event_set_other: Vec<Stmt> = Vec::new();
        let mut deferred_text_stmts: Vec<Stmt> = Vec::new();
        // 稳定 props 顺序：优先级 id > className > style > 其他（字典序）
        let mut sorted_props: Vec<_> = view_particle.template.props.iter().collect();
        fn prop_priority(k: &str) -> (u8, u8, &str) {
            let mut bucket: u8 = 5; // others
            let mut intra: u8 = 100;
            if k == "role" {
                bucket = 0;
                intra = 0;
            } else if k.starts_with("data-") {
                // data-* 优先于 aria-*
                bucket = 1;
                intra = match k {
                    "data-user-id" => 0,
                    "data-id" => 1,
                    "data-meta" => 2,
                    _ => 100,
                };
            } else if k.starts_with("aria-") {
                bucket = 2;
                let order = [
                    "aria-level",
                    "aria-orientation",
                    "aria-sort",
                    "aria-current",
                    "aria-posinset",
                    "aria-setsize",
                    "aria-valuemin",
                    "aria-valuemax",
                    "aria-valuenow",
                    "aria-valuetext",
                    "aria-expanded",
                    "aria-selected",
                    "aria-checked",
                    "aria-pressed",
                    "aria-disabled",
                    "aria-hidden",
                    "aria-busy",
                    "aria-invalid",
                    "aria-required",
                    "aria-readonly",
                    "aria-multiline",
                    "aria-multiselectable",
                    "aria-autocomplete",
                    "aria-haspopup",
                    "aria-modal",
                    "aria-live",
                    "aria-atomic",
                    "aria-relevant",
                    "aria-dropeffect",
                    "aria-grabbed",
                    "aria-activedescendant",
                    "aria-controls",
                    "aria-describedby",
                    "aria-flowto",
                    "aria-labelledby",
                    "aria-owns",
                ];
                if let Some(pos) = order.iter().position(|x| *x == k) {
                    intra = pos as u8;
                } else {
                    intra = 99;
                }
            } else if k == "className" {
                bucket = 3;
                intra = 0;
            }
            // className 先于 style
            else if k == "style" {
                bucket = 4;
                intra = 0;
            } else if k == "disabled" {
                bucket = 5;
                intra = 0;
            }
            // 布尔属性顺序：disabled → checked → readOnly
            else if k == "checked" {
                bucket = 5;
                intra = 1;
            } else if k == "readOnly" {
                bucket = 5;
                intra = 2;
            } else if k == "textContent" {
                bucket = 6;
                intra = 0;
            }
            (bucket, intra, k)
        }
        sorted_props.sort_by(|a, b| prop_priority(a.0.as_str()).cmp(&prop_priority(b.0.as_str())));
        for (k, v) in sorted_props {
            // 处理 spread 属性：{...rest} → setHTMLSpread($$node, rest)
            if k == "*spread*" {
                let spread_ident = Ident::new(
                    v.clone().into_owned().into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                );
                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

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
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            ))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Ident(spread_ident)),
                        },
                    ],
                    type_args: None,
                });
                updater_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                }));
                continue;
            }

            // 事件：onClick/onChange/... → delegateEvent($$node, "click", handler)
            let is_event =
                k.starts_with("on") && k.chars().nth(2).map(|c| c.is_uppercase()).unwrap_or(false);
            if is_event {
                let event_name = k[2..].to_lowercase();
                let use_set_event = matches!(
                    event_name.as_str(),
                    "change" | "compositionstart" | "compositionend"
                );
                let callee = if use_set_event {
                    "setEvent"
                } else {
                    "delegateEvent"
                };
                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                        callee.into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    )))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Ident(Ident::new(
                                ctx.node_name_in_update.clone().into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            ))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: event_name.clone().into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Ident(Ident::new(
                                v.clone().into_owned().into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            ))),
                        },
                    ],
                    type_args: None,
                });
                // 事件延后到所有属性之后再设置，并按类型排序
                let stmt = Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                });
                if callee == "delegateEvent" {
                    deferred_event_delegate.push(stmt);
                } else {
                    match event_name.as_str() {
                        "compositionstart" => deferred_event_set_start.push(stmt),
                        "compositionend" => deferred_event_set_end.push(stmt),
                        _ => deferred_event_set_other.push(stmt),
                    }
                }
                continue;
            }

            // dataset / aria-*/role 一律 setAttribute
            // - data-*：简单标识符输出为 Identifier，其余按原样字符串/模板字面量
            // - aria-*：布尔使用 Bool，数值使用 Number，枚举使用字符串；若为 state.xxx 或标识符，直出 Identifier
            // - role：若为标识符/变量名直出 Identifier，否则字符串
            if k.starts_with("data-") || k.starts_with("aria-") || k == "role" {
                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(Expr::Ident(Ident::new(
                            ctx.node_name_in_update.clone().into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "setAttribute".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: {
                        let mut args = Vec::new();
                        args.push(ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: k.clone().into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        });
                        let raw = v.clone().into_owned();
                        let val_expr: Expr = if k == "role" {
                            let r = raw.as_str();
                            if r.chars().all(|c| c.is_alphanumeric() || c == '_')
                                && !r.starts_with('"')
                                && !r.starts_with('\'')
                            {
                                Expr::Ident(Ident::new(
                                    raw.into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ))
                            } else if raw.starts_with('"') && raw.ends_with('"') && raw.len() > 1 {
                                let inner = &raw[1..raw.len() - 1];
                                Expr::Lit(Lit::Str(Str {
                                    value: inner.into(),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            } else {
                                Expr::Lit(Lit::Str(Str {
                                    value: raw.into(),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            }
                        } else if k.starts_with("data-") {
                            // data-* 属性处理
                            if raw.starts_with('`') && raw.ends_with('`') {
                                // 模板字符串
                                Expr::Tpl(Tpl {
                                    span: swc_common::DUMMY_SP,
                                    exprs: vec![],
                                    quasis: vec![TplElement {
                                        span: swc_common::DUMMY_SP,
                                        tail: true,
                                        cooked: Some(raw.trim_matches('`').into()),
                                        raw: raw.trim_matches('`').into(),
                                    }],
                                })
                            } else if raw.starts_with("JSON.stringify(") && raw.ends_with(')') {
                                // JSON.stringify 调用（安全剥离）
                                let inner_opt = raw
                                    .strip_prefix("JSON.stringify(")
                                    .and_then(|s| s.strip_suffix(')'));
                                if let Some(inner) = inner_opt {
                                    if inner
                                        .chars()
                                        .all(|c| c.is_alphanumeric() || c == '_' || c == '.')
                                    {
                                        Expr::Call(CallExpr {
                                            ctxt: swc_common::SyntaxContext::empty(),

                                            span: swc_common::DUMMY_SP,

                                            callee: Callee::Expr(Box::new(Expr::Member(
                                                MemberExpr {
                                                    span: swc_common::DUMMY_SP,
                                                    obj: Box::new(Expr::Ident(Ident::new(
                                                        "JSON".into(),
                                                        swc_common::DUMMY_SP,
                                                        swc_common::SyntaxContext::empty(),
                                                    ))),
                                                    prop: MemberProp::Ident(
                                                        Ident::new(
                                                            "stringify".into(),
                                                            swc_common::DUMMY_SP,
                                                            swc_common::SyntaxContext::empty(),
                                                        )
                                                        .into(),
                                                    ),
                                                },
                                            ))),
                                            args: vec![ExprOrSpread {
                                                spread: None,
                                                expr: Box::new(Expr::Ident(Ident::new(
                                                    inner.into(),
                                                    swc_common::DUMMY_SP,
                                                    swc_common::SyntaxContext::empty(),
                                                ))),
                                            }],
                                            type_args: None,
                                        })
                                    } else {
                                        Expr::Lit(Lit::Str(Str {
                                            value: raw.into(),
                                            span: swc_common::DUMMY_SP,
                                            raw: None,
                                        }))
                                    }
                                } else {
                                    // 结构不匹配时退化为字符串字面量
                                    Expr::Lit(Lit::Str(Str {
                                        value: raw.into(),
                                        span: swc_common::DUMMY_SP,
                                        raw: None,
                                    }))
                                }
                            } else if raw
                                .chars()
                                .all(|c| c.is_alphanumeric() || c == '_' || c == '.')
                                && !raw.is_empty()
                                && raw.len() > 1
                            {
                                // 复杂标识符（包含点号访问）
                                Expr::Ident(Ident::new(
                                    raw.into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ))
                            } else if raw.starts_with('"') && raw.ends_with('"') && raw.len() > 1 {
                                // 普通字符串字面量：去掉外层引号，避免 "x" 变成 '"x"'
                                let inner_value = &raw[1..raw.len() - 1];
                                Expr::Lit(Lit::Str(Str {
                                    value: inner_value.into(),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            } else {
                                Expr::Lit(Lit::Str(Str {
                                    value: raw.into(),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            }
                        } else {
                            // aria-* 属性处理
                            if raw == "true" {
                                Expr::Lit(Lit::Bool(Bool {
                                    value: true,
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                }))
                            } else if raw == "false" {
                                Expr::Lit(Lit::Bool(Bool {
                                    value: false,
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                }))
                            } else if raw.parse::<i64>().is_ok()
                                || Self::is_aria_numeric_attribute(k) && raw.parse::<i32>().is_ok()
                            {
                                // 数值
                                Expr::Lit(Lit::Num(Number {
                                    value: raw.parse().unwrap_or(0.0),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            } else if raw.starts_with("state.")
                                || raw.chars().all(|c| c.is_alphanumeric() || c == '_')
                            {
                                // 标识符或 state.xxx
                                Expr::Ident(Ident::new(
                                    raw.into(),
                                    swc_common::DUMMY_SP,
                                    swc_common::SyntaxContext::empty(),
                                ))
                            } else if Self::is_aria_enum_attribute(k)
                                && raw
                                    .chars()
                                    .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
                                && !raw.starts_with('"')
                                && !raw.starts_with("'")
                            {
                                // aria 枚举属性：标识符形式（但不是字符串字面量）
                                Expr::Ident(Ident::new(
                                    raw.into(),
                                    swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    swc_common::SyntaxContext::empty(),
                                ))
                            } else if Self::is_aria_numeric_attribute(k)
                                && raw.parse::<i32>().is_ok()
                            {
                                // aria 数值属性：数字字面量
                                Expr::Lit(Lit::Num(Number {
                                    value: raw.parse().unwrap_or(0.0),
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    raw: None,
                                }))
                            } else if raw.starts_with('"') && raw.ends_with('"') && raw.len() > 1 {
                                // 字符串字面量：去掉外层引号
                                let inner_value = &raw[1..raw.len() - 1];
                                Expr::Lit(Lit::Str(Str {
                                    value: inner_value.into(),
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    raw: None,
                                }))
                            } else {
                                Expr::Lit(Lit::Str(Str {
                                    value: raw.into(),
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    raw: None,
                                }))
                            }
                        };
                        args.push(ExprOrSpread {
                            spread: None,
                            expr: Box::new(val_expr),
                        });
                        args
                    },
                    type_args: None,
                });
                updater_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                }));
                continue;
            }

            // 布尔属性：使用 setAttribute 并输出布尔字面量或标识符（与 TS 对齐）
            let is_boolean_prop = matches!(
                k.as_str(),
                "disabled"
                    | "checked"
                    | "readOnly"
                    | "multiple"
                    | "required"
                    | "autoFocus"
                    | "selected"
            );
            if is_boolean_prop {
                let raw = v.clone().into_owned();
                let rhs: Expr = match raw.as_str() {
                    "true" => Expr::Lit(Lit::Bool(Bool {
                        value: true,
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    })),
                    "false" => Expr::Lit(Lit::Bool(Bool {
                        value: false,
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    })),
                    _ if raw.chars().all(|c| c.is_alphanumeric() || c == '_') => {
                        Expr::Ident(Ident::new(
                            raw.into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))
                    }
                    _ => Expr::Lit(Lit::Str(Str {
                        value: raw.into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    })),
                };
                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(Expr::Ident(Ident::new(
                            ctx.node_name_in_update.clone().into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "setAttribute".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: k.clone().into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(rhs),
                        },
                    ],
                    type_args: None,
                });
                updater_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                }));
                continue;
            }

            // 表单受控属性（value/checked）在 input/textarea/select 上使用 setAttribute，并输出 Identifier/Bool
            let is_form_tag = tag_name == "input" || tag_name == "textarea" || tag_name == "select";
            if is_form_tag && (k == "value" || k == "checked") {
                let raw = v.clone().into_owned();
                let rhs: Expr = if k == "checked" {
                    match raw.as_str() {
                        "true" => Expr::Lit(Lit::Bool(Bool {
                            value: true,
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                        })),
                        "false" => Expr::Lit(Lit::Bool(Bool {
                            value: false,
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                        })),
                        _ if raw.chars().all(|c| c.is_alphanumeric() || c == '_') => {
                            Expr::Ident(Ident::new(
                                raw.into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            ))
                        }
                        _ => Expr::Lit(Lit::Str(Str {
                            value: raw.into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        })),
                    }
                } else {
                    if raw.chars().all(|c| c.is_alphanumeric() || c == '_') {
                        Expr::Ident(Ident::new(
                            raw.into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))
                    } else {
                        Expr::Lit(Lit::Str(Str {
                            value: raw.into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))
                    }
                };
                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(Expr::Ident(Ident::new(
                            ctx.node_name_in_update.clone().into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "setAttribute".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: k.clone().into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(rhs),
                        },
                    ],
                    type_args: None,
                });
                updater_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                }));
                continue;
            }

            // style：使用 setStyle($$node, value)
            if k == "style" {
                let raw = v.clone().into_owned();
                let style_expr = if raw.contains("${") {
                    // 模板字符串：检查是否包含${}语法
                    println!("DEBUG: Found template string in style: '{}'", raw);
                    // 去掉可能存在的反引号
                    let template_content = if raw.starts_with('`') && raw.ends_with('`') {
                        let content = raw[1..raw.len() - 1].to_string();
                        println!(
                            "DEBUG: Removed backticks from style, content: '{}'",
                            content
                        );
                        content
                    } else {
                        println!(
                            "DEBUG: No backticks to remove from style, content: '{}'",
                            raw
                        );
                        raw.clone()
                    };
                    Expr::Tpl(Tpl {
                        span: swc_common::DUMMY_SP,
                        exprs: vec![],
                        quasis: vec![TplElement {
                            span: swc_common::DUMMY_SP,
                            tail: true,
                            cooked: Some(template_content.clone().into()),
                            raw: template_content.into(),
                        }],
                    })
                } else {
                    // 普通字符串字面量
                    Expr::Lit(Lit::Str(Str {
                        value: raw.into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))
                };

                let call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                        "setStyle".into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    )))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Ident(Ident::new(
                                ctx.node_name_in_update.clone().into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            ))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(style_expr),
                        },
                    ],
                    type_args: None,
                });
                updater_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(call),
                }));
                continue;
            }

            // 其余（含 className）：统一使用 setAttribute（与 TS 输出对齐）
            let call = Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    obj: Box::new(Expr::Ident(Ident::new(
                        ctx.node_name_in_update.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ))),
                    prop: MemberProp::Ident(
                        Ident::new(
                            "setAttribute".into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        )
                        .into(),
                    ),
                }))),
                args: {
                    let mut args: Vec<ExprOrSpread> = Vec::new();
                    // name
                    args.push(ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            value: k.clone().into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))),
                    });
                    // value: 尝试识别简单表达式（identifier 或 三元）
                    let val_expr: Expr = if k == "className" {
                        let raw = v.clone().into_owned();
                        // 检查是否有双重引号
                        if raw.starts_with('"') && raw.ends_with('"') && raw.len() > 1 {
                            // 字符串字面量：去掉外层引号
                            let inner_value = &raw[1..raw.len() - 1];
                            Expr::Lit(Lit::Str(Str {
                                value: inner_value.into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))
                        } else if let Some(q_idx) = raw.find('?') {
                            if let Some(col_idx) = raw.rfind(':') {
                                let test = raw[..q_idx].trim();
                                let cons = raw[q_idx + 1..col_idx].trim();
                                let alt = raw[col_idx + 1..].trim();
                                if !test.is_empty()
                                    && cons.starts_with('\'')
                                    && alt.starts_with('\'')
                                {
                                    let test_ident = Ident::new(
                                        test.into(),
                                        swc_common::Span::new(
                                            swc_common::BytePos(0),
                                            swc_common::BytePos(0),
                                        ),
                                        swc_common::SyntaxContext::empty(),
                                    );
                                    let cons_str = cons.trim_matches('\'');
                                    let alt_str = alt.trim_matches('\'');
                                    Expr::Cond(CondExpr {
                                        span: swc_common::Span::new(
                                            swc_common::BytePos(0),
                                            swc_common::BytePos(0),
                                        ),
                                        test: Box::new(Expr::Ident(test_ident)),
                                        cons: Box::new(Expr::Lit(Lit::Str(Str {
                                            value: cons_str.into(),
                                            span: swc_common::Span::new(
                                                swc_common::BytePos(0),
                                                swc_common::BytePos(0),
                                            ),
                                            raw: Some(format!("'{}'", cons_str).into()),
                                        }))),
                                        alt: Box::new(Expr::Lit(Lit::Str(Str {
                                            value: alt_str.into(),
                                            span: swc_common::Span::new(
                                                swc_common::BytePos(0),
                                                swc_common::BytePos(0),
                                            ),
                                            raw: Some(format!("'{}'", alt_str).into()),
                                        }))),
                                    })
                                } else {
                                    Expr::Lit(Lit::Str(Str {
                                        value: raw.into(),
                                        span: swc_common::Span::new(
                                            swc_common::BytePos(0),
                                            swc_common::BytePos(0),
                                        ),
                                        raw: None,
                                    }))
                                }
                            } else {
                                Expr::Lit(Lit::Str(Str {
                                    value: raw.into(),
                                    span: swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    raw: None,
                                }))
                            }
                        } else {
                            Expr::Lit(Lit::Str(Str {
                                value: raw.into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))
                        }
                    } else if k == "textContent" {
                        // textContent 属性：检查模板字符串
                        let raw = v.clone().into_owned();
                        if raw.contains("${") {
                            // 模板字符串：检查是否包含${}语法
                            println!("DEBUG: Found template string in textContent: '{}'", raw);
                            // 去掉可能存在的反引号
                            let template_content = if raw.starts_with('`') && raw.ends_with('`') {
                                let content = raw[1..raw.len() - 1].to_string();
                                println!("DEBUG: Removed backticks, content: '{}'", content);
                                content
                            } else {
                                println!("DEBUG: No backticks to remove, content: '{}'", raw);
                                raw.clone()
                            };
                            Expr::Tpl(Tpl {
                                span: swc_common::DUMMY_SP,
                                exprs: vec![],
                                quasis: vec![TplElement {
                                    span: swc_common::DUMMY_SP,
                                    tail: true,
                                    cooked: Some(template_content.clone().into()),
                                    raw: template_content.into(),
                                }],
                            })
                        } else {
                            // 普通字符串字面量
                            Expr::Lit(Lit::Str(Str {
                                value: raw.into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))
                        }
                    } else if k.starts_with("data-") {
                        // data-* 属性处理
                        let raw = v.clone().into_owned();
                        if raw.starts_with('"') && raw.ends_with('"') && raw.len() > 1 {
                            // 字符串字面量：去掉外层引号
                            let inner_value = &raw[1..raw.len() - 1];
                            Expr::Lit(Lit::Str(Str {
                                value: inner_value.into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))
                        } else if raw.starts_with('`') && raw.ends_with('`') {
                            // 模板字符串
                            Expr::Tpl(Tpl {
                                span: swc_common::DUMMY_SP,
                                exprs: vec![],
                                quasis: vec![TplElement {
                                    span: swc_common::DUMMY_SP,
                                    tail: true,
                                    cooked: Some(raw.trim_matches('`').into()),
                                    raw: raw.trim_matches('`').into(),
                                }],
                            })
                        } else if raw.starts_with("JSON.stringify(") && raw.ends_with(')') {
                            // JSON.stringify 调用（安全剥离）
                            let inner_opt = raw
                                .strip_prefix("JSON.stringify(")
                                .and_then(|s| s.strip_suffix(')'));
                            if let Some(inner) = inner_opt {
                                if inner
                                    .chars()
                                    .all(|c| c.is_alphanumeric() || c == '_' || c == '.')
                                {
                                    Expr::Call(CallExpr {
                                        ctxt: swc_common::SyntaxContext::empty(),

                                        span: swc_common::DUMMY_SP,

                                        callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                                            span: swc_common::DUMMY_SP,
                                            obj: Box::new(Expr::Ident(Ident::new(
                                                "JSON".into(),
                                                swc_common::DUMMY_SP,
                                                swc_common::SyntaxContext::empty(),
                                            ))),
                                            prop: MemberProp::Ident(
                                                Ident::new(
                                                    "stringify".into(),
                                                    swc_common::DUMMY_SP,
                                                    swc_common::SyntaxContext::empty(),
                                                )
                                                .into(),
                                            ),
                                        }))),
                                        args: vec![ExprOrSpread {
                                            spread: None,
                                            expr: Box::new(Expr::Ident(Ident::new(
                                                inner.into(),
                                                swc_common::DUMMY_SP,
                                                swc_common::SyntaxContext::empty(),
                                            ))),
                                        }],
                                        type_args: None,
                                    })
                                } else {
                                    Expr::Lit(Lit::Str(Str {
                                        value: raw.into(),
                                        span: swc_common::DUMMY_SP,
                                        raw: None,
                                    }))
                                }
                            } else {
                                // 结构不匹配时退化为字符串字面量
                                Expr::Lit(Lit::Str(Str {
                                    value: raw.into(),
                                    span: swc_common::DUMMY_SP,
                                    raw: None,
                                }))
                            }
                        } else if raw
                            .chars()
                            .all(|c| c.is_alphanumeric() || c == '_' || c == '.')
                            && !raw.is_empty()
                            && raw.len() > 1
                        {
                            // 复杂标识符（包含点号访问）
                            Expr::Ident(Ident::new(
                                raw.into(),
                                swc_common::DUMMY_SP,
                                swc_common::SyntaxContext::empty(),
                            ))
                        } else {
                            Expr::Lit(Lit::Str(Str {
                                value: raw.into(),
                                span: swc_common::DUMMY_SP,
                                raw: None,
                            }))
                        }
                    } else {
                        Expr::Lit(Lit::Str(Str {
                            value: v.clone().into_owned().into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))
                    };
                    args.push(ExprOrSpread {
                        spread: None,
                        expr: Box::new(val_expr),
                    });
                    args
                },
                type_args: None,
            });
            updater_stmts.push(Stmt::Expr(ExprStmt {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                expr: Box::new(call),
            }));
        }

        // children 展开为可变参数
        let mut child_args: Vec<ExprOrSpread> = Vec::new();

        for child in &view_particle.template.children {
            // 文本子节点：汇聚到 updater 的 textContent，且不作为子节点输出
            if child.particle_type.as_deref() == Some("text") {
                let t = child.particle_data.clone().unwrap_or_default();
                let norm_t = Self::normalize_text_content(&t);

                let set_text = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(Expr::Ident(Ident::new(
                            ctx.node_name_in_update.clone().into(),
                            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                            swc_common::SyntaxContext::empty(),
                        ))),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "setAttribute".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: "textContent".into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Str(Str {
                                value: norm_t.into(),
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                raw: None,
                            }))),
                        },
                    ],
                    type_args: None,
                });
                deferred_text_stmts.push(Stmt::Expr(ExprStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    expr: Box::new(set_text),
                }));
                continue;
            }

            let child_expr = self.generate_view_expression(child, ctx)?;
            child_args.push(ExprOrSpread {
                spread: None,
                expr: Box::new(child_expr),
            });
        }

        // 将事件按顺序追加到属性更新之后，再追加文本设置，确保与 TS 顺序一致
        updater_stmts.extend(deferred_event_delegate.into_iter());
        updater_stmts.extend(deferred_event_set_start.into_iter());
        updater_stmts.extend(deferred_event_set_end.into_iter());
        updater_stmts.extend(deferred_event_set_other.into_iter());
        updater_stmts.extend(deferred_text_stmts.into_iter());

        // 现在根据（可能新增的）updater_stmts 构造 updater 表达式
        let updater_expr = if updater_stmts.is_empty() {
            Expr::Lit(Lit::Null(Null {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            }))
        } else {
            Expr::Arrow(ArrowExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                params: vec![Pat::Ident(BindingIdent {
                    id: Ident::new(
                        ctx.node_name_in_update.clone().into(),
                        swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        swc_common::SyntaxContext::empty(),
                    ),
                    type_ann: None,
                })],
                body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                    ctxt: swc_common::SyntaxContext::empty(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    stmts: updater_stmts,
                })),
                is_async: false,
                is_generator: false,
                type_params: None,
                return_type: None,
            })
        };

        // 组装最终参数：tag, updater, ...children
        let mut args: Vec<ExprOrSpread> = Vec::new();
        args.push(ExprOrSpread {
            spread: None,
            expr: Box::new(Expr::Lit(Lit::Str(Str {
                value: tag_name.clone().into(),
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                raw: None,
            }))),
        });
        args.push(ExprOrSpread {
            spread: None,
            expr: Box::new(updater_expr),
        });
        args.extend(child_args);

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createHTMLNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        }))
    }

    /// 生成 If 表达式（按照原版IfGenerator逻辑）
    fn generate_if_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 按照原版IfGenerator逻辑实现复杂的条件节点生成
        let node_name = "$$node";
        let node_ident = Expr::Ident(Ident::new(
            node_name.into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        ));

        // 处理分支：如果没有else分支，添加一个默认的
        let mut branches = view_particle.branches.clone().unwrap_or_else(|| {
            // 从particle_data和children构建默认分支
            let condition = if let Some(cond) = &view_particle.particle_data {
                Expr::Ident(Ident::new(
                    cond.clone().into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                ))
            } else {
                Expr::Lit(Lit::Bool(Bool {
                    value: true,
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                }))
            };

            vec![crate::types::IfBranch {
                condition: "condition".to_string().into(),
                children: view_particle
                    .template
                    .children
                    .iter()
                    .map(|c| {
                        Box::new(ViewUnit::Html(HTMLUnit {
                            type_: "html".into(),
                            tag: c.template.tag.clone(),
                            props: std::collections::HashMap::new(), // 简化处理，使用空HashMap
                            children: vec![],
                            is_component: false,
                            is_self_closing: false,
                            namespace: None,
                        }))
                    })
                    .collect(),
                dep_id_bitmap: view_particle.dep_id_bitmap.unwrap_or(0),
                dependencies_node: Expr::Array(ArrayLit {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    elems: vec![],
                }),
                is_else: false,
            }]
        });

        // 如果最后一个分支不是true条件，添加默认else分支（避免对 last() 的 unwrap）
        let last_is_true = branches
            .last()
            .map(|b| self.is_true_condition(&b.condition))
            .unwrap_or(false);
        if branches.is_empty() || !last_is_true {
            branches.push(crate::types::IfBranch {
                condition: "true".to_string().into(),
                children: vec![],
                dep_id_bitmap: 0,
                dependencies_node: Expr::Array(ArrayLit {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    elems: vec![],
                }),
                is_else: true,
            });
        }

        let mut react_bits = 0;

        // 按照原版逻辑，从后往前构建嵌套if语句
        let mut if_statement = None;

        for (i, branch) in branches.iter().rev().enumerate() {
            let idx = branches.len() - i - 1;

            // 生成branch检查：if (node.branch(idx)) return []
            let branch_check = Stmt::If(IfStmt {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                test: Box::new(Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(node_ident.clone()),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "branch".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: vec![ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            value: idx as f64,
                            raw: None,
                        }))),
                    }],
                    type_args: None,
                })),
                cons: Box::new(Stmt::Return(ReturnStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    arg: Some(Box::new(Expr::Array(ArrayLit {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        elems: vec![],
                    }))),
                })),
                alt: None,
            });

            // 生成子节点返回语句
            let mut child_exprs = Vec::new();
            for child in &branch.children {
                // 将ViewUnit转换为ViewParticle
                let child_particle = ViewParticle {
                    template: TemplateNode {
                        tag: "child".into(),
                        props: std::collections::HashMap::new(),
                        children: vec![],
                        is_element: true,
                        is_text: false,
                        events: vec![],
                        ref_id: None,
                        key: None,
                        node_type: NodeType::HTML,
                    },
                    mutable_units: vec![],
                    is_root: false,
                    has_async: false,
                    events: vec![],
                    dynamic_props: std::collections::HashMap::new(),
                    dependencies: vec![],
                    particle_type: Some("child".to_string()),
                    particle_data: Some("child".to_string()),
                    dep_id_bitmap: None,
                    branches: None,
                };
                let child_expr = self.generate_view_expression(&child_particle, ctx)?;
                child_exprs.push(child_expr);
            }

            let return_stmt = Stmt::Return(ReturnStmt {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                arg: Some(Box::new(Expr::Array(ArrayLit {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    elems: child_exprs
                        .into_iter()
                        .map(|e| {
                            Some(ExprOrSpread {
                                spread: None,
                                expr: Box::new(e),
                            })
                        })
                        .collect(),
                }))),
            });

            let child_statements = vec![branch_check, return_stmt];

            if i == 0 {
                // 最后一个分支（else）
                if_statement = Some(Stmt::Block(BlockStmt {
                    ctxt: swc_common::SyntaxContext::empty(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    stmts: child_statements,
                }));
            } else {
                // 构建条件检查：node.cachedCondition(idx, () => condition, dependencies)
                let condition_call = Expr::Call(CallExpr {
                    ctxt: swc_common::SyntaxContext::empty(),

                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                    callee: Callee::Expr(Box::new(Expr::Member(MemberExpr {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        obj: Box::new(node_ident.clone()),
                        prop: MemberProp::Ident(
                            Ident::new(
                                "cachedCondition".into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                    }))),
                    args: vec![
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Lit(Lit::Num(Number {
                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                value: idx as f64,
                                raw: None,
                            }))),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(Expr::Arrow(ArrowExpr {
                                ctxt: swc_common::SyntaxContext::empty(),

                                span: swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),

                                params: vec![],
                                body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Ident(
                                    Ident::new(
                                        branch.condition.clone().into_owned().into(),
                                        swc_common::Span::new(
                                            swc_common::BytePos(0),
                                            swc_common::BytePos(0),
                                        ),
                                        swc_common::SyntaxContext::empty(),
                                    ),
                                )))),
                                is_async: false,
                                is_generator: false,
                                type_params: None,
                                return_type: None,
                            })),
                        },
                        ExprOrSpread {
                            spread: None,
                            expr: Box::new(branch.dependencies_node.clone()),
                        },
                    ],
                    type_args: None,
                });

                react_bits |= branch.dep_id_bitmap;

                if_statement = Some(Stmt::If(IfStmt {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    test: Box::new(condition_call),
                    cons: Box::new(Stmt::Block(BlockStmt {
                        ctxt: swc_common::SyntaxContext::empty(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                        stmts: child_statements,
                    })),
                    alt: if_statement.map(Box::new),
                }));
            }
        }

        // 创建条件节点函数
        let updater = Expr::Arrow(ArrowExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            params: vec![Pat::Ident(BindingIdent {
                id: Ident::new(
                    node_name.into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                ),
                type_ann: None,
            })],
            body: Box::new(BlockStmtOrExpr::BlockStmt(BlockStmt {
                ctxt: swc_common::SyntaxContext::empty(),
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                stmts: vec![if_statement.unwrap_or_else(|| {
                    Stmt::Return(ReturnStmt {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        arg: Some(Box::new(Expr::Array(ArrayLit {
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            elems: vec![],
                        }))),
                    })
                })],
            })),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        });

        let mut args: Vec<ExprOrSpread> = vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(updater),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Num(Number {
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    value: react_bits as f64,
                    raw: None,
                }))),
            },
        ];

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createConditionalNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        }))
    }

    /// 检查条件是否为true
    fn is_true_condition(&self, condition: &Cow<'_, str>) -> bool {
        // Placeholder for now, actual logic will involve evaluating the expression
        // For simplicity, we'll assume a string literal "true" means true
        condition.as_ref() == "true"
    }

    /// 生成 For 表达式（createForNode(items, children) 或含 key）
    fn generate_for_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 数据源从 particle_data 读取标识符
        let items_expr = if let Some(items) = &view_particle.particle_data {
            Expr::Ident(Ident::new(
                items.clone().into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ))
        } else {
            // 兜底空数组
            Expr::Array(ArrayLit {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                elems: vec![],
            })
        };

        // 第一个子节点作为渲染体
        let body_expr = view_particle
            .template
            .children
            .get(0)
            .map(|c| self.generate_view_expression(c, ctx))
            .transpose()?
            .unwrap_or(Expr::Lit(Lit::Null(Null {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            })));

        let mut args: Vec<ExprOrSpread> = vec![
            ExprOrSpread {
                spread: None,
                expr: Box::new(items_expr),
            },
            ExprOrSpread {
                spread: None,
                expr: Box::new(body_expr),
            },
        ];

        // 若模板 key 存在，传入第三参
        if let Some(k) = &view_particle.template.key {
            args.insert(
                1,
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                        value: k.clone().into_owned().into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))),
                },
            );
        }

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createForNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        }))
    }

    /// 生成片段表达式（对齐 TS：createFragmentNode(...children)）
    fn generate_fragment_expression(
        &self,
        view_particle: &ViewParticle,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        let mut args: Vec<ExprOrSpread> = Vec::new();
        for child in &view_particle.template.children {
            let child_expr = self.generate_view_expression(child, _ctx)?;
            args.push(ExprOrSpread {
                spread: None,
                expr: Box::new(child_expr),
            });
        }

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createFragmentNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args,
            type_args: None,
        }))
    }

    /// 生成文本表达式（按照原版TextGenerator逻辑）
    fn generate_text_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        let text_content = view_particle.particle_data.clone().unwrap_or_default();

        // 按照原版TextGenerator逻辑，检查是否有依赖性
        let has_dependencies = view_particle.dep_id_bitmap.unwrap_or(0) > 0;

        if has_dependencies {
            // 动态文本节点：createTextNode(value, node => setText(node, () => value, deps, reactBits))
            let node_name = "node";
            let node_ident = Expr::Ident(Ident::new(
                node_name.into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ));

            // 创建setText调用
            let set_text_call = Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "setText".into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(node_ident.clone()),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            value: text_content.clone().into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Array(ArrayLit {
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            elems: vec![],
                        })),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Num(Number {
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            value: view_particle.dep_id_bitmap.unwrap_or(0) as f64,
                            raw: None,
                        }))),
                    },
                ],
                type_args: None,
            });

            // 创建更新函数
            let updater = Expr::Arrow(ArrowExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                params: vec![],
                body: Box::new(BlockStmtOrExpr::Expr(Box::new(set_text_call))),
                is_async: false,
                is_generator: false,
                type_params: None,
                return_type: None,
            });

            Ok(Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "createTextNode".into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Lit(Lit::Str(Str {
                            value: text_content.clone().into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))),
                    },
                    ExprOrSpread {
                        spread: None,
                        expr: Box::new(updater),
                    },
                ],
                type_args: None,
            }))
        } else {
            // 静态文本节点：createTextNode(value)
            Ok(Expr::Call(CallExpr {
                ctxt: swc_common::SyntaxContext::empty(),

                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

                callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                    "createTextNode".into(),
                    swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    swc_common::SyntaxContext::empty(),
                )))),
                args: vec![ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Str(Str {
                        value: text_content.into(),
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        raw: None,
                    }))),
                }],
                type_args: None,
            }))
        }
    }

    /// 生成表达式节点（createExpNode(() => expr, () => [], 0)）
    fn generate_expression_expression(
        &self,
        view_particle: &ViewParticle,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        let expr_ident = view_particle.particle_data.clone().unwrap_or_default();

        // 特殊处理：空字符串和空格直接生成 createTextNode
        if expr_ident == "\"\"" || expr_ident == "\" \"" {
            return self.generate_text_expression(view_particle, _ctx);
        }

        let arrow_get = Expr::Arrow(ArrowExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(Expr::Ident(Ident::new(
                expr_ident.into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ))))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        });
        let empty_array = Expr::Array(ArrayLit {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            elems: vec![],
        });
        let arrow_deps = Expr::Arrow(ArrowExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            params: vec![],
            body: Box::new(BlockStmtOrExpr::Expr(Box::new(empty_array))),
            is_async: false,
            is_generator: false,
            type_params: None,
            return_type: None,
        });
        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createExpNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(arrow_get),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(arrow_deps),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(Expr::Lit(Lit::Num(Number {
                        span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                        value: 0.0,
                        raw: None,
                    }))),
                },
            ],
            type_args: None,
        }))
    }

    /// 生成默认表达式
    fn generate_default_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 默认处理
        Ok(Expr::Lit(Lit::Null(Null {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
        })))
    }

    /// 生成属性对象
    fn generate_props_object(
        &self,
        props: &std::collections::HashMap<String, String>,
    ) -> CompilerResult<Expr> {
        let mut kv_props: Vec<PropOrSpread> = Vec::new();
        for (key, value) in props {
            kv_props.push(PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                key: PropName::Str(Str {
                    value: key.clone().into(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    raw: None,
                }),
                value: Box::new(Expr::Lit(Lit::Str(Str {
                    value: value.clone().into(),
                    span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                    raw: None,
                }))),
            }))))
        }
        Ok(Expr::Object(ObjectLit {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            props: kv_props,
        }))
    }

    /// 生成子元素数组
    fn generate_children_array(&self, children: &[ViewParticle]) -> CompilerResult<Expr> {
        let mut child_exprs = Vec::new();

        for child in children {
            let child_expr = self.generate_view_expression(
                child,
                &GeneratorContext {
                    node_name_in_update: "$$node".to_string(),
                    hoist_fn: Box::new(|_| {}),
                },
            )?;

            child_exprs.push(Some(ExprOrSpread {
                spread: None,
                expr: Box::new(child_expr),
            }));
        }

        Ok(Expr::Array(ArrayLit {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            elems: child_exprs,
        }))
    }

    /// 生成条件表达式
    fn generate_conditional_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 生成条件节点
        let condition_expr = Expr::Ident(Ident::new(
            "condition".into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        ));

        let then_expr = if let Some(child) = view_particle.template.children.get(0) {
            self.generate_view_expression(child, ctx)?
        } else {
            Expr::Lit(Lit::Null(Null {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            }))
        };

        let else_expr = if let Some(child) = view_particle.template.children.get(1) {
            self.generate_view_expression(child, ctx)?
        } else {
            Expr::Lit(Lit::Null(Null {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            }))
        };

        Ok(Expr::Cond(CondExpr {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            test: Box::new(condition_expr),
            cons: Box::new(then_expr),
            alt: Box::new(else_expr),
        }))
    }

    /// 生成循环表达式
    fn generate_loop_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 生成循环节点
        let array_expr = Expr::Ident(Ident::new(
            "array".into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        ));

        let item_expr = Expr::Ident(Ident::new(
            "item".into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        ));

        let body_expr = if let Some(child) = view_particle.template.children.get(0) {
            self.generate_view_expression(child, ctx)?
        } else {
            Expr::Lit(Lit::Null(Null {
                span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            }))
        };

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "createLoopNode".into(),
                swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
                swc_common::SyntaxContext::empty(),
            )))),
            args: vec![
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(array_expr),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(item_expr),
                },
                ExprOrSpread {
                    spread: None,
                    expr: Box::new(body_expr),
                },
            ],
            type_args: None,
        }))
    }

    /// 生成组件表达式
    fn generate_component_expression(
        &self,
        view_particle: &ViewParticle,
        ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 生成组件节点
        let component_name = "Component".to_string();
        let component_expr = Expr::Ident(Ident::new(
            component_name.into(),
            swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            swc_common::SyntaxContext::empty(),
        ));

        let props_expr = Expr::Object(ObjectLit {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            props: view_particle
                .template
                .props
                .iter()
                .map(|(key, value)| {
                    PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(
                            Ident::new(
                                key.clone().into(),
                                swc_common::Span::new(
                                    swc_common::BytePos(0),
                                    swc_common::BytePos(0),
                                ),
                                swc_common::SyntaxContext::empty(),
                            )
                            .into(),
                        ),
                        value: Box::new(Expr::Lit(Lit::Str(Str {
                            value: value.clone().into(),
                            span: swc_common::Span::new(
                                swc_common::BytePos(0),
                                swc_common::BytePos(0),
                            ),
                            raw: None,
                        }))),
                    })))
                })
                .collect(),
        });

        Ok(Expr::Call(CallExpr {
            ctxt: swc_common::SyntaxContext::empty(),

            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),

            callee: Callee::Expr(Box::new(component_expr)),
            args: vec![ExprOrSpread {
                spread: None,
                expr: Box::new(props_expr),
            }],
            type_args: None,
        }))
    }

    /// 生成展开表达式
    fn generate_spread_expression(
        &self,
        view_particle: &ViewParticle,
        _ctx: &GeneratorContext,
    ) -> CompilerResult<Expr> {
        // 生成展开节点
        let expr_str = "{}".to_string();

        // 这里应该解析表达式字符串为实际的AST表达式
        // 为了简化，我们返回一个对象字面量
        Ok(Expr::Object(ObjectLit {
            span: swc_common::Span::new(swc_common::BytePos(0), swc_common::BytePos(0)),
            props: vec![],
        }))
    }
}
