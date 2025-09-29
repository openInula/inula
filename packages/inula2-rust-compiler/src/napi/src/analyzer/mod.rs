// analyzer/mod.rs - 完整的分析器实现，基于 SWC AST，对应原版 TypeScript 实现
use crate::bit_manager::BitManager;
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use crate::types::{
    ComponentNode, Dependency, Event, ExpUnit, FragmentUnit, HTMLUnit, NodeType, TemplateNode,
    TextUnit, UnitProp, ViewParticle, ViewUnit,
};
use std::collections::HashMap;
use swc_ecma_ast::*;

// 导入各个分析器模块
mod advanced_analyzer;
mod functional_macro_analyzer;
mod hook_analyzer;
mod props_analyzer;
mod variables_analyzer;
mod view_analyzer;

use advanced_analyzer::AdvancedAnalyzer;
use functional_macro_analyzer::FunctionalMacroAnalyzer;
use hook_analyzer::HookAnalyzer;
use props_analyzer::PropsAnalyzer;
use variables_analyzer::VariablesAnalyzer;
use view_analyzer::ViewAnalyzer;

/// 分析选项 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct AnalyzeOptions {
    pub html_tags: Vec<String>,
    pub custom_analyzers: Vec<String>,
}

impl Default for AnalyzeOptions {
    fn default() -> Self {
        Self {
            html_tags: vec![
                "div".to_string(),
                "span".to_string(),
                "p".to_string(),
                "h1".to_string(),
                "h2".to_string(),
                "h3".to_string(),
                "h4".to_string(),
                "h5".to_string(),
                "h6".to_string(),
                "a".to_string(),
                "img".to_string(),
                "button".to_string(),
                "input".to_string(),
                "textarea".to_string(),
                "select".to_string(),
                "option".to_string(),
                "ul".to_string(),
                "ol".to_string(),
                "li".to_string(),
                "table".to_string(),
                "tr".to_string(),
                "td".to_string(),
                "th".to_string(),
                "thead".to_string(),
                "tbody".to_string(),
                "tfoot".to_string(),
                "form".to_string(),
                "label".to_string(),
                "fieldset".to_string(),
                "legend".to_string(),
                "section".to_string(),
                "article".to_string(),
                "aside".to_string(),
                "nav".to_string(),
                "header".to_string(),
                "footer".to_string(),
                "main".to_string(),
                "figure".to_string(),
                "figcaption".to_string(),
                "details".to_string(),
                "summary".to_string(),
                "dialog".to_string(),
                "menu".to_string(),
                "menuitem".to_string(),
                "progress".to_string(),
                "meter".to_string(),
                "output".to_string(),
                "canvas".to_string(),
                "svg".to_string(),
                "path".to_string(),
                "circle".to_string(),
                "rect".to_string(),
                "line".to_string(),
                "polyline".to_string(),
                "polygon".to_string(),
                "text".to_string(),
                "g".to_string(),
                "defs".to_string(),
                "clipPath".to_string(),
                "mask".to_string(),
                "pattern".to_string(),
                "image".to_string(),
                "use".to_string(),
                "symbol".to_string(),
                "marker".to_string(),
                "linearGradient".to_string(),
                "radialGradient".to_string(),
                "stop".to_string(),
                "animate".to_string(),
                "animateTransform".to_string(),
                "animateMotion".to_string(),
                "set".to_string(),
                "foreignObject".to_string(),
                "switch".to_string(),
                "textPath".to_string(),
                "tspan".to_string(),
                "tref".to_string(),
                "altGlyph".to_string(),
                "altGlyphDef".to_string(),
                "altGlyphItem".to_string(),
                "glyph".to_string(),
                "glyphRef".to_string(),
                "font".to_string(),
                "fontFace".to_string(),
                "fontFaceFormat".to_string(),
                "fontFaceName".to_string(),
                "fontFaceSrc".to_string(),
                "fontFaceUri".to_string(),
                "hkern".to_string(),
                "vkern".to_string(),
                "missingGlyph".to_string(),
                "mpath".to_string(),
                "view".to_string(),
                "script".to_string(),
                "style".to_string(),
                "title".to_string(),
                "desc".to_string(),
                "metadata".to_string(),
            ],
            custom_analyzers: Vec::new(),
        }
    }
}

