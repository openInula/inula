// advanced_analyzer.rs - 高级分析器，处理复杂的代码模式
use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use crate::types::{
    ComponentNode, Dependency, Event, ExpUnit, FragmentUnit, HTMLUnit, NodeType, TemplateNode,
    TextUnit, UnitProp, ViewParticle, ViewUnit,
};
use std::collections::HashMap;
use swc_ecma_ast::*;

/// 高级分析器 - 处理复杂的代码模式
pub struct AdvancedAnalyzer;

impl AdvancedAnalyzer {
    /// 分析高阶组件模式
    pub fn analyze_hoc_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                // 检查是否是高阶组件
                if self.is_higher_order_component(&fn_decl.function) {
                    builder.add_raw_stmt("高阶组件模式".to_string())?;

                    // 分析参数
                    for param in &fn_decl.function.params {
                        self.analyze_hoc_param(param, builder)?;
                    }

                    // 分析函数体
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_hoc_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是高阶组件
    fn is_higher_order_component(&self, fn_decl: &Function) -> bool {
        // 检查参数是否包含组件
        for param in &fn_decl.params {
            if let Pat::Ident(ident) = &param.pat {
                let param_name = ident.id.sym.as_ref();
                if param_name == "Component" || param_name == "WrappedComponent" {
                    return true;
                }
            }
        }
        false
    }

    /// 分析高阶组件参数
    fn analyze_hoc_param(&self, param: &Param, builder: &mut IRBuilder) -> CompilerResult<()> {
        match &param.pat {
            Pat::Ident(ident) => {
                let param_name = ident.id.sym.as_ref();
                builder.add_raw_stmt(format!("HOC参数: {}", param_name))?;
            }
            Pat::Object(obj_pat) => {
                builder.add_raw_stmt("HOC对象参数".to_string())?;
                for prop in &obj_pat.props {
                    match prop {
                        ObjectPatProp::KeyValue(kv) => {
                            if let PropName::Ident(key) = &kv.key {
                                builder.add_raw_stmt(format!("HOC属性: {}", key.sym))?;
                            }
                        }
                        _ => {}
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 分析高阶组件函数体
    fn analyze_hoc_body(&self, body: &BlockStmt, builder: &mut IRBuilder) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Return(return_stmt) => {
                    if let Some(arg) = &return_stmt.arg {
                        self.analyze_hoc_return(arg, builder)?;
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }

    /// 分析高阶组件返回值
    fn analyze_hoc_return(&self, expr: &Expr, builder: &mut IRBuilder) -> CompilerResult<()> {
        match expr {
            Expr::Arrow(arrow_expr) => {
                builder.add_raw_stmt("HOC返回箭头函数".to_string())?;
                if let body = &arrow_expr.body {
                    match &**body {
                        BlockStmtOrExpr::BlockStmt(block) => {
                            for stmt in &block.stmts {
                                self.analyze_hoc_return_stmt(stmt, builder)?;
                            }
                        }
                        BlockStmtOrExpr::Expr(expr) => {
                            self.analyze_hoc_return(expr, builder)?;
                        }
                    }
                }
            }
            Expr::Call(call_expr) => {
                builder.add_raw_stmt("HOC返回函数调用".to_string())?;
                if let Callee::Expr(callee) = &call_expr.callee {
                    self.analyze_hoc_return(callee, builder)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 分析高阶组件返回语句
    fn analyze_hoc_return_stmt(&self, stmt: &Stmt, builder: &mut IRBuilder) -> CompilerResult<()> {
        match stmt {
            Stmt::Return(return_stmt) => {
                if let Some(arg) = &return_stmt.arg {
                    self.analyze_hoc_return(arg, builder)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 分析渲染属性模式
    pub fn analyze_render_props_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_render_props_component(&fn_decl.function) {
                    builder.add_raw_stmt("渲染属性模式".to_string())?;

                    // 分析渲染函数
                    for param in &fn_decl.function.params {
                        if let Pat::Object(obj_pat) = &param.pat {
                            for prop in &obj_pat.props {
                                if let ObjectPatProp::KeyValue(kv) = prop {
                                    if let PropName::Ident(key) = &kv.key {
                                        if key.sym.as_ref() == "render"
                                            || key.sym.as_ref() == "children"
                                        {
                                            builder
                                                .add_raw_stmt(format!("渲染属性: {}", key.sym))?;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是渲染属性组件
    fn is_render_props_component(&self, fn_decl: &Function) -> bool {
        for param in &fn_decl.params {
            if let Pat::Object(obj_pat) = &param.pat {
                for prop in &obj_pat.props {
                    if let ObjectPatProp::KeyValue(kv) = prop {
                        if let PropName::Ident(key) = &kv.key {
                            let prop_name = key.sym.as_ref();
                            if prop_name == "render" || prop_name == "children" {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        false
    }

    /// 分析复合组件模式
    pub fn analyze_compound_component_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_compound_component(&fn_decl.function) {
                    builder.add_raw_stmt("复合组件模式".to_string())?;

                    // 分析子组件
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_compound_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是复合组件
    fn is_compound_component(&self, fn_decl: &Function) -> bool {
        // 检查是否包含子组件的定义
        if let Some(body) = &fn_decl.body {
            for stmt in &body.stmts {
                if let Stmt::Decl(decl) = stmt {
                    if let Decl::Fn(nested_fn) = decl {
                        // 检查嵌套函数是否是子组件
                        if self.is_sub_component(&nested_fn.function) {
                            return true;
                        }
                    }
                }
            }
        }
        false
    }

    /// 检查是否是子组件
    fn is_sub_component(&self, fn_decl: &Function) -> bool {
        // 简单的启发式检查
        if let Some(body) = &fn_decl.body {
            for stmt in &body.stmts {
                if let Stmt::Return(return_stmt) = stmt {
                    if let Some(arg) = &return_stmt.arg {
                        if self.contains_jsx_element(arg) {
                            return true;
                        }
                    }
                }
            }
        }
        false
    }

    /// 检查表达式是否包含 JSX 元素
    fn contains_jsx_element(&self, expr: &Expr) -> bool {
        match expr {
            Expr::JSXElement(_) | Expr::JSXFragment(_) => true,
            Expr::Call(call_expr) => {
                if let Callee::Expr(callee) = &call_expr.callee {
                    self.contains_jsx_element(callee)
                } else {
                    false
                }
            }
            _ => false,
        }
    }

    /// 分析复合组件函数体
    fn analyze_compound_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Fn(nested_fn) = decl {
                        if self.is_sub_component(&nested_fn.function) {
                            builder.add_raw_stmt("子组件定义".to_string())?;
                        }
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }

    /// 分析自定义 Hook 模式
    pub fn analyze_custom_hook_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_custom_hook(&fn_decl.function) {
                    builder.add_raw_stmt("自定义Hook模式".to_string())?;

                    // 分析Hook调用
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_hook_calls(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是自定义Hook
    fn is_custom_hook(&self, fn_decl: &Function) -> bool {
        // 检查函数名是否以 "use" 开头
        // 注意：Function 类型没有 ident 字段，这里需要从外部传入函数名
        // 需要从外部传入函数名进行判断
        false
    }

    /// 分析Hook调用
    fn analyze_hook_calls(&self, body: &BlockStmt, builder: &mut IRBuilder) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                self.analyze_hook_call_expr(init, builder)?;
                            }
                        }
                    }
                }
                Stmt::Expr(expr_stmt) => {
                    self.analyze_hook_call_expr(&expr_stmt.expr, builder)?;
                }
                _ => {}
            }
        }
        Ok(())
    }

    /// 分析Hook调用表达式
    fn analyze_hook_call_expr(&self, expr: &Expr, builder: &mut IRBuilder) -> CompilerResult<()> {
        match expr {
            Expr::Call(call_expr) => {
                if let Callee::Expr(callee) = &call_expr.callee {
                    if let Expr::Ident(ident) = &**callee {
                        let hook_name = ident.sym.as_ref();
                        if hook_name.starts_with("use") {
                            builder.add_raw_stmt(format!("Hook调用: {}", hook_name))?;
                        }
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 分析提供者模式 (Provider Pattern)
    pub fn analyze_provider_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_provider_component(&fn_decl.function) {
                    builder.add_raw_stmt("提供者模式".to_string())?;

                    // 分析Context创建
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_provider_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是提供者组件
    fn is_provider_component(&self, fn_decl: &Function) -> bool {
        // 注意：Function 类型没有 ident 字段，这里需要从外部传入函数名
        // 需要从外部传入函数名进行判断
        false
    }

    /// 分析提供者组件函数体
    fn analyze_provider_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                if let Expr::Call(call_expr) = &**init {
                                    if let Callee::Expr(callee) = &call_expr.callee {
                                        if let Expr::Ident(ident) = &**callee {
                                            if ident.sym.as_ref() == "createContext" {
                                                builder.add_raw_stmt("Context创建".to_string())?;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }

    /// 分析容器组件模式 (Container Pattern)
    pub fn analyze_container_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_container_component(&fn_decl.function) {
                    builder.add_raw_stmt("容器组件模式".to_string())?;

                    // 分析状态管理
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_container_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是容器组件
    fn is_container_component(&self, fn_decl: &Function) -> bool {
        // 注意：Function 类型没有 ident 字段，这里需要从外部传入函数名
        // 需要从外部传入函数名进行判断
        false
    }

    /// 分析容器组件函数体
    fn analyze_container_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        let mut has_state = false;
        let mut has_effects = false;

        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                if let Expr::Call(call_expr) = &**init {
                                    if let Callee::Expr(callee) = &call_expr.callee {
                                        if let Expr::Ident(ident) = &**callee {
                                            let hook_name = ident.sym.as_ref();
                                            if hook_name == "useState" {
                                                has_state = true;
                                                builder.add_raw_stmt("状态管理".to_string())?;
                                            } else if hook_name == "useEffect" {
                                                has_effects = true;
                                                builder.add_raw_stmt("副作用管理".to_string())?;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        if has_state && has_effects {
            builder.add_raw_stmt("完整容器组件".to_string())?;
        }

        Ok(())
    }

    /// 分析展示组件模式 (Presentational Pattern)
    pub fn analyze_presentational_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_presentational_component(&fn_decl.function) {
                    builder.add_raw_stmt("展示组件模式".to_string())?;

                    // 分析纯函数特性
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_presentational_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是展示组件
    fn is_presentational_component(&self, fn_decl: &Function) -> bool {
        // 注意：Function 类型没有 ident 字段，这里需要从外部传入函数名
        // 需要从外部传入函数名进行判断
        false
    }

    /// 分析展示组件函数体
    fn analyze_presentational_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        let mut has_jsx = false;
        let mut has_hooks = false;

        for stmt in &body.stmts {
            match stmt {
                Stmt::Return(return_stmt) => {
                    if let Some(arg) = &return_stmt.arg {
                        if self.contains_jsx_element(arg) {
                            has_jsx = true;
                            builder.add_raw_stmt("JSX渲染".to_string())?;
                        }
                    }
                }
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                if let Expr::Call(call_expr) = &**init {
                                    if let Callee::Expr(callee) = &call_expr.callee {
                                        if let Expr::Ident(ident) = &**callee {
                                            if ident.sym.as_ref().starts_with("use") {
                                                has_hooks = true;
                                                builder.add_raw_stmt("Hook使用".to_string())?;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }

        if has_jsx && !has_hooks {
            builder.add_raw_stmt("纯展示组件".to_string())?;
        }

        Ok(())
    }

    /// 分析异步组件模式
    pub fn analyze_async_component_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if fn_decl.function.is_async {
                    builder.add_raw_stmt("异步组件模式".to_string())?;

                    // 分析异步操作
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_async_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 分析异步组件函数体
    fn analyze_async_body(&self, body: &BlockStmt, builder: &mut IRBuilder) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                if let Expr::Await(_) = &**init {
                                    builder.add_raw_stmt("异步等待".to_string())?;
                                }
                            }
                        }
                    }
                }
                Stmt::Expr(expr_stmt) => {
                    if let Expr::Await(_) = &*expr_stmt.expr {
                        builder.add_raw_stmt("异步等待".to_string())?;
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }

    /// 分析错误边界模式
    pub fn analyze_error_boundary_pattern(
        &self,
        fn_node: &Decl,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        match fn_node {
            Decl::Fn(fn_decl) => {
                if self.is_error_boundary(&fn_decl.function) {
                    builder.add_raw_stmt("错误边界模式".to_string())?;

                    // 分析错误处理
                    if let Some(body) = &fn_decl.function.body {
                        self.analyze_error_boundary_body(body, builder)?;
                    }
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 检查是否是错误边界
    fn is_error_boundary(&self, fn_decl: &Function) -> bool {
        // 注意：Function 类型没有 ident 字段，这里需要从外部传入函数名
        // 需要从外部传入函数名进行判断
        false
    }

    /// 分析错误边界函数体
    fn analyze_error_boundary_body(
        &self,
        body: &BlockStmt,
        builder: &mut IRBuilder,
    ) -> CompilerResult<()> {
        for stmt in &body.stmts {
            match stmt {
                Stmt::Decl(decl) => {
                    if let Decl::Var(var_decl) = decl {
                        for declarator in &var_decl.decls {
                            if let Some(init) = &declarator.init {
                                if let Expr::Call(call_expr) = &**init {
                                    if let Callee::Expr(callee) = &call_expr.callee {
                                        if let Expr::Ident(ident) = &**callee {
                                            if ident.sym.as_ref() == "useErrorHandler" {
                                                builder.add_raw_stmt("错误处理Hook".to_string())?;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                _ => {}
            }
        }
        Ok(())
    }
}
