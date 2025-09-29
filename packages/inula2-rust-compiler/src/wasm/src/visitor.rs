// visitor.rs - 访问者模式实现
use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use std::collections::HashMap;
use swc_ecma_ast::*;

/// 访问者模式的基础 trait
pub trait Visitor {
    fn visit_stmt(&mut self, _stmt: &Stmt, _context: &mut VisitContext) -> CompilerResult<()> {
        Ok(())
    }
    fn visit_expr(&mut self, _expr: &Expr, _context: &mut VisitContext) -> CompilerResult<()> {
        Ok(())
    }
    fn visit_decl(&mut self, _decl: &Decl, _context: &mut VisitContext) -> CompilerResult<()> {
        Ok(())
    }
}

/// 访问上下文
pub struct VisitContext<'a> {
    pub ir_builder: &'a mut IRBuilder<'a>,
    pub bit_manager: &'a mut BitManager,
    pub scope_stack: Vec<ScopeInfo>,
    pub current_function: Option<String>,
    pub reactive_vars: HashMap<String, u32>,
}

/// 作用域信息
#[derive(Debug, Clone)]
pub struct ScopeInfo {
    pub name: String,
    pub scope_type: ScopeType,
    pub variables: HashMap<String, VariableInfo>,
}

/// 作用域类型
#[derive(Debug, Clone)]
pub enum ScopeType {
    Function,
    Block,
    Loop,
    Conditional,
}

/// 变量信息
#[derive(Debug, Clone)]
pub struct VariableInfo {
    pub name: String,
    pub bit_position: u32,
    pub is_reactive: bool,
    pub dependencies: Vec<String>,
}

impl<'a> VisitContext<'a> {
    pub fn new(ir_builder: &'a mut IRBuilder<'a>, bit_manager: &'a mut BitManager) -> Self {
        Self {
            ir_builder,
            bit_manager,
            scope_stack: Vec::new(),
            current_function: None,
            reactive_vars: HashMap::new(),
        }
    }

    /// 进入新的作用域
    pub fn enter_scope(&mut self, name: String, scope_type: ScopeType) {
        self.scope_stack.push(ScopeInfo {
            name,
            scope_type,
            variables: HashMap::new(),
        });
    }

    /// 退出当前作用域
    pub fn exit_scope(&mut self) {
        self.scope_stack.pop();
    }

    /// 添加变量到当前作用域
    pub fn add_variable(&mut self, name: String, is_reactive: bool) -> u32 {
        let bit_position = if is_reactive {
            self.bit_manager.allocate_state_bit(&name)
        } else {
            0
        };

        let var_info = VariableInfo {
            name: name.clone(),
            bit_position,
            is_reactive,
            dependencies: Vec::new(),
        };

        if let Some(current_scope) = self.scope_stack.last_mut() {
            current_scope.variables.insert(name.clone(), var_info);
        }

        if is_reactive {
            self.reactive_vars.insert(name, bit_position);
        }

        bit_position
    }

    /// 查找变量信息
    pub fn find_variable(&self, name: &str) -> Option<&VariableInfo> {
        // 从当前作用域向上查找
        for scope in self.scope_stack.iter().rev() {
            if let Some(var) = scope.variables.get(name) {
                return Some(var);
            }
        }
        None
    }

    /// 设置变量依赖关系
    pub fn set_dependency(&mut self, var_name: &str, dependencies: &[String]) {
        if let Some(var) = self
            .scope_stack
            .last_mut()
            .and_then(|scope| scope.variables.get_mut(var_name))
        {
            var.dependencies = dependencies.to_vec();
        }
        self.bit_manager.set_dependency(var_name, dependencies);
    }
}

/// 访问者调度器 - 负责协调各个访问者
pub struct VisitorDispatcher {
    visitors: Vec<Box<dyn Visitor>>,
}

impl VisitorDispatcher {
    pub fn new() -> Self {
        Self {
            visitors: Vec::new(),
        }
    }

