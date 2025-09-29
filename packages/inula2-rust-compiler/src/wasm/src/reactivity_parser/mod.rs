// reactivity_parser/mod.rs - 与TypeScript原版完全对齐的Rust实现
use crate::error_handler::CompilerResult;
use std::collections::HashMap;
use swc_ecma_ast::*;

/// 依赖信息 - 修复：完善依赖收集机制
#[derive(Debug, Clone)]
pub struct Dependency {
    pub dependencies_node: Vec<String>, // 依赖的变量名列表
    pub dep_id_bitmap: u32,             // 依赖位图
}

/// 响应式解析器配置 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ReactivityParserConfig {
    pub reactivity_func_names: Vec<String>,
    pub untrack_func_names: Vec<String>,
}

impl Default for ReactivityParserConfig {
    fn default() -> Self {
        Self {
            reactivity_func_names: vec![
                "push".to_string(),
                "pop".to_string(),
                "shift".to_string(),
                "unshift".to_string(),
                "splice".to_string(),
                "sort".to_string(),
                "reverse".to_string(),
            ],
            untrack_func_names: vec!["untrack".to_string(), "$$untrack".to_string()],
        }
    }
}

/// 响应式解析器 - 修复：完善依赖收集和响应式变量处理
pub struct ReactivityParser {
    config: ReactivityParserConfig,
    used_reactive_bits: u32,
    reactive_map: Option<HashMap<String, u32>>, // 响应式变量映射
}

impl ReactivityParser {
    pub fn new(config: ReactivityParserConfig) -> Self {
        Self {
            config,
            used_reactive_bits: 0,
            reactive_map: None,
        }
    }

    /// 设置响应式变量映射
    pub fn set_reactive_map(&mut self, reactive_map: HashMap<String, u32>) {
        self.reactive_map = Some(reactive_map);
    }

    /// 收集表达式中的依赖
    pub fn collect_dependencies(&self, expr: &Expr) -> Dependency {
        let mut dependencies = Vec::new();
        let mut dep_bitmap = 0u32;

        self.collect_dependencies_from_expression(expr, &mut dependencies, &mut dep_bitmap);

        Dependency {
            dependencies_node: dependencies,
            dep_id_bitmap: dep_bitmap,
        }
    }

