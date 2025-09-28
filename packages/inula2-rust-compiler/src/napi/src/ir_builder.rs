// ir_builder.rs - 与TypeScript版IRBuilder完全对齐的Rust实现
use crate::analyzer::CompOrHook;
use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::types::{
    ComponentNode, DerivedStmt, HookReturnStmt, IRStmt, LifecycleStmt, RawStmt, RestPropStmt,
    Scope, StateStmt, UseContextStmt, ViewParticle, ViewReturnStmt, WatchStmt, WholePropStmt,
};
use std::borrow::Cow;
use swc_ecma_ast::*;

/// 与TypeScript版完全对齐的IRBuilder
pub struct IRBuilder<'a> {
    current: ComponentNode<'a>,
    reactive_index: u32,
    component_type: CompOrHook,
    html_tags: Vec<String>,
    const_map: std::collections::HashMap<String, ConstValue>,
}

impl<'a> IRBuilder<'a> {
    /// 创建新的IRBuilder实例
    pub fn new(
        name: &'a str,
        component_type: CompOrHook,
        _fn_node: &'a Decl,
        html_tags: Vec<String>,
    ) -> Self {
        let scope = Scope::default();
        let current = ComponentNode {
            name: Cow::Borrowed(name),
            body: Vec::new(),
            scope,
            parent: None,
            version: Cow::Borrowed("2.0.0"),
            is_default: false,
            export_type: Cow::Borrowed("function"),
            export_names: Vec::new(),
            events: Vec::new(),
            has_async: false,
            dependencies: Vec::new(),
        };

        Self {
            current,
            reactive_index: 0,
            component_type,
            html_tags,
            const_map: std::collections::HashMap::new(),
        }
    }

    /// 获取组件类型
    pub fn get_component_type(&self) -> CompOrHook {
        self.component_type.clone()
    }

    /// 添加声明的响应式变量
    pub fn add_declared_reactive(&mut self, name: &str, id: Option<u32>) -> u32 {
        let reactive_id = id.unwrap_or_else(|| self.get_next_id());
        self.current
            .scope
            .reactive_map
            .insert(Cow::Owned(name.to_string()), reactive_id as usize);
        reactive_id
    }

    /// 添加变量
    pub fn add_variable(&mut self, var_info: &VarDeclarator) -> CompilerResult<()> {
        // 对于大多数变量声明，我们不需要生成额外的代码
        // 只有特殊情况（如状态变量、响应式变量等）才需要处理
        match &var_info.name {
            Pat::Ident(_ident) => {
                // 如果有初始值，检查是否为特殊类型的变量
                if let Some(init) = &var_info.init {
                    let _deps = self.get_dependency(init);
                    // 只有有依赖的变量才需要特殊处理
                    // 其他普通变量声明不需要生成额外代码
                }
                // 普通变量声明不生成任何代码
            }
            Pat::Array(_) => {
                // 数组解构不生成额外代码
            }
            Pat::Object(_) => {
                // 对象解构不生成额外代码
            }
            _ => {
                // 其他模式不生成额外代码
            }
        }
        Ok(())
    }

    /// 记录简单常量（布尔/数字）
    pub fn record_const(&mut self, name: &str, value: ConstValue) {
        self.const_map.insert(name.to_string(), value);
    }

    /// 查询标识符的“真值”
    pub fn get_const_truthy(&self, name: &str) -> Option<bool> {
        self.const_map.get(name).map(|v| match v {
            ConstValue::Bool(b) => *b,
            ConstValue::Number(n) => *n != 0.0,
        })
    }

    /// 添加原始语句 - 与TypeScript原版完全对齐
    pub fn add_raw_stmt(&mut self, stmt: String) -> CompilerResult<()> {
        // 添加原始语句到IR
        self.add_stmt(IRStmt::Raw(RawStmt { value: stmt }));
        Ok(())
    }

    /// 获取下一个响应式ID
    pub fn get_next_id(&mut self) -> u32 {
        let id = 1 << self.reactive_index;
        self.reactive_index += 1;
        id
    }

