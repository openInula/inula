// variables_analyzer.rs - 变量分析器，对应原版 variablesAnalyze.ts
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use swc_ecma_ast::*;
// use crate::types::{StateStmt, DerivedStmt, HookCall, Dependency};

/// 变量分析器 - 对应原版 variablesAnalyze
pub struct VariablesAnalyzer;

impl VariablesAnalyzer {
    /// 分析变量声明
    pub fn analyze_variable_declaration<'a>(
        &self,
        var_decl: &VarDecl,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        for declarator in &var_decl.decls {
            self.analyze_variable_declarator(declarator, builder)?;
        }
        Ok(())
    }

    /// 分析单个变量声明符
    fn analyze_variable_declarator<'a>(
        &self,
        declarator: &VarDeclarator,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        let id = &declarator.name;
        let init = &declarator.init;

        // 检查是否为 const 且静态值
        if let Some(init_expr) = init {
            if self.is_static_value(init_expr) {
                // 静态值不需要生成额外的变量声明，直接跳过
                return Ok(());
            }
        }

        // 分析变量类型
        match id {
            Pat::Ident(ident) => {
                let var_name = ident.sym.as_str();

                // 检查是否为 Hook 调用
                if let Some(init_expr) = init {
                    if self.is_hook_call(init_expr) {
                        self.analyze_hook_call(var_name, init_expr, builder)?;
                        return Ok(());
                    }
                }

                // 检查是否为组件调用
                if let Some(init_expr) = init {
                    if self.is_component_call(init_expr) {
                        if let Expr::Call(call_expr) = &**init_expr {
                            self.analyze_sub_component(var_name, call_expr, builder)?;
                        }
                        return Ok(());
                    }
                }

                // 检查是否为 useContext 调用
                if let Some(init_expr) = init {
                    if self.is_use_context_call(init_expr) {
                        if let Expr::Call(call_expr) = &**init_expr {
                            self.analyze_use_context(var_name, call_expr, builder)?;
                        }
                        return Ok(());
                    }
                }

                // 检查是否为响应式变量
                if self.is_reactive_variable(var_name, init) {
                    self.analyze_reactive_variable(var_name, init, builder)?;
                } else {
                    // 普通变量
                    builder.add_variable(declarator)?;
                }
            }
            Pat::Array(array_pat) => {
                // 数组解构
                self.analyze_array_destructuring(array_pat, init, builder)?;
            }
            Pat::Object(object_pat) => {
                // 对象解构
                self.analyze_object_destructuring(object_pat, init, builder)?;
            }
            _ => {
                // 其他模式，作为原始语句处理
                builder.add_raw_stmt("complex pattern".to_string());
            }
        }

        Ok(())
    }

    /// 分析 Hook 调用
    fn analyze_hook_call<'a>(
        &self,
        var_name: &str,
        init_expr: &Expr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Expr::Call(call_expr) = init_expr {
            if let Callee::Expr(callee_expr) = &call_expr.callee {
                if let Expr::Ident(callee) = &**callee_expr {
                    let hook_name = callee.sym.as_str();

                    match hook_name {
                        "useState" => {
                            let initial_value = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            let id = builder.get_next_id();
                            builder.add_state(
                                var_name.to_string(),
                                None, // initial_value 需要从表达式计算
                                Some(id),
                            );
                        }
                        "useEffect" => {
                            let callback = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));
                            let deps = call_expr
                                .args
                                .get(1)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            // 分析 useEffect 逻辑
                            let effect_type = if let Some(deps) = &deps {
                                if deps == "[]" {
                                    "mount_effect"
                                } else {
                                    "update_effect"
                                }
                            } else {
                                "always_effect"
                            };
                            builder.add_raw_stmt(format!(
                                "useEffect: {} ({})",
                                var_name, effect_type
                            ))?;
                        }
                        "useMemo" => {
                            let callback = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));
                            let deps = call_expr
                                .args
                                .get(1)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            // 分析 useMemo 逻辑
                            let memo_type = if let Some(deps) = &deps {
                                if deps == "[]" {
                                    "static_memo"
                                } else {
                                    "dynamic_memo"
                                }
                            } else {
                                "always_memo"
                            };
                            builder
                                .add_raw_stmt(format!("useMemo: {} ({})", var_name, memo_type))?;
                        }
                        "useCallback" => {
                            let callback = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));
                            let deps = call_expr
                                .args
                                .get(1)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            // 分析 useCallback 逻辑
                            let callback_type = if let Some(deps) = &deps {
                                if deps == "[]" {
                                    "static_callback"
                                } else {
                                    "dynamic_callback"
                                }
                            } else {
                                "always_callback"
                            };
                            builder.add_raw_stmt(format!(
                                "useCallback: {} ({})",
                                var_name, callback_type
                            ))?;
                        }
                        "useRef" => {
                            let initial_value = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            let id = builder.get_next_id();
                            builder.add_ref(var_name.to_string(), None, Some(id));
                        }
                        "useContext" => {
                            let context = call_expr
                                .args
                                .get(0)
                                .map(|arg| self.extract_expression_string(&arg.expr));

                            // 分析 useContext 逻辑
                            let context_name =
                                context.unwrap_or_else(|| "unknown_context".to_string());
                            builder.add_raw_stmt(format!(
                                "useContext: {} (context: {})",
                                var_name, context_name
                            ))?;
                        }
                        _ => {
                            // 其他 Hook
                            let id = builder.get_next_id();
                            builder.add_hook_call(hook_name.to_string(), vec![], Some(id));
                        }
                    }
                }
            }
        }

        Ok(())
    }

    /// 分析响应式变量
    fn analyze_reactive_variable<'a>(
        &self,
        var_name: &str,
        init: &Option<Box<Expr>>,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        let initial_value = init
            .as_ref()
            .map(|expr| self.extract_expression_string(expr));

        let id = builder.get_next_id();
        builder.add_state(
            var_name.to_string(),
            None, // initial_value 需要从表达式计算
            Some(id),
        );

        Ok(())
    }

    /// 分析数组解构
    fn analyze_array_destructuring<'a>(
        &self,
        array_pat: &ArrayPat,
        init: &Option<Box<Expr>>,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 分析数组解构
        let elements: Vec<String> = array_pat
            .elems
            .iter()
            .filter_map(|elem| elem.as_ref())
            .map(|elem| match elem {
                Pat::Ident(ident) => ident.sym.to_string(),
                Pat::Array(arr_pat) => format!("[{}]", arr_pat.elems.len()),
                Pat::Object(obj_pat) => format!("{{{}}}", obj_pat.props.len()),
                _ => "unknown".to_string(),
            })
            .collect();
        builder.add_raw_stmt(format!("array destructuring: [{}]", elements.join(", ")));
        Ok(())
    }

    /// 分析对象解构
    fn analyze_object_destructuring<'a>(
        &self,
        object_pat: &ObjectPat,
        init: &Option<Box<Expr>>,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 分析对象解构
        let properties: Vec<String> = object_pat
            .props
            .iter()
            .map(|prop| match prop {
                ObjectPatProp::KeyValue(kv) => {
                    let key = match &kv.key {
                        PropName::Ident(ident) => ident.sym.to_string(),
                        PropName::Str(str_lit) => str_lit.value.to_string(),
                        PropName::Num(num_lit) => num_lit.value.to_string(),
                        _ => "unknown".to_string(),
                    };
                    let value = match &*kv.value {
                        Pat::Ident(ident) => ident.sym.to_string(),
                        _ => "complex".to_string(),
                    };
                    format!("{}: {}", key, value)
                }
                ObjectPatProp::Assign(assign) => assign.key.sym.to_string(),
                ObjectPatProp::Rest(_) => "...rest".to_string(),
            })
            .collect();
        builder.add_raw_stmt(format!(
            "object destructuring: {{{}}}",
            properties.join(", ")
        ));
        Ok(())
    }

    /// 检查是否为静态值
    fn is_static_value(&self, expr: &Expr) -> bool {
        matches!(
            expr,
            Expr::Lit(Lit::Str(_))
                | Expr::Lit(Lit::Num(_))
                | Expr::Lit(Lit::Bool(_))
                | Expr::Lit(Lit::Null(_))
        )
    }

    /// 检查是否为 Hook 调用
    fn is_hook_call(&self, expr: &Expr) -> bool {
        if let Expr::Call(call_expr) = expr {
            if let Callee::Expr(callee_expr) = &call_expr.callee {
                if let Expr::Ident(callee) = &**callee_expr {
                    let hook_name = callee.sym.as_str();
                    return hook_name.starts_with("use") && hook_name.len() > 3;
                }
            }
        }
        false
    }

    /// 检查是否为响应式变量
    fn is_reactive_variable(&self, var_name: &str, init: &Option<Box<Expr>>) -> bool {
        // 检查变量名是否以特定前缀开头或包含特定模式
        var_name.starts_with("reactive")
            || var_name.starts_with("state")
            || var_name.starts_with("ref")
    }

    /// 检查是否为组件调用
    fn is_component_call(&self, expr: &Expr) -> bool {
        if let Expr::Call(call_expr) = expr {
            if let Callee::Expr(callee_expr) = &call_expr.callee {
                if let Expr::Ident(callee) = &**callee_expr {
                    let func_name = callee.sym.as_str();
                    // 检查是否是组件创建函数
                    return func_name == "Component" || func_name.ends_with("Component");
                }
            }
        }
        false
    }

    /// 检查是否为 useContext 调用
    fn is_use_context_call(&self, expr: &Expr) -> bool {
        if let Expr::Call(call_expr) = expr {
            if let Callee::Expr(callee_expr) = &call_expr.callee {
                if let Expr::Ident(callee) = &**callee_expr {
                    return callee.sym.as_str() == "useContext";
                }
            }
        }
        false
    }

    /// 分析子组件
    fn analyze_sub_component<'a>(
        &self,
        var_name: &str,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 分析子组件
        let component_type = if var_name.chars().next().map_or(false, |c| c.is_uppercase()) {
            "custom_component"
        } else {
            "html_element"
        };
        builder.add_raw_stmt(format!("sub component: {} ({})", var_name, component_type))?;
        Ok(())
    }

    /// 分析 useContext 调用
    fn analyze_use_context<'a>(
        &self,
        var_name: &str,
        call_expr: &CallExpr,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        // 分析 useContext 调用
        let context_name = call_expr
            .args
            .get(0)
            .map(|arg| self.extract_expression_string(&arg.expr))
            .unwrap_or_else(|| "unknown_context".to_string());
        builder.add_raw_stmt(format!(
            "useContext: {} (context: {})",
            var_name, context_name
        ))?;
        Ok(())
    }

    /// 提取表达式字符串
    fn extract_expression_string(&self, expr: &Expr) -> String {
        match expr {
            Expr::Lit(Lit::Str(s)) => s.value.to_string(),
            Expr::Lit(Lit::Num(n)) => n.value.to_string(),
            Expr::Lit(Lit::Bool(b)) => b.value.to_string(),
            Expr::Ident(i) => i.sym.to_string(),
            _ => "complex_expression".to_string(),
        }
    }
}
