// functional_macro_analyzer.rs - 函数宏分析器，对应原版 functionalMacroAnalyze.ts
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use swc_ecma_ast::*;
// use crate::types::{LifecycleStmt};

/// 函数宏分析器 - 对应原版 functionalMacroAnalyze
pub struct FunctionalMacroAnalyzer;

impl FunctionalMacroAnalyzer {
    /// 分析函数宏
    pub fn analyze_functional_macro<'a>(
        &self,
        stmt: &Stmt,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        match stmt {
            Stmt::Expr(expr_stmt) => {
                if let Expr::Call(call_expr) = &*expr_stmt.expr {
                    self.analyze_function_call(call_expr, builder)?;
                }
            }
            Stmt::Decl(decl) => {
                if let Decl::Fn(fn_decl) = decl {
                    // 分析函数声明
                    let func_name = fn_decl.ident.sym.to_string();
                    builder.add_raw_stmt(format!("function declaration: {}", func_name))?;

                    // 分析函数参数
                    for param in &fn_decl.function.params {
                        match &param.pat {
                            Pat::Ident(ident) => {
                                builder
                                    .add_raw_stmt(format!("function parameter: {}", ident.sym))?;
                            }
                            Pat::Array(array_pat) => {
                                builder.add_raw_stmt("array destructured parameter".to_string())?;
                            }
                            Pat::Object(obj_pat) => {
                                builder
                                    .add_raw_stmt("object destructured parameter".to_string())?;
                            }
                            _ => {
                                builder.add_raw_stmt("complex parameter pattern".to_string())?;
                            }
                        }
                    }

                    // 分析函数体
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_function_body(body, builder)?;
                    }
                }
            }
            _ => {
                // 其他语句类型
                builder.add_raw_stmt("other statement".to_string());
            }
        }

        Ok(())
    }

    /// 分析函数体
    fn analyze_function_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => match decl {
                    Decl::Var(var_decl) => {
                        builder.add_raw_stmt("variable declaration in function".to_string())?;
                    }
                    Decl::Fn(fn_decl) => {
                        builder.add_raw_stmt("nested function declaration".to_string())?;
                    }
                    _ => {}
                },
                Stmt::If(if_stmt) => {
                    builder.add_raw_stmt("if statement in function".to_string())?;
                }
                Stmt::For(for_stmt) => {
                    builder.add_raw_stmt("for statement in function".to_string())?;
                }
                Stmt::While(while_stmt) => {
                    builder.add_raw_stmt("while statement in function".to_string())?;
                }
                Stmt::Expr(expr_stmt) => {
                    if let Expr::Call(call_expr) = &*expr_stmt.expr {
                        self.analyze_function_call(call_expr, builder)?;
                    }
                }
                _ => {
                    builder.add_raw_stmt("other statement in function".to_string())?;
                }
            }
        }
        Ok(())
    }

    /// 分析函数调用
    fn analyze_function_call<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(callee) = &**callee_expr {
                let func_name = callee.sym.as_str();

                match func_name {
                    "onMounted" => {
                        self.analyze_lifecycle_hook("onMounted", call_expr, builder)?;
                    }
                    "onUnmounted" => {
                        self.analyze_lifecycle_hook("onUnmounted", call_expr, builder)?;
                    }
                    "onUpdated" => {
                        self.analyze_lifecycle_hook("onUpdated", call_expr, builder)?;
                    }
                    "onBeforeMount" => {
                        self.analyze_lifecycle_hook("onBeforeMount", call_expr, builder)?;
                    }
                    "onBeforeUnmount" => {
                        self.analyze_lifecycle_hook("onBeforeUnmount", call_expr, builder)?;
                    }
                    "onBeforeUpdate" => {
                        self.analyze_lifecycle_hook("onBeforeUpdate", call_expr, builder)?;
                    }
                    "watch" => {
                        self.analyze_watch(call_expr, builder)?;
                    }
                    "watchEffect" => {
                        self.analyze_watch_effect(call_expr, builder)?;
                    }
                    "computed" => {
                        self.analyze_computed(call_expr, builder)?;
                    }
                    "reactive" => {
                        self.analyze_reactive(call_expr, builder)?;
                    }
                    "ref" => {
                        self.analyze_ref(call_expr, builder)?;
                    }
                    "nextTick" => {
                        self.analyze_next_tick(call_expr, builder)?;
                    }
                    _ => {
                        // 其他函数调用
                        builder.add_raw_stmt(format!("function call: {}", func_name));
                    }
                }
            }
        } else if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Member(member_expr) = &**callee_expr {
                // 成员表达式调用
                self.analyze_member_call(member_expr, call_expr, builder)?;
            }
        }

        Ok(())
    }

    /// 分析生命周期钩子
    fn analyze_lifecycle_hook<'a>(
        &self,
        hook_name: &str,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(arg) = call_expr.args.get(0) {
            if let Some(arrow) = self.try_extract_arrow(&arg.expr) {
                builder.add_lifecycle(hook_name, arrow);
            } else {
                builder.add_raw_stmt(format!("lifecycle: {}", hook_name))?;
            }
        }

        Ok(())
    }

    /// 分析 watch
    fn analyze_watch<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if call_expr.args.len() >= 2 {
            let dep = builder.get_dependency(&call_expr.args[0].expr);
            if let Some(arrow) = self.try_extract_arrow(&call_expr.args[1].expr) {
                builder.add_watch(arrow, dep);
            } else {
                builder.add_raw_stmt("watch: non-arrow".to_string())?;
            }
        }

        Ok(())
    }

    /// 分析 watchEffect
    fn analyze_watch_effect<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(arg) = call_expr.args.get(0) {
            if let Some(arrow) = self.try_extract_arrow(&arg.expr) {
                builder.add_effect(arrow, None);
            } else {
                builder.add_raw_stmt("watchEffect: non-arrow".to_string())?;
            }
        }

        Ok(())
    }

    /// 分析 computed
    fn analyze_computed<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(arg) = call_expr.args.get(0) {
            if let Some(arrow) = self.try_extract_arrow(&arg.expr) {
                // 分析箭头函数的依赖
                let dep = match &*arrow.body {
                    swc_ecma_ast::BlockStmtOrExpr::Expr(e) => {
                        // 从表达式体中提取依赖
                        builder.get_dependency(e)
                    }
                    swc_ecma_ast::BlockStmtOrExpr::BlockStmt(block) => {
                        // 从块语句中提取依赖
                        let mut deps = Vec::new();
                        for stmt in &block.stmts {
                            if let Stmt::Return(ret_stmt) = stmt {
                                if let Some(arg) = &ret_stmt.arg {
                                    deps.extend(builder.get_dependency(arg));
                                }
                            }
                        }
                        deps.into_iter().next()
                    }
                };
                builder.add_derived("__computed".to_string(), arrow, dep, None);
            } else {
                builder.add_hook_call("computed".to_string(), vec![], None);
            }
        }

        Ok(())
    }

    /// 分析 reactive
    fn analyze_reactive<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(_arg) = call_expr.args.get(0) {
            builder.add_hook_call("reactive".to_string(), vec![], None);
        }

        Ok(())
    }

    /// 分析 ref
    fn analyze_ref<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(first) = call_expr.args.get(0) {
            // 分析ref的初始值表达式
            let initial = Some((*first.expr).clone());
            let ref_name = format!("__ref_{}", builder.get_next_id());
            builder.add_ref(ref_name, initial, None);
        } else {
            builder.add_ref("__ref".to_string(), None, None);
        }

        Ok(())
    }

    /// 分析 nextTick
    fn analyze_next_tick<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(_arg) = call_expr.args.get(0) {
            builder.add_hook_call("nextTick".to_string(), vec![], None);
        }

        Ok(())
    }

    /// 分析成员表达式调用
    fn analyze_member_call<'a>(
        &self,
        member_expr: &MemberExpr,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        let method_name = self.extract_member_name(member_expr);

        match method_name.as_str() {
            "push" | "pop" | "shift" | "unshift" | "splice" | "sort" | "reverse" => {
                // 数组方法，可能是响应式的
                builder.add_raw_stmt(format!("array method: {}", method_name));
            }
            "set" | "get" | "has" | "delete" => {
                // Map/Set 方法
                builder.add_raw_stmt(format!("map/set method: {}", method_name));
            }
            _ => {
                // 其他成员方法调用
                builder.add_raw_stmt(format!("member method call: {}", method_name));
            }
        }

        Ok(())
    }

    /// 分析函数声明
    fn analyze_function_declaration<'a>(
        &self,
        fn_decl: &Function,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 暂记录存在函数声明，具体子组件提取在其它模块处理
        builder.add_raw_stmt("function declaration".to_string())?;

        Ok(())
    }

    /// 提取成员表达式名称
    fn extract_member_name(&self, member_expr: &MemberExpr) -> String {
        match &member_expr.prop {
            MemberProp::Ident(ident) => ident.sym.to_string(),
            MemberProp::Computed(computed) => match &*computed.expr {
                Expr::Lit(Lit::Str(s)) => s.value.to_string(),
                Expr::Lit(Lit::Num(n)) => n.value.to_string(),
                Expr::Ident(i) => i.sym.to_string(),
                _ => "computed_prop".to_string(),
            },
            MemberProp::PrivateName(_p) => "private".to_string(),
        }
    }

    /// 提取表达式字符串
    fn extract_expression_string(&self, expr: &Expr) -> String {
        match expr {
            Expr::Lit(Lit::Str(s)) => s.value.to_string(),
            Expr::Lit(Lit::Num(n)) => n.value.to_string(),
            Expr::Lit(Lit::Bool(b)) => b.value.to_string(),
            Expr::Ident(i) => i.sym.to_string(),
            Expr::Call(call) => {
                if let Callee::Expr(callee_expr) = &call.callee {
                    if let Expr::Ident(callee) = &**callee_expr {
                        format!("{}(...)", callee.sym)
                    } else {
                        "function_call".to_string()
                    }
                } else {
                    "function_call".to_string()
                }
            }
            Expr::Arrow(arrow) => "arrow_function".to_string(),
            Expr::Fn(fn_expr) => "function_expression".to_string(),
            Expr::Array(array) => "array".to_string(),
            Expr::Object(object) => "object".to_string(),
            _ => "complex_expression".to_string(),
        }
    }
}

impl FunctionalMacroAnalyzer {
    /// 若表达式为箭头函数则提取
    fn try_extract_arrow(&self, expr: &Expr) -> Option<ArrowExpr> {
        match expr {
            Expr::Arrow(a) => Some(a.clone()),
            _ => None,
        }
    }
}