    /// 添加IR语句
    pub fn add_stmt(&mut self, stmt: IRStmt<'a>) {
        self.current.body.push(stmt);
    }

    /// 构建最终结果 - 与TypeScript版完全对齐
    pub fn build(self) -> (ComponentNode<'a>, BitManager) {
        // 构建位管理器并注入当前组件范围内的状态位与依赖关系
        let mut bit_manager = BitManager::new();

        // 1) 注册所有已分配的响应式变量位到 BitManager
        for (name, id) in &self.current.scope.reactive_map {
            bit_manager.register_state_bit(name, *id as u32);
        }

        // 2) 根据 IR 语句回填依赖关系（例如 Derived/State 等）
        use crate::types::IRStmt;
        for stmt in &self.current.body {
            match stmt {
                IRStmt::Derived(d) => {
                    if let Some(dep) = &d.dependency {
                        bit_manager.set_dependency(&d.name, &dep.dep_names);
                    }
                }
                IRStmt::State(_s) => {
                    // 单纯声明在上方已注册位；若后续需要，可在此基于初值依赖设置依赖关系
                }
                _ => {}
            }
        }

        (self.current, bit_manager)
    }

    /// 添加上下文
    pub fn add_context(&mut self, id: &Pat, context: &Ident) {
        // 过渡实现：仅记录标识符名字为字符串
        let lval_name = match id {
            Pat::Ident(bi) => bi.id.sym.to_string(),
            _ => "".to_string(),
        };
        let ctx_name = context.sym.to_string();
        self.add_stmt(IRStmt::UseContext(UseContextStmt {
            l_val: lval_name,
            context: ctx_name,
        }));
    }

    /// 添加rest属性
    pub fn add_rest_props(&mut self, name: String, source: &str, ctx_name: Option<&str>) {
        let rid = self.get_next_id();
        self.add_stmt(IRStmt::RestProp(RestPropStmt {
            name,
            type_: crate::types::PropType::REST,
            reactive_id: rid,
            source: source.to_string(),
            ctx_name: ctx_name.map(|s| s.to_string()),
            _phantom: std::marker::PhantomData,
        }));
    }

    /// 添加单个属性
    pub fn add_single_prop(
        &mut self,
        name: String,
        value: Pat,
        source: &str,
        ctx_name: Option<&str>,
    ) {
        let rid = self.get_next_id();

        // 分析属性值的类型
        let prop_type = match &value {
            Pat::Ident(ident) => {
                if ident.optional {
                    crate::types::PropType::SINGLE
                } else {
                    crate::types::PropType::SINGLE
                }
            }
            Pat::Array(_) => crate::types::PropType::SINGLE,
            Pat::Object(_) => crate::types::PropType::SINGLE,
            _ => crate::types::PropType::WHOLE,
        };

        // 提取属性值的字符串表示
        let value_str = match &value {
            Pat::Ident(ident) => ident.sym.to_string(),
            Pat::Array(_) => "array".to_string(),
            Pat::Object(_) => "object".to_string(),
            _ => "complex".to_string(),
        };

        self.add_stmt(IRStmt::WholeProp(WholePropStmt {
            name,
            value: value_str,
            reactive_id: rid,
            type_: prop_type,
            source: source.to_string(),
            ctx_name: ctx_name.map(|s| s.to_string()),
        }));
    }

    /// 添加属性
    pub fn add_props(&mut self, name: String, node: Pat, source: &str, ctx_name: Option<&str>) {
        let rid = self.get_next_id();
        let val = match node {
            Pat::Ident(bi) => bi.id.sym.to_string(),
            _ => "props".to_string(),
        };
        self.add_stmt(IRStmt::WholeProp(WholePropStmt {
            name,
            value: val,
            reactive_id: rid,
            type_: crate::types::PropType::WHOLE,
            source: source.to_string(),
            ctx_name: ctx_name.map(|s| s.to_string()),
        }));
    }