    /// 添加访问者
    pub fn add_visitor(&mut self, visitor: Box<dyn Visitor>) {
        self.visitors.push(visitor);
    }

    /// 访问 AST 节点
    pub fn visit(&mut self, node: &Program, context: &mut VisitContext) -> CompilerResult<()> {
        if let Program::Module(m) = node {
            for item in &m.body {
                if let ModuleItem::Stmt(stmt) = item {
                    self.visit_stmt(stmt, context)?;
                }
            }
        }
        Ok(())
    }

    /// 访问语句
    fn visit_stmt(&mut self, stmt: &Stmt, context: &mut VisitContext) -> CompilerResult<()> {
        for visitor in &mut self.visitors {
            visitor.visit_stmt(stmt, context)?;
        }
        Ok(())
    }

    /// 访问表达式
    fn visit_expr(&mut self, expr: &Expr, context: &mut VisitContext) -> CompilerResult<()> {
        for visitor in &mut self.visitors {
            visitor.visit_expr(expr, context)?;
        }
        Ok(())
    }
}

/// 状态分析访问者
pub struct StateAnalyzer;

impl Visitor for StateAnalyzer {
    fn visit_stmt(&mut self, stmt: &Stmt, context: &mut VisitContext) -> CompilerResult<()> {
        match stmt {
            Stmt::Decl(decl) => {
                if let Decl::Var(var_decl) = decl {
                    for declarator in &var_decl.decls {
                        if self.is_reactive_declaration(declarator) {
                            self.handle_reactive_declaration(declarator, context)?;
                        }
                    }
                }
            }
            Stmt::Expr(expr_stmt) => {
                if let Expr::Assign(assign_expr) = &*expr_stmt.expr {
                    self.handle_state_update(assign_expr, context)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    fn visit_expr(&mut self, expr: &Expr, context: &mut VisitContext) -> CompilerResult<()> {
        match expr {
            Expr::Call(call_expr) => {
                if self.is_use_state_call(call_expr) {
                    self.handle_use_state(call_expr, context)?;
                }
            }
            _ => {}
        }
        Ok(())
    }
}

impl StateAnalyzer {
    /// 检查是否是 useState 调用
    fn is_use_state_call(&self, call_expr: &CallExpr) -> bool {
        if let Callee::Expr(callee_expr) = &call_expr.callee {
            if let Expr::Ident(ident) = callee_expr.as_ref() {
                return ident.sym.to_string() == "useState";
            }
        }
        false
    }

    /// 处理 useState 调用
    fn handle_use_state(
        &self,
        call_expr: &CallExpr,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        // 提取状态变量名
        let var_name = format!("state_{}", context.reactive_vars.len());
        let bit_position = context.add_variable(var_name.clone(), true);

        // 记录状态声明
        context
            .ir_builder
            .add_raw_stmt(format!("useState: {} (bit: {})", var_name, bit_position))?;
        Ok(())
    }

    /// 处理状态更新
    fn handle_state_update(
        &self,
        assign_expr: &AssignExpr,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        // 提取变量名并处理状态更新
        let var_name = match &assign_expr.left {
            AssignTarget::Pat(pat) => match pat {
                AssignTargetPat::Array(_) => "array".to_string(),
                AssignTargetPat::Object(_) => "object".to_string(),
                AssignTargetPat::Invalid(_) => "invalid".to_string(),
            },
            AssignTarget::Simple(expr) => match expr {
                SimpleAssignTarget::Ident(ident) => ident.sym.to_string(),
                _ => "unknown".to_string(),
            },
        };

        // 记录状态更新
        context
            .ir_builder
            .add_raw_stmt(format!("state update: {}", var_name))?;
        Ok(())
    }

    /// 检查是否是响应式声明
    fn is_reactive_declaration(&self, declarator: &VarDeclarator) -> bool {
        // 检查是否有响应式标识符或特殊命名模式
        if let Some(init) = &declarator.init {
            if let Expr::Call(call) = &**init {
                if let Callee::Expr(callee_expr) = &call.callee {
                    if let Expr::Ident(ident) = callee_expr.as_ref() {
                        return ident.sym.to_string() == "useState"
                            || ident.sym.to_string() == "useMemo"
                            || ident.sym.to_string() == "useCallback";
                    }
                }
            }
        }
        false
    }

    /// 处理响应式声明
    fn handle_reactive_declaration(
        &self,
        declarator: &VarDeclarator,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        if let Pat::Ident(ident) = &declarator.name {
            let var_name = ident.sym.to_string();
            let bit_position = context.add_variable(var_name.clone(), true);
            context.ir_builder.add_raw_stmt(format!(
                "reactive declaration: {} (bit: {})",
                var_name, bit_position
            ))?;
        }
        Ok(())
    }
}

/// JSX 分析访问者
pub struct JSXAnalyzer;

impl Visitor for JSXAnalyzer {
    fn visit_expr(&mut self, expr: &Expr, context: &mut VisitContext) -> CompilerResult<()> {
        match expr {
            Expr::JSXElement(jsx_element) => {
                self.analyze_jsx_element(jsx_element, context)?;
            }
            _ => {}
        }
        Ok(())
    }
}

impl JSXAnalyzer {
    /// 分析JSX元素
    fn analyze_jsx_element(
        &self,
        jsx_element: &JSXElement,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        // 分析属性
        for attr in &jsx_element.opening.attrs {
            self.analyze_jsx_attribute(attr, context)?;
        }

        // 分析子元素
        for child in &jsx_element.children {
            self.analyze_jsx_child(child, context)?;
        }

        Ok(())
    }

    fn analyze_jsx_attribute(
        &self,
        attr: &JSXAttrOrSpread,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        match attr {
            JSXAttrOrSpread::JSXAttr(jsx_attr) => {
                self.analyze_event_handler(jsx_attr, context)?;
            }
            JSXAttrOrSpread::SpreadElement(_) => {
                // 处理展开属性
                context
                    .ir_builder
                    .add_raw_stmt("JSX spread attribute".to_string())?;
            }
        }
        Ok(())
    }

    fn analyze_jsx_child(
        &self,
        child: &JSXElementChild,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        match child {
            JSXElementChild::JSXElement(jsx_element) => {
                self.analyze_jsx_element(jsx_element, context)?;
            }
            JSXElementChild::JSXExprContainer(expr_container) => {
                self.analyze_jsx_expression(&expr_container.expr, context)?;
            }
            JSXElementChild::JSXText(_) => {
                // 文本节点不需要特殊处理
            }
            JSXElementChild::JSXFragment(fragment) => {
                for child in &fragment.children {
                    self.analyze_jsx_child(child, context)?;
                }
            }
            JSXElementChild::JSXSpreadChild(_) => {
                // 处理展开子元素
                context
                    .ir_builder
                    .add_raw_stmt("JSX spread child".to_string())?;
            }
        }
        Ok(())
    }

    fn analyze_event_handler(
        &self,
        jsx_attr: &JSXAttr,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        if let JSXAttrName::Ident(ident) = &jsx_attr.name {
            let attr_name = ident.sym.to_string();
            if attr_name.starts_with("on") {
                context
                    .ir_builder
                    .add_raw_stmt(format!("event handler: {}", attr_name))?;
            }
        }
        Ok(())
    }

    /// 分析JSX表达式
    fn analyze_jsx_expression(
        &self,
        expr: &JSXExpr,
        context: &mut VisitContext,
    ) -> CompilerResult<()> {
        match expr {
            JSXExpr::Expr(expr) => {
                // 分析表达式中的依赖
                context
                    .ir_builder
                    .add_raw_stmt("JSX expression analysis".to_string())?;
            }
            JSXExpr::JSXEmptyExpr(_) => {
                // 空表达式
            }
        }
        Ok(())
    }
}