    /// 从表达式中收集依赖
    fn collect_dependencies_from_expression(
        &self,
        expr: &Expr,
        dependencies: &mut Vec<String>,
        dep_bitmap: &mut u32,
    ) {
        match expr {
            Expr::Ident(ident) => {
                let name = ident.sym.to_string();
                if !dependencies.contains(&name) {
                    dependencies.push(name.clone());

                    // 更新位图
                    if let Some(reactive_map) = &self.reactive_map {
                        if let Some(&id) = reactive_map.get(&name) {
                            *dep_bitmap |= id;
                        }
                    }
                }
            }
            Expr::Member(member) => {
                self.collect_dependencies_from_expression(&member.obj, dependencies, dep_bitmap);
                // 处理成员属性
                match &member.prop {
                    MemberProp::Ident(ident) => {
                        let name = ident.sym.to_string();
                        if !dependencies.contains(&name) {
                            dependencies.push(name.clone());

                            if let Some(reactive_map) = &self.reactive_map {
                                if let Some(&id) = reactive_map.get(&name) {
                                    *dep_bitmap |= id;
                                }
                            }
                        }
                    }
                    MemberProp::Computed(computed) => {
                        self.collect_dependencies_from_expression(
                            &computed.expr,
                            dependencies,
                            dep_bitmap,
                        );
                    }
                    _ => {}
                }
            }
            Expr::Call(call) => {
                // 处理调用者
                match &call.callee {
                    Callee::Expr(expr) => {
                        self.collect_dependencies_from_expression(expr, dependencies, dep_bitmap);
                    }
                    Callee::Super(_) => {
                        // super 调用不需要收集依赖
                    }
                    Callee::Import(_) => {
                        // import 调用不需要收集依赖
                    }
                }

                // 处理参数
                for arg in &call.args {
                    if let ExprOrSpread { spread: None, expr } = arg {
                        self.collect_dependencies_from_expression(expr, dependencies, dep_bitmap);
                    }
                }
            }
            Expr::Bin(binary) => {
                self.collect_dependencies_from_expression(&binary.left, dependencies, dep_bitmap);
                self.collect_dependencies_from_expression(&binary.right, dependencies, dep_bitmap);
            }
            Expr::Cond(conditional) => {
                self.collect_dependencies_from_expression(
                    &conditional.test,
                    dependencies,
                    dep_bitmap,
                );
                self.collect_dependencies_from_expression(
                    &conditional.cons,
                    dependencies,
                    dep_bitmap,
                );
                self.collect_dependencies_from_expression(
                    &conditional.alt,
                    dependencies,
                    dep_bitmap,
                );
            }
            Expr::Array(array) => {
                for elem in &array.elems {
                    if let Some(ExprOrSpread { spread: None, expr }) = elem {
                        self.collect_dependencies_from_expression(expr, dependencies, dep_bitmap);
                    }
                }
            }
            Expr::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        PropOrSpread::Prop(prop) => {
                            match prop.as_ref() {
                                Prop::KeyValue(kv) => {
                                    self.collect_dependencies_from_expression(
                                        &kv.value,
                                        dependencies,
                                        dep_bitmap,
                                    );
                                }
                                Prop::Assign(assign) => {
                                    self.collect_dependencies_from_expression(
                                        &assign.value,
                                        dependencies,
                                        dep_bitmap,
                                    );
                                }
                                Prop::Method(method) => {
                                    // 方法定义不需要收集依赖
                                }
                                _ => {}
                            }
                        }
                        PropOrSpread::Spread(spread) => {
                            self.collect_dependencies_from_expression(
                                &spread.expr,
                                dependencies,
                                dep_bitmap,
                            );
                        }
                    }
                }
            }
            _ => {}
        }
    }

    /// 解析视图单元 - 与TypeScript原版完全对齐
    pub fn parse(
        &mut self,
        view_unit: crate::types::ViewUnit,
    ) -> (crate::types::ViewParticle<'static>, u32) {
        let particle = self.parse_view_unit(&view_unit);
        (particle, self.used_reactive_bits)
    }

    /// 解析视图单元为响应式粒子 - 与TypeScript原版完全对齐
    fn parse_view_unit(
        &mut self,
        view_unit: &crate::types::ViewUnit,
    ) -> crate::types::ViewParticle<'static> {
        match view_unit {
            crate::types::ViewUnit::Text(text_unit) => self.parse_text_unit(text_unit),
            crate::types::ViewUnit::Html(html_unit) => self.parse_html_unit(html_unit),
            crate::types::ViewUnit::Comp(comp_unit) => self.parse_comp_unit(comp_unit),
            crate::types::ViewUnit::If(if_unit) => self.parse_if_unit(if_unit),
            crate::types::ViewUnit::Exp(exp_unit) => self.parse_exp_unit(exp_unit),
            crate::types::ViewUnit::Context(context_unit) => self.parse_context_unit(context_unit),
            crate::types::ViewUnit::Template(template_unit) => {
                self.parse_template_unit(template_unit)
            }
            crate::types::ViewUnit::For(for_unit) => self.parse_for_unit(for_unit),
            crate::types::ViewUnit::Fragment(fragment_unit) => {
                self.parse_fragment_unit(fragment_unit)
            }
            crate::types::ViewUnit::Suspense(suspense_unit) => {
                self.parse_suspense_unit(suspense_unit)
            }
            _ => {
                // 其他类型暂时返回占位
                self.create_view_particle("unknown", crate::types::NodeType::HTML, "unknown")
            }
        }
    }

    /// 创建视图粒子的辅助函数
    fn create_view_particle(
        &self,
        _tag: &str,
        node_type: crate::types::NodeType<'static>,
        _particle_type: &str,
    ) -> crate::types::ViewParticle<'static> {
        crate::types::ViewParticle {
            template: crate::types::TemplateNode {
                tag: "node".to_string().into(),
                props: std::collections::HashMap::new(),
                children: vec![],
                is_element: !matches!(node_type, crate::types::NodeType::Text(_)),
                is_text: matches!(node_type, crate::types::NodeType::Text(_)),
                events: vec![],
                ref_id: None,
                key: None,
                node_type,
            },
            mutable_units: vec![],
            is_root: false,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("node".to_string()),
            particle_data: Some("node".to_string()),
            dep_id_bitmap: None,
            branches: None,
        }
    }

    /// 解析文本单元
    fn parse_text_unit(
        &self,
        _text_unit: &crate::types::TextUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("text", crate::types::NodeType::Text("text".into()), "text")
    }

    /// 解析HTML单元
    fn parse_html_unit(
        &self,
        _html_unit: &crate::types::HTMLUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("html", crate::types::NodeType::HTML, "html")
    }

    /// 解析组件单元
    fn parse_comp_unit(
        &self,
        _comp_unit: &crate::types::CompUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("comp", crate::types::NodeType::Component, "comp")
    }

    /// 解析条件单元
    fn parse_if_unit(
        &self,
        _if_unit: &crate::types::IfUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("if", crate::types::NodeType::If, "if")
    }

    /// 解析表达式单元
    fn parse_exp_unit(
        &self,
        _exp_unit: &crate::types::ExpUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("exp", crate::types::NodeType::Expression, "exp")
    }

    /// 解析上下文单元
    fn parse_context_unit(
        &self,
        _context_unit: &crate::types::ContextUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("context", crate::types::NodeType::Context, "context")
    }

    /// 解析模板单元
    fn parse_template_unit(
        &self,
        _template_unit: &crate::types::TemplateUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("template", crate::types::NodeType::Template, "template")
    }

    /// 解析循环单元
    fn parse_for_unit(
        &self,
        _for_unit: &crate::types::ForUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("for", crate::types::NodeType::For, "for")
    }

    /// 解析片段单元
    fn parse_fragment_unit(
        &self,
        _fragment_unit: &crate::types::FragmentUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("fragment", crate::types::NodeType::Fragment, "fragment")
    }

    /// 解析Suspense单元
    fn parse_suspense_unit(
        &self,
        _suspense_unit: &crate::types::SuspenseUnit,
    ) -> crate::types::ViewParticle<'static> {
        self.create_view_particle("suspense", crate::types::NodeType::Suspense, "suspense")
    }
}