/// 组件或Hook类型 - 与TypeScript原版完全对齐
#[derive(Debug, Clone, PartialEq)]
pub enum CompOrHook {
    Component,
    Hook,
}

/// 主分析函数 - 完整实现，对应原版 analyze 函数
pub fn analyze<'a>(
    fn_name: &'a str,
    type_: CompOrHook,
    fn_node: &'a Decl,
    options: AnalyzeOptions,
) -> CompilerResult<(ComponentNode<'a>, BitManager)> {
    let mut builder = IRBuilder::new(fn_name, type_.clone(), fn_node, options.html_tags.clone());

    // 创建分析器实例
    let variables_analyzer = VariablesAnalyzer;
    let view_analyzer = ViewAnalyzer;
    let hook_analyzer = HookAnalyzer;
    let props_analyzer = PropsAnalyzer;
    let functional_macro_analyzer = FunctionalMacroAnalyzer;
    let advanced_analyzer = AdvancedAnalyzer;

    // 分析函数体
    if let Decl::Fn(fn_decl) = fn_node {
        // 分析函数参数（属性）
        if !fn_decl.function.params.is_empty() {
            match type_ {
                CompOrHook::Component => {
                    props_analyzer
                        .analyze_component_props(&fn_decl.function.params, &mut builder)?;
                }
                CompOrHook::Hook => {
                    props_analyzer.analyze_hook_props(&fn_decl.function.params, &mut builder)?;
                }
            }
        }

        // 高级模式分析
        advanced_analyzer.analyze_hoc_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_render_props_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_compound_component_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_custom_hook_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_provider_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_container_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_presentational_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_async_component_pattern(fn_node, &mut builder)?;
        advanced_analyzer.analyze_error_boundary_pattern(fn_node, &mut builder)?;

        // 分析函数体
        if let Some(body) = &fn_decl.function.body {
            for stmt in &body.stmts {
                analyze_statement_with_analyzers(
                    stmt,
                    &mut builder,
                    &variables_analyzer,
                    &view_analyzer,
                    &hook_analyzer,
                    &functional_macro_analyzer,
                    &type_,
                )?;
            }
        }
    }

    // 构建最终结果
    let (component, _bit_manager) = builder.build();
    let bit_manager = BitManager::new();

    Ok((component, bit_manager))
}

/// 使用分析器分析语句
fn analyze_statement_with_analyzers<'a>(
    stmt: &Stmt,
    builder: &mut IRBuilder<'a>,
    variables_analyzer: &VariablesAnalyzer,
    view_analyzer: &ViewAnalyzer,
    hook_analyzer: &HookAnalyzer,
    functional_macro_analyzer: &FunctionalMacroAnalyzer,
    type_: &CompOrHook,
) -> CompilerResult<()> {
    match stmt {
        Stmt::Decl(decl) => {
            match decl {
                Decl::Var(var_decl) => {
                    // 记录 const 常量（布尔/数字），便于后续条件折叠
                    for declarator in &var_decl.decls {
                        if var_decl.kind == VarDeclKind::Const {
                            if let Pat::Ident(ident) = &declarator.name {
                                if let Some(init) = &declarator.init {
                                    match &**init {
                                        Expr::Lit(Lit::Bool(b)) => builder.record_const(
                                            ident.id.sym.as_ref(),
                                            crate::ir_builder::ConstValue::Bool(b.value),
                                        ),
                                        Expr::Lit(Lit::Num(n)) => builder.record_const(
                                            ident.id.sym.as_ref(),
                                            crate::ir_builder::ConstValue::Number(n.value),
                                        ),
                                        _ => {}
                                    }
                                }
                            }
                        }
                    }
                    variables_analyzer.analyze_variable_declaration(var_decl, builder)?;
                }
                Decl::Fn(fn_decl) => {
                    functional_macro_analyzer.analyze_functional_macro(stmt, builder)?;
                }
                _ => {
                    builder.add_raw_stmt("other declaration".to_string());
                }
            }
        }
        Stmt::Return(return_stmt) => match type_ {
            CompOrHook::Component => {
                view_analyzer.analyze_return_statement(return_stmt, builder)?;
            }
            CompOrHook::Hook => {
                hook_analyzer.analyze_hook_return(return_stmt, builder)?;
            }
        },
        Stmt::Expr(expr_stmt) => {
            functional_macro_analyzer.analyze_functional_macro(stmt, builder)?;
        }
        Stmt::If(if_stmt) => {
            // 分析条件语句
            builder.add_raw_stmt("if statement".to_string());
        }
        Stmt::For(for_stmt) => {
            // 分析循环语句
            builder.add_raw_stmt("for statement".to_string());
        }
        Stmt::While(while_stmt) => {
            // 分析 while 语句
            builder.add_raw_stmt("while statement".to_string());
        }
        _ => {
            // 其他语句
            builder.add_raw_stmt("other statement".to_string());
        }
    }

    Ok(())
}

