// hook_analyzer.rs - Hook 分析器，对应原版 hookAnalyze.ts
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use swc_ecma_ast::*;
// use crate::types::{HookReturnStmt, Dependency};

/// Hook 分析器 - 对应原版 hookAnalyze
pub struct HookAnalyzer;

impl HookAnalyzer {
    /// 分析 Hook 返回语句
    pub fn analyze_hook_return<'a>(
        &self,
        return_stmt: &ReturnStmt,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(argument) = &return_stmt.arg {
            let return_value = self.extract_expression_string(argument);
            let dependencies = self.extract_dependencies_from_expression(argument);

            // 分析 hook return 逻辑
            let return_type = if return_value.contains("useState") {
                "state_hook"
            } else if return_value.contains("useEffect") {
                "effect_hook"
            } else if return_value.contains("useMemo") {
                "memo_hook"
            } else if return_value.contains("useCallback") {
                "callback_hook"
            } else if return_value.contains("useRef") {
                "ref_hook"
            } else if return_value.contains("useContext") {
                "context_hook"
            } else {
                "custom_hook"
            };
            builder.add_raw_stmt(format!("hook return: {} ({})", return_value, return_type))?;
        }

        Ok(())
    }

    /// 分析 Hook 函数体
    pub fn analyze_hook_function<'a>(
        &self,
        function: &Function,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 分析函数参数
        for param in &function.params {
            self.analyze_hook_parameter(param, builder)?;
        }

        // 分析函数体
        if let Some(body) = &function.body {
            for stmt in &body.stmts {
                self.analyze_hook_statement(stmt, builder)?;
            }
        }

        Ok(())
    }

    /// 分析 Hook 参数
    fn analyze_hook_parameter<'a>(
        &self,
        param: &Param,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        match &param.pat {
            Pat::Ident(ident) => {
                let param_name = ident.sym.as_str();

                // 检查是否为解构参数
                if param_name.contains('{') || param_name.contains('[') {
                    // 解构参数处理
                    builder.add_raw_stmt(format!("destructured parameter: {}", param_name));
                } else {
                    // 普通参数
                    builder.add_raw_stmt(format!("parameter: {}", param_name));
                }
            }
            Pat::Array(array_pat) => {
                // 数组解构参数
                builder.add_raw_stmt("array destructured parameter".to_string());
            }
            Pat::Object(object_pat) => {
                // 对象解构参数
                builder.add_raw_stmt("object destructured parameter".to_string());
            }
            _ => {
                // 其他模式
                builder.add_raw_stmt("complex parameter pattern".to_string());
            }
        }

        Ok(())
    }

    /// 分析 Hook 语句
    fn analyze_hook_statement<'a>(
        &self,
        stmt: &Stmt,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        match stmt {
            Stmt::Return(return_stmt) => {
                self.analyze_hook_return(return_stmt, builder)?;
            }
            Stmt::Decl(decl) => {
                // 变量声明
                builder.add_raw_stmt("variable declaration in hook".to_string());
            }
            Stmt::Expr(expr_stmt) => {
                // 表达式语句
                if let Expr::Call(call_expr) = &*expr_stmt.expr {
                    if self.is_hook_call(call_expr) {
                        self.analyze_hook_call_in_body(call_expr, builder)?;
                    }
                }
            }
            Stmt::If(if_stmt) => {
                // 条件语句
                builder.add_raw_stmt("if statement in hook".to_string());
            }
            Stmt::For(for_stmt) => {
                // 循环语句
                builder.add_raw_stmt("for statement in hook".to_string());
            }
            Stmt::While(while_stmt) => {
                // while 语句
                builder.add_raw_stmt("while statement in hook".to_string());
            }
            _ => {
                // 其他语句
                builder.add_raw_stmt("other statement in hook".to_string());
            }
        }

        Ok(())
    }

    /// 分析 Hook 调用
    fn analyze_hook_call_in_body<'a>(
        &self,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(callee) = &**callee_expr {
                let hook_name = callee.sym.as_str();

                match hook_name {
                    "useState" => {
                        builder.add_raw_stmt("useState call in hook body".to_string());
                    }
                    "useEffect" => {
                        builder.add_raw_stmt("useEffect call in hook body".to_string());
                    }
                    "useMemo" => {
                        builder.add_raw_stmt("useMemo call in hook body".to_string());
                    }
                    "useCallback" => {
                        builder.add_raw_stmt("useCallback call in hook body".to_string());
                    }
                    "useRef" => {
                        builder.add_raw_stmt("useRef call in hook body".to_string());
                    }
                    "useContext" => {
                        builder.add_raw_stmt("useContext call in hook body".to_string());
                    }
                    _ => {
                        builder.add_raw_stmt(format!("unknown hook call: {}", hook_name));
                    }
                }
            }
        }

        Ok(())
    }

    /// 检查是否为 Hook 调用
    fn is_hook_call(&self, call_expr: &CallExpr) -> bool {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(callee) = &**callee_expr {
                let hook_name = callee.sym.as_str();
                return hook_name.starts_with("use") && hook_name.len() > 3;
            }
        }
        false
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
            _ => "complex_expression".to_string(),
        }
    }

    /// 从表达式中提取依赖
    fn extract_dependencies_from_expression(&self, expr: &Expr) -> Vec<String> {
        let mut dependencies = Vec::new();
        self.extract_dependencies_recursive(expr, &mut dependencies);
        dependencies
    }

    /// 递归提取依赖
    fn extract_dependencies_recursive(&self, expr: &Expr, dependencies: &mut Vec<String>) {
        match expr {
            Expr::Ident(ident) => {
                dependencies.push(ident.sym.to_string());
            }
            Expr::Call(call) => {
                for arg in &call.args {
                    self.extract_dependencies_recursive(&arg.expr, dependencies);
                }
            }
            Expr::Arrow(arrow) => {
                let body = &arrow.body;
                match &**body {
                    BlockStmtOrExpr::BlockStmt(block) => {
                        for stmt in &block.stmts {
                            self.extract_dependencies_from_statement(stmt, dependencies);
                        }
                    }
                    BlockStmtOrExpr::Expr(expr) => {
                        self.extract_dependencies_recursive(expr, dependencies);
                    }
                }
            }
            Expr::Fn(fn_expr) => {
                if let Some(body) = &fn_expr.function.body {
                    for stmt in &body.stmts {
                        self.extract_dependencies_from_statement(stmt, dependencies);
                    }
                }
            }
            _ => {
                // 其他表达式类型暂不支持
            }
        }
    }

    /// 从语句中提取依赖
    fn extract_dependencies_from_statement(&self, stmt: &Stmt, dependencies: &mut Vec<String>) {
        match stmt {
            Stmt::Return(return_stmt) => {
                if let Some(argument) = &return_stmt.arg {
                    self.extract_dependencies_recursive(argument, dependencies);
                }
            }
            Stmt::Expr(expr_stmt) => {
                self.extract_dependencies_recursive(&*expr_stmt.expr, dependencies);
            }
            _ => {
                // 其他语句类型暂不支持
            }
        }
    }
}