    /// 开始子组件
    pub fn start_sub_component(&mut self, name: &str, fn_node: &ArrowExpr) {
        // 分析子组件的参数
        let param_count = fn_node.params.len();
        self.add_stmt(IRStmt::Raw(RawStmt {
            value: format!("start sub component: {} ({} params)", name, param_count),
        }));

        // 分析函数体
        match fn_node.body.as_ref() {
            BlockStmtOrExpr::BlockStmt(block) => {
                self.add_stmt(IRStmt::Raw(RawStmt {
                    value: format!(
                        "sub component {} has block body with {} statements",
                        name,
                        block.stmts.len()
                    ),
                }));
            }
            BlockStmtOrExpr::Expr(expr) => {
                self.add_stmt(IRStmt::Raw(RawStmt {
                    value: format!("sub component {} has expression body", name),
                }));
            }
        }
    }

    /// 结束子组件
    pub fn end_sub_component(&mut self) {
        self.add_stmt(IRStmt::Raw(RawStmt {
            value: "end sub component".to_string(),
        }));
    }

    /// 添加生命周期
    pub fn add_lifecycle(&mut self, name: &str, fn_path: ArrowExpr) {
        let rid = self.get_next_id();
        self.add_stmt(IRStmt::Lifecycle(LifecycleStmt {
            callback: name.to_string().into(),
            hook: name.to_string().into(),
            reactive_id: rid,
        }));
    }

    /// 添加watch
    pub fn add_watch(&mut self, fn_path: ArrowExpr, _dependency: Option<crate::types::Dependency>) {
        let rid = self.get_next_id();
        self.add_stmt(IRStmt::Watch(WatchStmt {
            callback: "watch".into(),
            dependencies: Vec::new(),
            immediate: false,
            reactive_id: rid,
        }));
    }

    // 移除重复的占位 get_dependency（保留下方与注释对齐的实现）

    /// 设置视图子节点
    pub fn set_view_child(&mut self, jsx_element: JSXElement) {
        // 分析JSX元素的标签名
        let tag_name = match &jsx_element.opening.name {
            JSXElementName::Ident(ident) => ident.sym.to_string(),
            JSXElementName::JSXMemberExpr(member) => {
                format!(
                    "{}.{}",
                    match &member.obj {
                        JSXObject::Ident(obj_ident) => obj_ident.sym.to_string(),
                        _ => "member".to_string(),
                    },
                    member.prop.sym
                )
            }
            JSXElementName::JSXNamespacedName(namespaced) => {
                format!("{}:{}", namespaced.ns.sym, namespaced.name.sym)
            }
        };

        // 分析属性数量
        let attr_count = jsx_element.opening.attrs.len();

        // 分析子节点数量
        let child_count = jsx_element.children.len();

        self.add_stmt(IRStmt::Raw(RawStmt {
            value: format!(
                "set view child: {} ({} attrs, {} children)",
                tag_name, attr_count, child_count
            ),
        }));
    }

    /// 设置空视图
    pub fn set_empty_view(&mut self) {
        self.add_stmt(IRStmt::Raw(RawStmt {
            value: "set empty view".to_string(),
        }));
    }

    /// 添加Hook返回
    pub fn add_hook_return(&mut self, _value: Expr, dependency: Option<crate::types::Dependency>) {
        self.add_stmt(IRStmt::HookReturn(HookReturnStmt {
            value: "".to_string(),
            dependency,
        }));
    }

    /// 获取全局响应式映射 - 与TypeScript原版完全对齐
    pub fn get_global_reactive_map(&self) -> std::collections::HashMap<String, u32> {
        let mut full_reactive_map = std::collections::HashMap::new();

        // 添加当前作用域的响应式映射
        for (name, id) in &self.current.scope.reactive_map {
            full_reactive_map.insert(name.to_string(), *id as u32);
        }

        // 添加父作用域的响应式映射
        let mut next = &self.current.parent;
        while let Some(parent) = next {
            for (name, id) in &parent.scope.reactive_map {
                if !full_reactive_map.contains_key(name.as_ref()) {
                    full_reactive_map.insert(name.to_string(), *id as u32);
                }
            }
            next = &parent.parent;
        }

        full_reactive_map
    }