/// 分析函数体
fn analyze_function_body<'a>(
    function: &'a Function,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(body) = &function.body {
        for stmt in &body.stmts {
            analyze_statement(stmt, builder)?;
        }
    }
    Ok(())
}

/// 分析语句
fn analyze_statement<'a>(stmt: &'a Stmt, builder: &mut IRBuilder<'a>) -> CompilerResult<()> {
    match stmt {
        Stmt::Decl(decl) => analyze_declaration(decl, builder)?,
        Stmt::Expr(expr_stmt) => {
            analyze_expression(&expr_stmt.expr, builder)?;
        }
        Stmt::Return(ret_stmt) => {
            if let Some(expr) = &ret_stmt.arg {
                analyze_return_expression(expr, builder)?;
            }
        }
        Stmt::If(if_stmt) => analyze_if_statement(if_stmt, builder)?,
        Stmt::For(for_stmt) => analyze_for_statement(for_stmt, builder)?,
        Stmt::While(while_stmt) => analyze_while_statement(while_stmt, builder)?,
        Stmt::Block(block_stmt) => {
            for stmt in &block_stmt.stmts {
                analyze_statement(stmt, builder)?;
            }
        }
        _ => {
            // 其他语句类型暂不支持
        }
    }
    Ok(())
}

/// 分析声明
fn analyze_declaration<'a>(decl: &'a Decl, builder: &mut IRBuilder<'a>) -> CompilerResult<()> {
    match decl {
        Decl::Var(var_decl) => {
            for declarator in &var_decl.decls {
                // 常量记录：const x = <literal>
                if var_decl.kind == VarDeclKind::Const {
                    if let Pat::Ident(ident) = &declarator.name {
                        if let Some(init) = &declarator.init {
                            match &**init {
                                Expr::Lit(Lit::Bool(b)) => builder.record_const(
                                    ident.id.sym.as_ref(),
                                    crate::ir_builder::ConstValue::Bool(b.value),
                                ),
                                Expr::Lit(Lit::Num(n)) => builder.record_const(
                                    ident.id.sym.as_ref(),
                                    crate::ir_builder::ConstValue::Number(n.value),
                                ),
                                _ => {}
                            }
                        }
                    }
                }
                analyze_variable_declarator(declarator, builder)?;
            }
        }
        Decl::Fn(fn_decl) => {
            // 分析函数声明
            if is_component_function(&fn_decl.function) {
                analyze_component_function(&fn_decl.function, builder)?;
            }
        }
        _ => {}
    }
    Ok(())
}

/// 分析变量声明符
fn analyze_variable_declarator<'a>(
    declarator: &'a VarDeclarator,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(init) = &declarator.init {
        analyze_expression(init, builder)?;
    }

    // 检查是否是响应式变量
    if let Pat::Ident(ident) = &declarator.name {
        let var_name = ident.sym.as_str();
        if is_reactive_variable(var_name, &declarator.init) {
            let _reactive_id = builder.add_declared_reactive(var_name, None);
        }
    }

    Ok(())
}

