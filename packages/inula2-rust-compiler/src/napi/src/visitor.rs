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

impl Visitor for StateAnalyzer {}

impl StateAnalyzer {
    /// 检查是否是 useState 调用
    fn is_use_state_call(&self, _call_expr: &CallExpr) -> bool {
        false
    }

    /// 处理 useState 调用
    fn handle_use_state(
        &self,
        _call_expr: &CallExpr,
        _context: &mut VisitContext,
    ) -> CompilerResult<()> {
        // 提取状态变量名
        // SWC 未在节点上保存 parent；此处简化为跳过
        Ok(())
    }

    /// 处理状态更新
    fn handle_state_update(
        &self,
        _assign_expr: &AssignExpr,
        _context: &mut VisitContext,
    ) -> CompilerResult<()> {
        // 提取变量名并处理状态更新
        let var_name = "unknown".to_string();

        // 记录状态更新
        _context
            .ir_builder
            .add_raw_stmt(format!("state update: {}", var_name))?;
        Ok(())
    }

    /// 检查是否是响应式声明
    fn is_reactive_declaration(&self, _declarator: &VarDeclarator) -> bool {
        false
    }
}

/// JSX 分析访问者
pub struct JSXAnalyzer;

impl Visitor for JSXAnalyzer {}

impl JSXAnalyzer {
    fn analyze_jsx_attribute(
        &self,
        _attr: &JSXAttrOrSpread,
        _context: &mut VisitContext,
    ) -> CompilerResult<()> {
        Ok(())
    }

    fn analyze_jsx_child(
        &self,
        _child: &JSXElementChild,
        _context: &mut VisitContext,
    ) -> CompilerResult<()> {
        Ok(())
    }

    fn analyze_event_handler(
        &self,
        _jsx_attr: &JSXAttr,
        _context: &mut VisitContext,
    ) -> CompilerResult<()> {
        Ok(())
    }
}