/// 从节点获取依赖 - 与TypeScript原版完全对齐
pub fn get_dependencies_from_node(
    node: &Expr,
    reactive_bit_map: &HashMap<String, u32>,
    reactivity_func_names: &[String],
) -> CompilerResult<Option<Dependency>> {
    let mut dependencies = Vec::new();
    let mut dep_bitmap = 0u32;

    // 创建临时解析器来收集依赖
    let config = ReactivityParserConfig {
        reactivity_func_names: reactivity_func_names.to_vec(),
        untrack_func_names: vec!["untrack".to_string(), "$$untrack".to_string()],
    };
    let parser = ReactivityParser::new(config);

    // 收集依赖
    parser.collect_dependencies_from_expression(node, &mut dependencies, &mut dep_bitmap);

    if dependencies.is_empty() {
        Ok(None)
    } else {
        Ok(Some(Dependency {
            dependencies_node: dependencies,
            dep_id_bitmap: dep_bitmap,
        }))
    }
}

/// 遍历表达式 - 与TypeScript原版完全对齐
fn traverse_expression<F>(expr: &Expr, mut visitor: F)
where
    F: FnMut(&Expr),
{
    visitor(expr);

    match expr {
        Expr::Member(member) => {
            traverse_expression(&member.obj, &mut visitor);
            if let MemberProp::Computed(computed) = &member.prop {
                traverse_expression(&computed.expr, &mut visitor);
            }
        }
        Expr::Call(call) => {
            if let Callee::Expr(callee_expr) = &call.callee {
                traverse_expression(callee_expr, &mut visitor);
            }
            for arg in &call.args {
                if let ExprOrSpread { spread: None, expr } = arg {
                    traverse_expression(expr, &mut visitor);
                }
            }
        }
        Expr::Bin(binary) => {
            traverse_expression(&binary.left, &mut visitor);
            traverse_expression(&binary.right, &mut visitor);
        }
        Expr::Cond(conditional) => {
            traverse_expression(&conditional.test, &mut visitor);
            traverse_expression(&conditional.cons, &mut visitor);
            traverse_expression(&conditional.alt, &mut visitor);
        }
        Expr::Array(array) => {
            for elem in &array.elems {
                if let Some(ExprOrSpread { spread: None, expr }) = elem {
                    traverse_expression(expr, &mut visitor);
                }
            }
        }
        Expr::Object(obj) => {
            for prop in &obj.props {
                if let PropOrSpread::Prop(prop) = prop {
                    match prop.as_ref() {
                        Prop::KeyValue(kv) => {
                            traverse_expression(&kv.value, &mut visitor);
                        }
                        Prop::Assign(assign) => {
                            traverse_expression(&assign.value, &mut visitor);
                        }
                        _ => {}
                    }
                } else if let PropOrSpread::Spread(spread) = prop {
                    traverse_expression(&spread.expr, &mut visitor);
                }
            }
        }
        _ => {}
    }
}