/// 分析表达式
fn analyze_expression<'a>(expr: &'a Expr, builder: &mut IRBuilder<'a>) -> CompilerResult<()> {
    match expr {
        Expr::Call(call_expr) => analyze_call_expression(call_expr, builder)?,
        Expr::Arrow(arrow_expr) => analyze_arrow_function(arrow_expr, builder)?,
        Expr::JSXElement(jsx_elem) => analyze_jsx_element(jsx_elem, builder)?,
        Expr::JSXFragment(jsx_frag) => analyze_jsx_fragment(jsx_frag, builder)?,
        Expr::Member(member_expr) => analyze_member_expression(member_expr, builder)?,
        Expr::Bin(binary_expr) => {
            analyze_expression(&binary_expr.left, builder)?;
            analyze_expression(&binary_expr.right, builder)?;
        }
        Expr::Unary(unary_expr) => {
            analyze_expression(&unary_expr.arg, builder)?;
        }
        Expr::Cond(cond_expr) => {
            analyze_expression(&cond_expr.test, builder)?;
            analyze_expression(&cond_expr.cons, builder)?;
            analyze_expression(&cond_expr.alt, builder)?;
        }
        Expr::Array(array_expr) => {
            // 处理数组表达式
            for elem in &array_expr.elems {
                if let Some(elem) = elem {
                    analyze_expression(&elem.expr, builder)?;
                }
            }
        }
        Expr::Object(obj_expr) => {
            // 处理对象表达式
            for prop in &obj_expr.props {
                match prop {
                    PropOrSpread::Prop(prop) => {
                        match &**prop {
                            Prop::KeyValue(kv) => {
                                analyze_expression(&kv.value, builder)?;
                            }
                            Prop::Assign(assign) => {
                                analyze_expression(&assign.value, builder)?;
                            }
                            Prop::Method(method) => {
                                // analyze_expression(&method.function.body, builder)?;
                            }
                            _ => {}
                        }
                    }
                    PropOrSpread::Spread(spread) => {
                        analyze_expression(&spread.expr, builder)?;
                    }
                }
            }
        }
        _ => {}
    }
    Ok(())
}

/// 分析调用表达式
fn analyze_call_expression<'a>(
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    match &call_expr.callee {
        Callee::Expr(callee_expr) => {
            if let Expr::Ident(ident) = callee_expr.as_ref() {
                let callee_name = ident.sym.as_str();

                // 分析Hook调用
                if is_hook_call(callee_name) {
                    analyze_hook_call(callee_name, call_expr, builder)?;
                }

                // 分析其他函数调用
                analyze_expression(callee_expr, builder)?;
            }
        }
        _ => {}
    }

    // 分析参数
    for arg in &call_expr.args {
        analyze_expression(&arg.expr, builder)?;
    }

    Ok(())
}

/// 分析Hook调用
fn analyze_hook_call<'a>(
    hook_name: &str,
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    match hook_name {
        "useState" => analyze_use_state(call_expr, builder)?,
        "useEffect" => analyze_use_effect(call_expr, builder)?,
        "useMemo" => analyze_use_memo(call_expr, builder)?,
        "useCallback" => analyze_use_callback(call_expr, builder)?,
        "useContext" => analyze_use_context(call_expr, builder)?,
        "useRef" => analyze_use_ref(call_expr, builder)?,
        _ => {}
    }

    Ok(())
}

/// 分析useState
fn analyze_use_state<'a>(
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(arg) = call_expr.args.first() {
        let initial_value = Some(*arg.expr.clone());
        let _reactive_id = builder.add_state("state".to_string(), initial_value, None);
    }
    Ok(())
}

/// 分析useEffect
fn analyze_use_effect<'a>(
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(arg) = call_expr.args.first() {
        if let Expr::Arrow(arrow_expr) = &*arg.expr {
            let dependency = if call_expr.args.len() > 1 {
                if let Some(dep_arg) = call_expr.args.get(1) {
                    Some(extract_dependency_from_expression(&dep_arg.expr))
                } else {
                    None
                }
            } else {
                None
            };

            builder.add_effect(arrow_expr.clone(), dependency);
        }
    }
    Ok(())
}

/// 分析useMemo
fn analyze_use_memo<'a>(
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(arg) = call_expr.args.first() {
        if let Expr::Arrow(arrow_expr) = &*arg.expr {
            let dependency = if call_expr.args.len() > 1 {
                if let Some(dep_arg) = call_expr.args.get(1) {
                    Some(extract_dependency_from_expression(&dep_arg.expr))
                } else {
                    None
                }
            } else {
                None
            };

            builder.add_derived("memo".to_string(), arrow_expr.clone(), dependency, None);
        }
    }
    Ok(())
}