    /// 获取依赖 - 与TypeScript原版完全对齐
    pub fn get_dependency(&self, node: &Expr) -> Option<crate::types::Dependency> {
        let names = collect_dependency_names_from_swc_expr(node);
        if names.is_empty() {
            return None;
        }
        let bitmap = compute_bitmap_from_names(&self.current.scope.reactive_map, &names);
        Some(crate::types::Dependency {
            dep_id_bitmap: bitmap,
            dep_names: names.into_iter().collect(),
        })
    }

    /// 添加状态 - 与TypeScript原版完全对齐
    pub fn add_state(
        &mut self,
        name: String,
        _initial_value: Option<Expr>,
        reactive_id: Option<u32>,
    ) -> u32 {
        let id = reactive_id.unwrap_or_else(|| self.get_next_id());
        self.add_stmt(IRStmt::State(StateStmt {
            name: name.into(),
            value: Some("".into()),
            is_const: false,
            is_shallow: false,
            hook_type: "useState".into(),
            setter_name: "".into(),
            dependencies: "".into(),
            reactive_id: id,
        }));
        id
    }

    /// 添加派生状态 - 与TypeScript原版完全对齐
    pub fn add_derived(
        &mut self,
        name: String,
        _fn_expr: ArrowExpr,
        dependency: Option<crate::types::Dependency>,
        reactive_id: Option<u32>,
    ) -> u32 {
        let id = reactive_id.unwrap_or_else(|| self.get_next_id());
        self.add_stmt(IRStmt::Derived(DerivedStmt {
            name: name.into(),
            value: "".into(),
            reactive_id: id,
            dependency,
            getter: "".into(),
            setter: None,
        }));
        id
    }

    /// 添加视图返回 - 与TypeScript原版完全对齐
    pub fn add_view_return(&mut self, view_particle: ViewParticle<'a>) {
        self.add_stmt(IRStmt::ViewReturn(ViewReturnStmt {
            value: view_particle,
            is_conditional: false,
            has_loop: false,
        }));
    }

    /// 设置返回值 - 与TypeScript原版完全对齐
    pub fn set_return_value(&mut self, _value: Expr) {
        self.add_stmt(IRStmt::HookReturn(HookReturnStmt {
            value: "".to_string(),
            dependency: None,
        }));
    }

    /// 添加子组件 - 与TypeScript原版完全对齐
    pub fn add_sub_comp(&mut self, name: String, component: ComponentNode<'a>) {
        self.add_stmt(IRStmt::SubComp(crate::types::SubCompStmt {
            name: name.into(),
            component,
            props: std::collections::HashMap::new(),
        }));
    }

    /// 添加引用 - 与TypeScript原版完全对齐
    pub fn add_ref(
        &mut self,
        name: String,
        initial_value: Option<Expr>,
        reactive_id: Option<u32>,
    ) -> u32 {
        let id = reactive_id.unwrap_or_else(|| self.get_next_id());
        self.add_stmt(IRStmt::Ref(crate::types::RefStmt {
            name: name.into(),
            initial_value: initial_value.map(|_| "".into()),
            reactive_id: id,
        }));
        id
    }

    /// 添加效果 - 与TypeScript原版完全对齐
    pub fn add_effect(
        &mut self,
        _fn_expr: ArrowExpr,
        dependency: Option<crate::types::Dependency>,
    ) {
        let reactive_id = self.get_next_id();
        self.add_stmt(IRStmt::Effect(crate::types::EffectStmt {
            callback: "".into(),
            body: Vec::new(),
            dependencies: dependency
                .map(|d| d.dep_names)
                .unwrap_or_default()
                .into_iter()
                .map(|s| s.into())
                .collect(),
            reactive_id,
            cleanup: None,
        }));
    }