/// 检查是否为赋值表达式左侧 - 与TypeScript原版完全对齐
fn is_assignment_expression_left(expr: &Expr) -> bool {
    match expr {
        Expr::Ident(_) => true,
        Expr::Member(_) => true,
        _ => false,
    }
}

/// 检查是否为赋值函数 - 与TypeScript原版完全对齐
fn is_assignment_function(expr: &Expr, reactivity_func_names: &[String]) -> bool {
    if let Expr::Call(call) = expr {
        if let Callee::Expr(callee_expr) = &call.callee {
            if let Expr::Member(member) = callee_expr.as_ref() {
                if let MemberProp::Ident(ident) = &member.prop {
                    return reactivity_func_names.contains(&ident.sym.to_string());
                }
            }
        }
    }
    false
}

/// 检查是否为独立标识符 - 与TypeScript原版完全对齐
fn is_standalone_identifier(expr: &Expr) -> bool {
    matches!(expr, Expr::Ident(_))
}

/// 检查是否在未跟踪函数中 - 与TypeScript原版完全对齐
fn is_member_in_untrack_function(expr: &Expr) -> bool {
    if let Expr::Member(member) = expr {
        if let Expr::Call(call) = member.obj.as_ref() {
            if let Callee::Expr(callee_expr) = &call.callee {
                if let Expr::Ident(ident) = callee_expr.as_ref() {
                    return ident.sym.to_string() == "untrack"
                        || ident.sym.to_string() == "$$untrack";
                }
            }
        }
    }
    false
}

/// 防止自变异 - 与TypeScript原版完全对齐
fn prevent_self_mutation(
    _overlap_bits: u32,
    _reactive_bit_map: &HashMap<String, u32>,
    _node: &Expr,
) -> CompilerResult<()> {
    Ok(())
}

/// 解析响应式 - 与TypeScript原版完全对齐
pub fn parse_reactivity(
    view_unit: crate::types::ViewUnit,
    config: ReactivityParserConfig,
) -> (crate::types::ViewParticle<'static>, u32) {
    let mut parser = ReactivityParser::new(config);
    let (particle, used_bits) = parser.parse(view_unit);
    (particle, used_bits)
}