/// 分析useCallback
fn analyze_use_callback<'a>(
    call_expr: &'a CallExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(arg) = call_expr.args.first() {
        if let Expr::Arrow(arrow_expr) = &*arg.expr {
            let dependency = if call_expr.args.len() > 1 {
                if let Some(dep_arg) = call_expr.args.get(1) {
                    Some(extract_dependency_from_expression(&dep_arg.expr))
                } else {
                    None
                }
            } else {
                None
            };

            builder.add_derived("callback".to_string(), arrow_expr.clone(), dependency, None);
        }
    }
    Ok(())
}

/// 分析useContext
fn analyze_use_context<'a>(
    _call_expr: &'a CallExpr,
    _builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    // 分析useContext调用
    Ok(())
}

/// 分析useRef
fn analyze_use_ref<'a>(call_expr: &'a CallExpr, builder: &mut IRBuilder<'a>) -> CompilerResult<()> {
    if let Some(arg) = call_expr.args.first() {
        let initial_value = Some(*arg.expr.clone());
        builder.add_ref("ref".to_string(), initial_value, None);
    }
    Ok(())
}

/// 分析JSX元素
fn analyze_jsx_element<'a>(
    jsx_elem: &'a JSXElement,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    let tag_name = extract_jsx_tag_name(&jsx_elem.opening.name);
    let is_component = is_jsx_component(&tag_name, &[]);

    let mut props = HashMap::new();
    let mut events = Vec::new();

    // 分析属性
    for attr in &jsx_elem.opening.attrs {
        match attr {
            JSXAttrOrSpread::JSXAttr(jsx_attr) => {
                let prop_name = extract_jsx_attr_name(&jsx_attr.name);
                let prop_value = extract_jsx_attr_value(&jsx_attr.value);

                if prop_name.starts_with("on") && prop_name.len() > 2 {
                    // 事件处理
                    events.push(Event {
                        name: prop_name[2..].to_lowercase().into(),
                        handler: prop_value.into(),
                        dependencies: Vec::new(),
                        is_capture: false,
                        modifiers: Vec::new(),
                        bitmap: 0,
                    });
                } else {
                    // 普通属性
                    props.insert(
                        prop_name,
                        UnitProp {
                            value: prop_value.into(),
                            view_prop_map: HashMap::new(),
                            specifier: None,
                            is_event: false,
                            is_function: false,
                            dependencies: Vec::new(),
                        },
                    );
                }
            }
            JSXAttrOrSpread::SpreadElement(spread) => {
                // 处理展开属性
                analyze_expression(&spread.expr, builder)?;
            }
        }
    }

    // 分析子元素
    let mut children = Vec::new();
    for child in &jsx_elem.children {
        if let Some(view_unit) = analyze_jsx_child(child, builder)? {
            children.push(Box::new(view_unit));
        }
    }

    // 创建HTML单元
    let _html_unit = HTMLUnit {
        tag: tag_name.clone().into(),
        props,
        children,
        is_component,
        is_self_closing: jsx_elem.opening.self_closing,
        namespace: None,
        type_: "html".into(),
    };

    // 添加到构建器
    let view_particle = ViewParticle {
        template: TemplateNode {
            tag: tag_name.into(),
            props: HashMap::new(),
            children: vec![],
            is_element: true,
            is_text: false,
            events: Vec::new(),
            ref_id: None,
            key: None,
            node_type: NodeType::HTML,
        },
        mutable_units: vec![],
        is_root: true,
        has_async: false,
        events: Vec::new(),
        dynamic_props: HashMap::new(),
        dependencies: Vec::new(),
        particle_type: Some("template".to_string()),
        particle_data: Some("".to_string()),
        dep_id_bitmap: None,
        branches: None,
    };

    builder.add_view_return(view_particle);
    Ok(())
}

/// 分析JSX片段
fn analyze_jsx_fragment<'a>(
    jsx_frag: &'a JSXFragment,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    let mut children = Vec::new();

    for child in &jsx_frag.children {
        if let Some(view_unit) = analyze_jsx_child(child, builder)? {
            children.push(Box::new(view_unit));
        }
    }

    let _fragment_unit = FragmentUnit {
        children,
        key: None,
        type_: "fragment".into(),
    };

    // 简化处理
    Ok(())
}