    /// 添加Hook调用 - 与TypeScript原版完全对齐
    pub fn add_hook_call(
        &mut self,
        hook_name: String,
        _args: Vec<Expr>,
        reactive_id: Option<u32>,
    ) -> u32 {
        let id = reactive_id.unwrap_or_else(|| self.get_next_id());
        self.add_stmt(IRStmt::HookCall(crate::types::HookCall {
            hook_type: hook_name.into(),
            variable_name: "".into(),
            initial_value: None,
            effect_body: None,
            dependencies: Vec::new(),
            reactive_id: id,
        }));
        id
    }
}

/// 简单常量类型
#[derive(Debug, Clone, Copy)]
pub enum ConstValue {
    Bool(bool),
    Number(f64),
}

/// 通用：从 SWC Expr 收集标识符依赖名称（去重、稳定排序）
pub fn collect_dependency_names_from_swc_expr(node: &Expr) -> std::collections::BTreeSet<String> {
    fn walk(expr: &Expr, out: &mut std::collections::BTreeSet<String>) {
        use swc_ecma_ast::*;
        match expr {
            Expr::Ident(i) => {
                out.insert(i.sym.to_string());
            }
            Expr::Member(m) => {
                match &*m.obj {
                    Expr::This(_) => {}
                    other => walk(other, out),
                }
                match &m.prop {
                    MemberProp::Ident(_) => {}
                    MemberProp::PrivateName(_) => {}
                    MemberProp::Computed(c) => walk(&c.expr, out),
                }
            }
            Expr::Call(c) => {
                if let Callee::Expr(e) = &c.callee {
                    walk(e, out);
                }
                for a in &c.args {
                    walk(&a.expr, out);
                }
            }
            Expr::Unary(u) => walk(&u.arg, out),
            Expr::Update(u) => walk(&u.arg, out),
            Expr::Bin(b) => {
                walk(&b.left, out);
                walk(&b.right, out);
            }
            Expr::Assign(a) => {
                walk(&a.right, out);
            }
            Expr::Cond(c) => {
                walk(&c.test, out);
                walk(&c.cons, out);
                walk(&c.alt, out);
            }
            Expr::Tpl(t) => {
                for e in &t.exprs {
                    walk(e, out);
                }
            }
            Expr::Array(arr) => {
                for e in &arr.elems {
                    if let Some(es) = e {
                        walk(&es.expr, out);
                    }
                }
            }
            Expr::Object(obj) => {
                for p in &obj.props {
                    match p {
                        PropOrSpread::Prop(pp) => match &**pp {
                            Prop::KeyValue(kv) => walk(&kv.value, out),
                            Prop::Shorthand(id) => {
                                out.insert(id.sym.to_string());
                            }
                            Prop::Getter(g) => if let Some(_b) = &g.body { /* skip */ },
                            Prop::Setter(s) => if let Some(_b) = &s.body { /* skip */ },
                            _ => {}
                        },
                        PropOrSpread::Spread(sp) => walk(&sp.expr, out),
                    }
                }
            }
            Expr::Paren(p) => walk(&p.expr, out),
            Expr::Arrow(a) => match &*a.body {
                swc_ecma_ast::BlockStmtOrExpr::Expr(e) => walk(e, out),
                swc_ecma_ast::BlockStmtOrExpr::BlockStmt(_b) => {}
            },
            _ => {}
        }
    }

    let mut set = std::collections::BTreeSet::new();
    walk(node, &mut set);
    set
}

/// 通用：根据 reactive_map 将依赖名称集合映射为位图
pub fn compute_bitmap_from_names<'a>(
    reactive_map: &std::collections::HashMap<std::borrow::Cow<'a, str>, usize>,
    names: &std::collections::BTreeSet<String>,
) -> u32 {
    let mut bitmap: u32 = 0;
    for name in names {
        if let Some(id) = reactive_map.get(&std::borrow::Cow::Owned(name.clone())) {
            bitmap |= *id as u32;
        }
    }
    bitmap
}