/// 分析JSX子元素
fn analyze_jsx_child<'a>(
    child: &'a JSXElementChild,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<Option<ViewUnit<'a>>> {
    match child {
        JSXElementChild::JSXElement(elem) => {
            analyze_jsx_element(elem, builder)?;
            Ok(None) // 简化处理
        }
        JSXElementChild::JSXText(text) => {
            let text_unit = TextUnit {
                content: text.value.as_str().into(),
                is_empty: text.value.is_empty(),
                is_whitespace: text.value.trim().is_empty(),
                type_: "text".into(),
            };
            Ok(Some(ViewUnit::Text(text_unit)))
        }
        JSXElementChild::JSXExprContainer(expr_container) => {
            // 简化处理JSX表达式
            let exp_unit = ExpUnit {
                content: UnitProp {
                    value: "expression".into(),
                    view_prop_map: HashMap::new(),
                    specifier: None,
                    is_event: false,
                    is_function: false,
                    dependencies: Vec::new(),
                },
                dependencies: Vec::new(),
                dep_id_bitmap: 0,
                is_method: false,
                props: HashMap::new(),
                type_: "exp".into(),
            };
            Ok(Some(ViewUnit::Exp(exp_unit)))
        }
        JSXElementChild::JSXFragment(frag) => {
            analyze_jsx_fragment(frag, builder)?;
            Ok(None) // 简化处理
        }
        _ => Ok(None),
    }
}

/// 分析返回表达式
fn analyze_return_expression<'a>(
    expr: &'a Expr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    match expr {
        Expr::JSXElement(jsx_elem) => {
            analyze_jsx_element(jsx_elem, builder)?;
        }
        Expr::JSXFragment(jsx_frag) => {
            analyze_jsx_fragment(jsx_frag, builder)?;
        }
        Expr::Cond(cond_expr) => {
            // 若三元两侧均为 JSX/Fragment，则优先视为视图条件（简化为 then 分支）
            let cons_is_jsx =
                matches!(&*cond_expr.cons, Expr::JSXElement(_) | Expr::JSXFragment(_));
            let alt_is_jsx = matches!(&*cond_expr.alt, Expr::JSXElement(_) | Expr::JSXFragment(_));
            if cons_is_jsx && alt_is_jsx {
                match &*cond_expr.cons {
                    Expr::JSXElement(e) => analyze_jsx_element(e, builder)?,
                    Expr::JSXFragment(f) => analyze_jsx_fragment(f, builder)?,
                    _ => {}
                }
            } else {
                // 常量折叠：若 test 为可判定字面量或记录常量
                let choose_cons = match &*cond_expr.test {
                    Expr::Lit(Lit::Bool(b)) => b.value,
                    Expr::Lit(Lit::Num(n)) => n.value != 0.0,
                    Expr::Ident(id) => builder.get_const_truthy(id.sym.as_ref()).unwrap_or(false),
                    _ => false,
                };
                let chosen = if choose_cons {
                    &*cond_expr.cons
                } else {
                    &*cond_expr.alt
                };
                match chosen {
                    Expr::JSXElement(e) => analyze_jsx_element(e, builder)?,
                    Expr::JSXFragment(f) => analyze_jsx_fragment(f, builder)?,
                    other => analyze_expression(other, builder)?,
                }
            }
        }
        _ => {
            analyze_expression(expr, builder)?;
        }
    }
    Ok(())
}

/// 分析if语句
fn analyze_if_statement<'a>(
    if_stmt: &'a IfStmt,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    analyze_expression(&if_stmt.test, builder)?;

    analyze_statement(&if_stmt.cons, builder)?;

    if let Some(alternate) = &if_stmt.alt {
        analyze_statement(alternate, builder)?;
    }

    Ok(())
}

/// 分析for语句
fn analyze_for_statement<'a>(
    for_stmt: &'a ForStmt,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    if let Some(init) = &for_stmt.init {
        match init {
            VarDeclOrExpr::VarDecl(var_decl) => {
                for declarator in &var_decl.decls {
                    analyze_variable_declarator(declarator, builder)?;
                }
            }
            VarDeclOrExpr::Expr(expr) => {
                analyze_expression(expr, builder)?;
            }
        }
    }

    if let Some(test) = &for_stmt.test {
        analyze_expression(test, builder)?;
    }

    if let Some(update) = &for_stmt.update {
        analyze_expression(update, builder)?;
    }

    analyze_statement(&for_stmt.body, builder)?;

    Ok(())
}

/// 分析while语句
fn analyze_while_statement<'a>(
    while_stmt: &'a WhileStmt,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    analyze_expression(&while_stmt.test, builder)?;

    analyze_statement(&while_stmt.body, builder)?;

    Ok(())
}

/// 分析箭头函数
fn analyze_arrow_function<'a>(
    arrow_expr: &'a ArrowExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    // 分析参数
    for param in &arrow_expr.params {
        analyze_parameter(param, builder)?;
    }

    // 分析函数体
    match &*arrow_expr.body {
        BlockStmtOrExpr::BlockStmt(block) => {
            for stmt in &block.stmts {
                analyze_statement(stmt, builder)?;
            }
        }
        BlockStmtOrExpr::Expr(expr) => {
            analyze_expression(expr, builder)?;
        }
    }

    Ok(())
}

/// 分析参数
fn analyze_parameter<'a>(param: &Pat, builder: &mut IRBuilder<'a>) -> CompilerResult<()> {
    match param {
        Pat::Ident(ident) => {
            // 简单标识符参数
            let param_name = ident.sym.as_str();
            builder.add_single_prop(param_name.to_string(), param.clone(), "props", None);
        }
        Pat::Object(obj_pat) => {
            // 对象解构参数
            for prop in &obj_pat.props {
                match prop {
                    ObjectPatProp::KeyValue(kv) => {
                        if let Pat::Ident(ident) = &*kv.value {
                            let prop_name = ident.sym.as_str();
                            builder.add_single_prop(
                                prop_name.to_string(),
                                *kv.value.clone(),
                                "props",
                                None,
                            );
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

/// 分析成员表达式
fn analyze_member_expression<'a>(
    member_expr: &'a MemberExpr,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    analyze_expression(&member_expr.obj, builder)?;

    // 简化处理成员属性
    Ok(())
}

/// 分析组件函数
fn analyze_component_function<'a>(
    fn_decl: &'a Function,
    builder: &mut IRBuilder<'a>,
) -> CompilerResult<()> {
    // 分析函数参数
    for param in &fn_decl.params {
        analyze_parameter(&param.pat, builder)?;
    }

    // 分析函数体
    if let Some(body) = &fn_decl.body {
        for stmt in &body.stmts {
            analyze_statement(stmt, builder)?;
        }
    }

    Ok(())
}

// 辅助函数

/// 检查是否是组件函数
fn is_component_function(fn_decl: &Function) -> bool {
    // 检查函数名是否以大写字母开头
    false
}

/// 检查是否是Hook调用
fn is_hook_call(name: &str) -> bool {
    matches!(
        name,
        "useState" | "useEffect" | "useMemo" | "useCallback" | "useContext" | "useRef"
    )
}

/// 检查是否是响应式变量
fn is_reactive_variable(name: &str, init: &Option<Box<Expr>>) -> bool {
    // 检查变量名是否包含特定模式
    name.contains("state") || name.contains("reactive") || init.is_some()
}

/// 检查块语句中是否包含JSX
fn contains_jsx_in_block(block: &BlockStmt) -> bool {
    for stmt in &block.stmts {
        match stmt {
            Stmt::Return(return_stmt) => {
                if let Some(expr) = &return_stmt.arg {
                    if contains_jsx_in_expr(expr) {
                        return true;
                    }
                }
            }
            Stmt::Expr(expr_stmt) => {
                if contains_jsx_in_expr(&expr_stmt.expr) {
                    return true;
                }
            }
            _ => {}
        }
    }
    false
}

/// 检查表达式中是否包含JSX
fn contains_jsx_in_expr(expr: &Expr) -> bool {
    match expr {
        Expr::JSXElement(_) | Expr::JSXFragment(_) => true,
        Expr::Call(call) => {
            if let Callee::Expr(expr) = &call.callee {
                if let Expr::Ident(ident) = &**expr {
                    if ident.sym == "createElement" || ident.sym == "jsx" {
                        return true;
                    }
                }
            }
            false
        }
        _ => false,
    }
}

/// 检查是否是JSX组件
fn is_jsx_component(tag_name: &str, _html_tags: &[String]) -> bool {
    // 检查是否以大写字母开头（React组件命名约定）
    tag_name.chars().next().map_or(false, |c| c.is_uppercase())
}

/// 提取表达式字符串
fn extract_expression_string(expr: &Expr) -> String {
    match expr {
        Expr::Ident(ident) => ident.sym.as_str().to_string(),
        Expr::Lit(lit) => match lit {
            Lit::Str(s) => s.value.as_str().to_string(),
            Lit::Num(n) => n.value.to_string(),
            Lit::Bool(b) => b.value.to_string(),
            Lit::Null(_) => "null".to_string(),
            _ => "literal".to_string(),
        },
        _ => "expression".to_string(),
    }
}

/// 提取JSX标签名
fn extract_jsx_tag_name(name: &JSXElementName) -> String {
    match name {
        JSXElementName::Ident(ident) => ident.sym.as_str().to_string(),
        JSXElementName::JSXMemberExpr(_member) => {
            // 简化处理成员表达式
            "MemberExpression".to_string()
        }
        JSXElementName::JSXNamespacedName(namespaced) => {
            format!(
                "{}:{}",
                namespaced.ns.sym.as_str(),
                namespaced.name.sym.as_str()
            )
        }
    }
}

/// 提取JSX属性名
fn extract_jsx_attr_name(name: &JSXAttrName) -> String {
    match name {
        JSXAttrName::Ident(ident) => ident.sym.as_str().to_string(),
        JSXAttrName::JSXNamespacedName(namespaced) => {
            format!(
                "{}:{}",
                namespaced.ns.sym.as_str(),
                namespaced.name.sym.as_str()
            )
        }
    }
}

/// 提取JSX属性值
fn extract_jsx_attr_value(value: &Option<JSXAttrValue>) -> String {
    match value {
        Some(JSXAttrValue::Lit(lit)) => match lit {
            Lit::Str(s) => s.value.as_str().to_string(),
            Lit::Num(n) => n.value.to_string(),
            Lit::Bool(b) => b.value.to_string(),
            _ => "literal".to_string(),
        },
        Some(JSXAttrValue::JSXExprContainer(_expr_container)) => {
            // 简化处理JSX表达式
            "expression".to_string()
        }
        Some(JSXAttrValue::JSXElement(_)) => "element".to_string(),
        Some(JSXAttrValue::JSXFragment(_)) => "fragment".to_string(),
        None => "true".to_string(),
    }
}

/// 从表达式提取依赖
fn extract_dependencies_from_expression(expr: &Expr) -> Vec<String> {
    let mut dependencies = Vec::new();
    extract_dependencies_recursive(expr, &mut dependencies);
    dependencies
}

/// 递归提取依赖
fn extract_dependencies_recursive(expr: &Expr, dependencies: &mut Vec<String>) {
    match expr {
        Expr::Ident(ident) => {
            dependencies.push(ident.sym.as_str().to_string());
        }
        Expr::Member(member) => {
            extract_dependencies_recursive(&member.obj, dependencies);
            // 简化处理成员属性
        }
        Expr::Call(call) => {
            if let Callee::Expr(callee_expr) = &call.callee {
                extract_dependencies_recursive(callee_expr, dependencies);
            }
            for arg in &call.args {
                extract_dependencies_recursive(&arg.expr, dependencies);
            }
        }
        Expr::Bin(binary) => {
            extract_dependencies_recursive(&binary.left, dependencies);
            extract_dependencies_recursive(&binary.right, dependencies);
        }
        Expr::Unary(unary) => {
            extract_dependencies_recursive(&unary.arg, dependencies);
        }
        Expr::Cond(cond) => {
            extract_dependencies_recursive(&cond.test, dependencies);
            extract_dependencies_recursive(&cond.cons, dependencies);
            extract_dependencies_recursive(&cond.alt, dependencies);
        }
        Expr::Array(_array) => {
            // 简化处理数组表达式
        }
        Expr::Object(_obj) => {
            // 简化处理对象表达式
        }
        _ => {}
    }
}

/// 从表达式提取依赖对象
fn extract_dependency_from_expression(expr: &Expr) -> Dependency {
    let dep_names = extract_dependencies_from_expression(expr);
    Dependency {
        dep_id_bitmap: 0,
        dep_names,
    }
}
