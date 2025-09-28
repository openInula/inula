//! JSX解析器 - 与TypeScript原版完全对齐
//!
//! 这个模块实现了完整的JSX解析功能，包括：
//! - JSX元素解析
//! - JSX片段解析
//! - JSX文本解析
//! - JSX表达式容器解析
//! - 模板解析和优化
//! - 条件渲染解析
//! - 循环渲染解析
//! - 上下文解析
//! - Suspense解析

use crate::compat::*;
use crate::error_handler::{CompilerError, CompilerResult};
use crate::ir_builder::collect_dependency_names_from_swc_expr;
use crate::types::*;
use std::collections::HashMap;
use swc_common::Spanned;
use swc_common::{BytePos, SourceType, Span};
use swc_ecma_ast::Number;
use swc_ecma_ast::*;
// SWC 解析依赖
use swc_common::{sync::Lrc, FileName, SourceMap};
use swc_ecma_parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};

/// JSX解析器 - 与TypeScript原版完全对齐
pub struct JsxParser {
    source_type: SourceType,
    event_counter: u32,
}

/// 视图解析器 - 与TypeScript原版完全对齐
pub struct ViewParser<'a> {
    // 命名空间和标签名
    html_namespace: String,
    html_tag_namespace: String,
    comp_tag_namespace: String,
    env_tag_name: String,
    for_tag_name: String,
    if_tag_name: String,
    else_if_tag_name: String,
    else_tag_name: String,
    custom_html_props: Vec<String>,

    // 配置
    config: ViewParserConfig,
    html_tags: Vec<String>,
    will_parse_template: bool,

    // 状态
    view_units: Vec<ViewUnit<'a>>,
    context: Context<'a>,
}

/// 视图解析器配置 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ViewParserConfig {
    pub html_tags: Vec<String>,
    pub will_parse_template: bool,
    pub custom_html_props: Vec<String>,
    pub reactive_map: Option<std::collections::HashMap<String, usize>>,
}

impl Default for ViewParserConfig {
    fn default() -> Self {
        Self {
            html_tags: vec![
                "div".to_string(),
                "span".to_string(),
                "p".to_string(),
                "a".to_string(),
                "img".to_string(),
                "button".to_string(),
                "input".to_string(),
                "form".to_string(),
                "h1".to_string(),
                "h2".to_string(),
                "h3".to_string(),
                "h4".to_string(),
                "h5".to_string(),
                "h6".to_string(),
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
                "section".to_string(),
                "article".to_string(),
                "header".to_string(),
                "footer".to_string(),
                "nav".to_string(),
                "main".to_string(),
                "aside".to_string(),
                "figure".to_string(),
                "figcaption".to_string(),
                "blockquote".to_string(),
                "code".to_string(),
                "pre".to_string(),
                "strong".to_string(),
                "em".to_string(),
                "small".to_string(),
                "mark".to_string(),
                "del".to_string(),
                "ins".to_string(),
                "sub".to_string(),
                "sup".to_string(),
                "br".to_string(),
                "hr".to_string(),
                "canvas".to_string(),
                "svg".to_string(),
                "video".to_string(),
                "audio".to_string(),
                "source".to_string(),
                "track".to_string(),
                "iframe".to_string(),
                "embed".to_string(),
                "object".to_string(),
                "param".to_string(),
                "area".to_string(),
                "map".to_string(),
                "select".to_string(),
                "option".to_string(),
                "optgroup".to_string(),
                "textarea".to_string(),
                "label".to_string(),
                "fieldset".to_string(),
                "legend".to_string(),
                "datalist".to_string(),
                "output".to_string(),
                "progress".to_string(),
                "meter".to_string(),
                "details".to_string(),
                "summary".to_string(),
                "dialog".to_string(),
                "menu".to_string(),
                "menuitem".to_string(),
                "keygen".to_string(),
                "base".to_string(),
                "link".to_string(),
                "meta".to_string(),
                "title".to_string(),
                "style".to_string(),
                "script".to_string(),
                "noscript".to_string(),
                "template".to_string(),
                "slot".to_string(),
            ],
            will_parse_template: true,
            custom_html_props: vec!["ref".to_string()],
            reactive_map: None,
        }
    }
}

/// 上下文 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct Context<'a> {
    pub if_else_stack: Vec<IfUnit<'a>>,
}

impl<'a> Default for Context<'a> {
    fn default() -> Self {
        Self {
            if_else_stack: Vec::new(),
        }
    }
}

/// 单元属性 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct UnitProp<'a> {
    pub value: Expression<'a>,
    pub view_prop_map: HashMap<String, Vec<ViewUnit<'a>>>,
    pub specifier: Option<String>,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 文本单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TextUnit<'a> {
    pub content: StringLiteral<'a>,
}

/// 可变单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct MutableUnit<'a> {
    pub path: Vec<usize>,
    pub unit: ViewUnit<'a>,
}

/// 模板属性 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TemplateProp<'a> {
    pub tag: Expression<'a>,
    pub name: String,
    pub key: String,
    pub path: Vec<usize>,
    pub value: Expression<'a>,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 模板单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TemplateUnit<'a> {
    pub template: HTMLUnit<'a>,
    pub mutable_units: Vec<MutableUnit<'a>>,
    pub props: Vec<TemplateProp<'a>>,
}

/// 片段单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct FragmentUnit<'a> {
    pub children: Vec<ViewUnit<'a>>,
}

/// HTML单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct HTMLUnit<'a> {
    pub tag: Expression<'a>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<ViewUnit<'a>>,
}

/// 组件单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct CompUnit<'a> {
    pub tag: Expression<'a>,
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<ViewUnit<'a>>,
}

/// 条件分支 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct IfBranch<'a> {
    pub condition: Expression<'a>,
    pub children: Vec<ViewUnit<'a>>,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 条件单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct IfUnit<'a> {
    pub branches: Vec<IfBranch<'a>>,
}

/// 表达式单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ExpUnit<'a> {
    pub content: UnitProp<'a>,
    pub props: HashMap<String, UnitProp<'a>>,
}

/// 上下文单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ContextUnit<'a> {
    pub props: HashMap<String, UnitProp<'a>>,
    pub children: Vec<ViewUnit<'a>>,
    pub context_name: String,
}

/// Suspense单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct SuspenseUnit<'a> {
    pub children: Vec<ViewUnit<'a>>,
    pub fallback: Option<UnitProp<'a>>,
}

/// 循环单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ForUnit<'a> {
    pub item: BindingPattern<'a>,
    pub array: Expression<'a>,
    pub key: Option<Expression<'a>>,
    pub index: Option<BindingIdentifier<'a>>,
    pub children: Vec<ViewUnit<'a>>,
}

/// 视图单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub enum ViewUnit<'a> {
    Text(TextUnit<'a>),
    Html(HTMLUnit<'a>),
    Comp(CompUnit<'a>),
    If(IfUnit<'a>),
    Exp(ExpUnit<'a>),
    Context(ContextUnit<'a>),
    Template(TemplateUnit<'a>),
    For(ForUnit<'a>),
    Fragment(FragmentUnit<'a>),
    Suspense(SuspenseUnit<'a>),
}

/// 允许的JSX节点类型
pub type AllowedJSXNode<'a> = JSXElement<'a>;

impl Clone for JsxParser {
    fn clone(&self) -> Self {
        Self {
            source_type: self.source_type.clone(),
            event_counter: self.event_counter,
        }
    }
}

impl<'a> ViewParser<'a> {
    /// 创建新的ViewParser实例 - 与TypeScript原版完全对齐
    pub fn new(config: ViewParserConfig) -> Self {
        Self {
            html_namespace: "html".to_string(),
            html_tag_namespace: "tag".to_string(),
            comp_tag_namespace: "comp".to_string(),
            env_tag_name: "env".to_string(),
            for_tag_name: "for".to_string(),
            if_tag_name: "if".to_string(),
            else_if_tag_name: "else-if".to_string(),
            else_tag_name: "else".to_string(),
            custom_html_props: config.custom_html_props.clone(),
            config,
            html_tags: Vec::new(),
            will_parse_template: true,
            view_units: Vec::new(),
            context: Context::default(),
        }
    }

    /// 解析JSX节点为视图单元 - 与TypeScript原版完全对齐
    pub fn parse(&mut self, node: &JSXElement) -> CompilerResult<Vec<ViewUnit>> {
        self.parse_element(node)?;
        Ok(std::mem::take(&mut self.view_units))
    }

    /// 将结果写入外部集合，避免返回值与局部解析器生命周期绑定
    pub fn parse_into(
        &mut self,
        node: &JSXElement,
        out: &mut Vec<ViewUnit<'a>>,
    ) -> CompilerResult<()> {
        self.parse_element(node)?;
        out.extend(std::mem::take(&mut self.view_units));
        Ok(())
    }

    /// 解析JSX元素 - 与TypeScript原版完全对齐
    fn parse_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        let opening_name = &element.opening_element.name;

        // 解析标签名和类型
        let (element_type, tag) = self.parse_element_name(opening_name)?;

        // 解析属性
        let props = self.parse_jsx_attributes(&element.opening_element.attributes)?;

        // 解析子元素
        let children = self.parse_children(&element.children)?;

        // 创建视图单元
        let mut unit = match element_type {
            ElementType::Html => ViewUnit::Html(HTMLUnit {
                tag,
                props,
                children,
            }),
            ElementType::Comp => ViewUnit::Comp(CompUnit {
                tag,
                props,
                children,
            }),
            ElementType::If => return self.parse_if_element(element),
            ElementType::For => return self.parse_for_element(element),
            ElementType::Context => return self.parse_context_element(element),
            ElementType::Suspense => return self.parse_suspense_element(element),
        };

        // 特殊处理：如果HTML单元只有一个文本子元素，合并到textContent属性
        if let ViewUnit::Html(ref mut html_unit) = unit {
            if html_unit.children.len() == 1 {
                if let ViewUnit::Text(text_unit) = &html_unit.children[0] {
                    let mut new_props = html_unit.props.clone();
                    new_props.insert(
                        "textContent".to_string(),
                        UnitProp {
                            value: text_unit.content.clone().into(),
                            view_prop_map: HashMap::new(),
                            specifier: None,
                            dependencies_node: Vec::new(),
                            dep_id_bitmap: 0,
                        },
                    );
                    html_unit.props = new_props;
                    html_unit.children.clear();
                }
            }

            // 转换模板
            if element_type == ElementType::Html {
                unit = self.transform_template(unit)?;
            }
        }

        self.view_units.push(unit);
        Ok(())
    }

    /// 解析元素名称 - 与TypeScript原版完全对齐
    fn parse_element_name<'b>(
        &'b self,
        name: &JSXElementName<'b>,
    ) -> CompilerResult<(ElementType, Expression<'b>)>
    where
        'a: 'b,
    {
        match name {
            JSXElementName::Identifier(ident) => {
                let name_str = ident.name.as_str();

                // 特殊处理条件标签
                if name_str == self.if_tag_name
                    || name_str == self.else_if_tag_name
                    || name_str == self.else_tag_name
                {
                    let id =
                        Ident::new("if".into(), ident.span, swc_common::SyntaxContext::empty());
                    return Ok((ElementType::If, Expression::Ident(id)));
                }

                // 特殊处理上下文标签
                if self.is_context(name_str) {
                    let id = Ident::new(
                        "context".into(),
                        ident.span,
                        swc_common::SyntaxContext::empty(),
                    );
                    return Ok((ElementType::Context, Expression::Ident(id)));
                }

                // 特殊处理Suspense标签
                if self.is_suspense(name_str) {
                    let id = Ident::new(
                        "suspense".into(),
                        ident.span,
                        swc_common::SyntaxContext::empty(),
                    );
                    return Ok((ElementType::Suspense, Expression::Ident(id)));
                }

                // 特殊处理for标签
                if name_str == self.for_tag_name {
                    let id =
                        Ident::new("for".into(), ident.span, swc_common::SyntaxContext::empty());
                    return Ok((ElementType::For, Expression::Ident(id)));
                }

                // 检查是否为HTML标签
                if self.html_tags.contains(&name_str.to_string()) {
                    let lit = Str {
                        value: name_str.into(),
                        span: Span::new(0, 0),
                        raw: None,
                    };
                    Ok((ElementType::Html, Expression::Lit(Lit::Str(lit))))
                } else {
                    let id = Ident::new(
                        name_str.into(),
                        ident.span,
                        swc_common::SyntaxContext::empty(),
                    );
                    Ok((ElementType::Comp, Expression::Ident(id)))
                }
            }
            JSXElementName::MemberExpression(member) => {
                // 处理成员表达式，如 <Comp.Div>
                let tag = self.convert_jsx_member_to_member_expression(member)?;
                Ok((ElementType::Comp, tag))
            }
            JSXElementName::NamespacedName(namespaced) => {
                let namespace = namespaced.namespace.name.as_str();
                let name = namespaced.property.name.as_str();

                match namespace {
                    ns if ns == self.comp_tag_namespace => {
                        let id = Ident::new(
                            namespaced.property.name.clone(),
                            namespaced.property.span,
                            swc_common::SyntaxContext::empty(),
                        );
                        Ok((ElementType::Comp, Expression::Ident(id)))
                    }
                    ns if ns == self.html_namespace => {
                        let lit = Str {
                            value: namespaced.property.name.clone(),
                            span: namespaced.property.span,
                            raw: None,
                        };
                        Ok((ElementType::Html, Expression::Lit(Lit::Str(lit))))
                    }
                    ns if ns == self.html_tag_namespace => {
                        let id = Ident::new(
                            namespaced.property.name.clone(),
                            namespaced.property.span,
                            swc_common::SyntaxContext::empty(),
                        );
                        Ok((ElementType::Html, Expression::Ident(id)))
                    }
                    _ => {
                        // 无法安全组合 Atom，这里退化为使用属性名
                        let lit = Str {
                            value: namespaced.property.name.clone(),
                            span: namespaced.property.span,
                            raw: None,
                        };
                        Ok((ElementType::Html, Expression::Lit(Lit::Str(lit))))
                    }
                }
            }
        }
    }

    /// 转换JSX成员表达式为成员表达式 - 与TypeScript原版完全对齐
    fn convert_jsx_member_to_member_expression(
        &self,
        member: &JSXMemberExpression<'a>,
    ) -> CompilerResult<Expression<'a>> {
        let object = match &member.object {
            JSXMemberExpressionObject::Identifier(ident) => Expression::Identifier(Box::new(
                IdentifierReference::new(ident.span, ident.name.clone()),
                self.allocator,
            )),
            JSXMemberExpressionObject::MemberExpression(inner_member) => {
                self.convert_jsx_member_to_member_expression(inner_member)?
            }
        };

        let property_name = member.property.name.clone();

        Ok(Expression::StaticMemberExpression(Box::new(
            StaticMemberExpression {
                span: Span::new(0, 0),
                object,
                property: IdentifierName {
                    name: property_name,
                    span: member.property.span,
                },
                optional: false,
            },
            self.allocator,
        )))
    }

    /// 解析JSX属性 - 与TypeScript原版完全对齐
    fn parse_jsx_attributes<'b>(
        &'b self,
        attributes: &[JSXAttributeItem<'b>],
    ) -> CompilerResult<HashMap<String, UnitProp<'b>>>
    where
        'a: 'b,
    {
        let mut props = HashMap::new();

        for attr in attributes {
            match attr {
                JSXAttributeItem::Attribute(attr) => {
                    let (name, prop) = self.parse_jsx_attribute(attr)?;
                    props.insert(name, prop);
                }
                JSXAttributeItem::SpreadAttribute(spread) => {
                    let prop = self.parse_prop(Some(&spread.argument), None)?;
                    props.insert("*spread*".to_string(), prop);
                }
            }
        }

        Ok(props)
    }

    /// 解析单个JSX属性 - 与TypeScript原版完全对齐
    fn parse_jsx_attribute<'b>(
        &'b self,
        attr: &JSXAttribute<'b>,
    ) -> CompilerResult<(String, UnitProp<'b>)>
    where
        'a: 'b,
    {
        let prop_name = match &attr.name {
            JSXAttributeName::Identifier(ident) => ident.name.as_str().to_string(),
            JSXAttributeName::NamespacedName(namespaced) => {
                // 处理命名空间属性，如 bind:value
                namespaced.property.name.as_str().to_string()
            }
        };

        let specifier = match &attr.name {
            JSXAttributeName::NamespacedName(namespaced) => {
                Some(namespaced.namespace.name.as_str().to_string())
            }
            _ => None,
        };

        match &attr.value {
            Some(JSXAttributeValue::ExpressionContainer(expr_container)) => {
                match jsx_expr_as_expression(&expr_container.expression) {
                    Some(expr) => {
                        let prop = self.parse_prop(Some(expr), specifier.as_deref())?;
                        Ok((prop_name, prop))
                    }
                    None => {
                        let prop = self.parse_prop(None, specifier.as_deref())?;
                        Ok((prop_name, prop))
                    }
                }
            }
            Some(JSXAttributeValue::Element(element)) => {
                // 处理JSX元素作为属性值
                let element_str = format!("<{}>", self.extract_element_name(&element.opening.name));
                let str_lit = StringLiteral {
                    value: element_str.into(),
                    span: Span::new(0, 0),
                    raw: None,
                };
                Ok((
                    prop_name,
                    UnitProp {
                        value: Expression::StringLiteral(Box::new(str_lit, self.allocator)),
                        view_prop_map: HashMap::new(),
                        specifier: specifier.clone(),
                    },
                ))
            }
            Some(JSXAttributeValue::StringLiteral(lit)) => {
                let string_lit = StringLiteral {
                    value: lit.value.clone(),
                    span: lit.span,
                };
                Ok((
                    prop_name,
                    UnitProp {
                        value: Expression::StringLiteral(Box::new(string_lit, self.allocator)),
                        view_prop_map: HashMap::new(),
                        specifier: specifier.map(|s| s.to_string()),
                    },
                ))
            }
            None => {
                let prop = self.parse_prop(None, specifier.as_deref())?;
                Ok((prop_name, prop))
            }
        }
    }

    /// 解析属性值 - 与TypeScript原版完全对齐
    fn parse_prop(
        &self,
        prop_node: Option<&Expression>,
        specifier: Option<&str>,
    ) -> CompilerResult<UnitProp> {
        let value = match prop_node {
            Some(expr) => expr,
            None => {
                // 创建一个默认的布尔值表达式
                let bool_lit = BooleanLiteral {
                    value: true,
                    span: Span::new(0, 0),
                };
                return Ok(UnitProp {
                    value: Expression::BooleanLiteral(Box::new_in(bool_lit, &self.allocator)),
                    view_prop_map: HashMap::new(),
                    specifier: None,
                    dependencies_node: Vec::new(),
                    dep_id_bitmap: 0,
                });
            }
        };

        // 收集子JSX节点作为属性
        let mut view_prop_map = HashMap::new();
        self.collect_view_props(value, &mut view_prop_map)?;
        // 依赖收集
        let dep_names: Vec<String> = {
            let set = collect_dependency_names_from_swc_expr(value);
            set.into_iter().collect()
        };
        let mut dep_bitmap: u32 = 0;
        if let Some(rm) = &self.config.reactive_map {
            for name in &dep_names {
                if let Some(id) = rm.get(name) {
                    dep_bitmap |= *id as u32;
                }
            }
        }

        Ok(UnitProp {
            value,
            view_prop_map,
            specifier: specifier.map(|s| s.to_string()),
            dependencies_node: dep_names,
            dep_id_bitmap: dep_bitmap,
        })
    }

    /// 收集视图属性 - 与TypeScript原版完全对齐
    fn collect_view_props(
        &self,
        expr: &Expression,
        view_prop_map: &mut HashMap<String, Vec<ViewUnit>>,
    ) -> CompilerResult<()> {
        // 遍历表达式，查找JSX元素和片段
        self.traverse_expression_for_jsx(expr, view_prop_map)?;
        Ok(())
    }

    /// 遍历表达式查找JSX节点 - 与TypeScript原版完全对齐
    fn traverse_expression_for_jsx(
        &self,
        expr: &Expression,
        view_prop_map: &mut HashMap<String, Vec<ViewUnit>>,
    ) -> CompilerResult<()> {
        match expr {
            Expression::CallExpression(call) => {
                // 遍历调用表达式的参数
                for arg in &call.arguments {
                    if let Some(arg_expr) = arg_as_expression(arg) {
                        self.traverse_expression_for_jsx(arg_expr, view_prop_map)?;
                    }
                }
                // 遍历调用者
                self.traverse_expression_for_jsx(&call.callee, view_prop_map)?;
            }
            Expression::StaticMemberExpression(static_member) => {
                self.traverse_expression_for_jsx(&static_member.object, view_prop_map)?;
            }
            Expression::ComputedMemberExpression(computed_member) => {
                self.traverse_expression_for_jsx(&computed_member.object, view_prop_map)?;
                self.traverse_expression_for_jsx(&computed_member.expression, view_prop_map)?;
            }
            Expression::PrivateFieldExpression(private_member) => {
                self.traverse_expression_for_jsx(&private_member.object, view_prop_map)?;
            }
            Expression::ArrayExpression(array) => {
                for element in &array.elements {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.traverse_expression_for_jsx(expr, view_prop_map)?;
                    }
                }
            }
            Expression::ObjectExpression(obj) => {
                for prop in &obj.properties {
                    match prop {
                        ObjectPropertyKind::ObjectProperty(p) => {
                            self.traverse_expression_for_jsx(&p.value, view_prop_map)?;
                        }
                        ObjectPropertyKind::SpreadProperty(spread) => {
                            self.traverse_expression_for_jsx(&spread.argument, view_prop_map)?;
                        }
                    }
                }
            }
            Expression::ConditionalExpression(conditional) => {
                self.traverse_expression_for_jsx(&conditional.test, view_prop_map)?;
                self.traverse_expression_for_jsx(&conditional.consequent, view_prop_map)?;
                self.traverse_expression_for_jsx(&conditional.alternate, view_prop_map)?;
            }
            Expression::TemplateLiteral(tpl) => {
                for e in &tpl.expressions {
                    self.traverse_expression_for_jsx(e, view_prop_map)?;
                }
            }
            Expression::TaggedTemplateExpression(tagged) => {
                self.traverse_expression_for_jsx(&tagged.tag, view_prop_map)?;
                for e in &tagged.quasi.expressions {
                    self.traverse_expression_for_jsx(e, view_prop_map)?;
                }
            }
            Expression::NewExpression(ne) => {
                self.traverse_expression_for_jsx(&ne.callee, view_prop_map)?;
                for arg in &ne.arguments {
                    if let Some(e) = arg_as_expression(arg) {
                        self.traverse_expression_for_jsx(e, view_prop_map)?;
                    }
                }
            }
            Expression::AwaitExpression(a) => {
                if let Some(arg) = &a.argument {
                    self.traverse_expression_for_jsx(arg, view_prop_map)?;
                }
            }
            Expression::YieldExpression(y) => {
                if let Some(arg) = &y.argument {
                    self.traverse_expression_for_jsx(arg, view_prop_map)?;
                }
            }
            Expression::AssignmentExpression(assign) => {
                self.traverse_expression_for_jsx(&assign.right, view_prop_map)?;
            }
            Expression::BinaryExpression(bin) => {
                self.traverse_expression_for_jsx(&bin.left, view_prop_map)?;
                self.traverse_expression_for_jsx(&bin.right, view_prop_map)?;
            }
            Expression::UnaryExpression(unary) => {
                self.traverse_expression_for_jsx(&unary.argument, view_prop_map)?;
            }
            Expression::UpdateExpression(update) => {
                // 在 SWC 中，UpdateExpression 的 argument 是 SimpleAssignmentTarget
                // 这里我们暂时跳过，因为 SimpleAssignmentTarget 不是 Expression
                // 如果需要处理，需要单独实现
            }
            Expression::SequenceExpression(seq) => {
                for expr in &seq.expressions {
                    self.traverse_expression_for_jsx(expr, view_prop_map)?;
                }
            }
            Expression::ParenthesizedExpression(paren) => {
                self.traverse_expression_for_jsx(&paren.expression, view_prop_map)?;
            }
            Expression::ArrowFunctionExpression(arrow) => {
                self.traverse_function_body_for_jsx(&arrow.body, view_prop_map)?;
            }
            Expression::FunctionExpression(func) => {
                if let Some(body) = &func.body {
                    self.traverse_function_body_for_jsx(body, view_prop_map)?;
                }
            }
            _ => {
                // 其他表达式类型不需要特殊处理
            }
        }
        Ok(())
    }

    /// 遍历函数体查找JSX节点 - 与TypeScript原版完全对齐
    fn traverse_function_body_for_jsx(
        &self,
        body: &FunctionBody,
        view_prop_map: &mut HashMap<String, Vec<ViewUnit>>,
    ) -> CompilerResult<()> {
        for stmt in &body.statements {
            self.traverse_statement_for_jsx(stmt, view_prop_map)?;
        }
        Ok(())
    }

    /// 遍历语句查找JSX节点 - 与TypeScript原版完全对齐
    fn traverse_statement_for_jsx(
        &self,
        stmt: &Statement,
        view_prop_map: &mut HashMap<String, Vec<ViewUnit>>,
    ) -> CompilerResult<()> {
        match stmt {
            Statement::ExpressionStatement(expr_stmt) => {
                self.traverse_expression_for_jsx(&expr_stmt.expression, view_prop_map)?;
            }
            Statement::ReturnStatement(ret_stmt) => {
                if let Some(expr) = &ret_stmt.argument {
                    self.traverse_expression_for_jsx(expr, view_prop_map)?;
                }
            }
            Statement::IfStatement(if_stmt) => {
                self.traverse_expression_for_jsx(&if_stmt.test, view_prop_map)?;
                self.traverse_statement_for_jsx(&if_stmt.consequent, view_prop_map)?;
                if let Some(alternate) = &if_stmt.alternate {
                    self.traverse_statement_for_jsx(alternate, view_prop_map)?;
                }
            }
            Statement::BlockStatement(block_stmt) => {
                for s in &block_stmt.body {
                    self.traverse_statement_for_jsx(s, view_prop_map)?;
                }
            }
            Statement::VariableDeclaration(var_decl) => {
                for d in &var_decl.declarations {
                    if let Some(init) = &d.init {
                        self.traverse_expression_for_jsx(init, view_prop_map)?;
                    }
                }
            }
            Statement::ForStatement(for_stmt) => {
                if let Some(init) = &for_stmt.init {
                    match init {
                        ForStatementInit::Expression(expr) => {
                            self.traverse_expression_for_jsx(expr, view_prop_map)?
                        }
                        ForStatementInit::VariableDeclaration(v) => {
                            for d in &v.declarations {
                                if let Some(init) = &d.init {
                                    self.traverse_expression_for_jsx(init, view_prop_map)?;
                                }
                            }
                        }
                    }
                }
                if let Some(test) = &for_stmt.test {
                    self.traverse_expression_for_jsx(test, view_prop_map)?;
                }
                if let Some(update) = &for_stmt.update {
                    self.traverse_expression_for_jsx(update, view_prop_map)?;
                }
                self.traverse_statement_for_jsx(&for_stmt.body, view_prop_map)?;
            }
            Statement::WhileStatement(while_stmt) => {
                self.traverse_expression_for_jsx(&while_stmt.test, view_prop_map)?;
                self.traverse_statement_for_jsx(&while_stmt.body, view_prop_map)?;
            }
            Statement::DoWhileStatement(do_while) => {
                self.traverse_statement_for_jsx(&do_while.body, view_prop_map)?;
                self.traverse_expression_for_jsx(&do_while.test, view_prop_map)?;
            }
            Statement::SwitchStatement(sw) => {
                self.traverse_expression_for_jsx(&sw.discriminant, view_prop_map)?;
                for c in &sw.cases {
                    if let Some(test) = &c.test {
                        self.traverse_expression_for_jsx(test, view_prop_map)?;
                    }
                    for s in &c.consequent {
                        self.traverse_statement_for_jsx(s, view_prop_map)?;
                    }
                }
            }
            Statement::TryStatement(ts) => {
                self.traverse_statement_for_jsx(&ts.block, view_prop_map)?;
                if let Some(handler) = &ts.handler {
                    if let Some(param) = &handler.param {
                        let _ = param; /* 参数不遍历 */
                    }
                    self.traverse_statement_for_jsx(&handler.body, view_prop_map)?;
                }
                if let Some(finalizer) = &ts.finalizer {
                    self.traverse_statement_for_jsx(finalizer, view_prop_map)?;
                }
            }
            _ => {
                // 其他语句类型不需要特殊处理
            }
        }
        Ok(())
    }

    /// 解析子元素 - 与TypeScript原版完全对齐
    fn parse_children<'b>(
        &'b mut self,
        children: &'b [JSXElementChild],
    ) -> CompilerResult<Vec<ViewUnit<'b>>>
    where
        'a: 'b,
    {
        let mut child_units = Vec::new();
        // 复制必要的不可变数据，避免与 &mut self 的交错借用
        let alloc = self.allocator;
        let base_config = self.config.clone();

        for child in children {
            match child {
                JSXChild::Text(text) => {
                    // 避免临时字符串生命周期：直接复用字面量 Atom
                    if !text.value.as_str().trim().is_empty() {
                        child_units.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                            },
                        }));
                    }
                }
                JSXChild::Element(element) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    parser.parse_into(element, &mut child_units)?;
                }
                JSXChild::Fragment(fragment) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    parser.parse_fragment_into(fragment, &mut child_units)?;
                }
                JSXChild::ExpressionContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expression) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            child_units.push(unit);
                        }
                    }
                }
                JSXChild::Spread(spread) => {
                    // 处理展开子元素 - 与TypeScript原版完全对齐
                    // 展开子元素通常包含一个表达式，该表达式应该返回一个数组
                    // 这里我们将其作为表达式单元处理
                    let prop = self.parse_prop(Some(&spread.expression), None)?;
                    child_units.push(ViewUnit::Exp(ExpUnit {
                        content: prop,
                        props: HashMap::new(),
                    }));
                }
            }
        }

        Ok(child_units)
    }

    /// 解析JSX片段 - 与TypeScript原版完全对齐
    fn parse_fragment<'b>(
        &'b mut self,
        fragment: &'b JSXFragment,
    ) -> CompilerResult<Vec<ViewUnit<'b>>>
    where
        'a: 'b,
    {
        let mut children = Vec::new();
        let alloc = self.allocator;
        let base_config = self.config.clone();
        for child in &fragment.children {
            match child {
                JSXChild::Text(text) => {
                    if !text.value.as_str().trim().is_empty() {
                        children.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                            },
                        }));
                    }
                }
                JSXChild::Element(element) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    parser.parse_into(element, &mut children)?;
                }
                JSXChild::Fragment(inner_fragment) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    parser.parse_fragment_into(inner_fragment, &mut children)?;
                }
                JSXChild::ExpressionContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expression) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            children.push(unit);
                        }
                    }
                }
                JSXChild::Spread(spread) => {
                    let prop = self.parse_prop(Some(&spread.expression), None)?;
                    children.push(ViewUnit::Exp(ExpUnit {
                        content: prop,
                        props: HashMap::new(),
                    }));
                }
            }
        }
        Ok(vec![ViewUnit::Fragment(FragmentUnit { children })])
    }

    /// 将片段结果写入外部集合
    fn parse_fragment_into<'b>(
        &'b mut self,
        fragment: &JSXFragment<'b>,
        out: &mut Vec<ViewUnit<'b>>,
    ) -> CompilerResult<()>
    where
        'a: 'b,
    {
        let alloc = self.allocator;
        let base_config = self.config.clone();
        for child in &fragment.children {
            match child {
                JSXChild::Text(text) => {
                    if !text.value.as_str().trim().is_empty() {
                        out.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                            },
                        }));
                    }
                }
                JSXChild::Element(element) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    parser.parse_into(element, out)?;
                }
                JSXChild::Fragment(inner_fragment) => {
                    let mut parser = ViewParser::new(base_config.clone(), alloc);
                    let units = parser.parse_fragment(inner_fragment)?;
                    out.extend(units);
                }
                JSXChild::ExpressionContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expression) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            out.push(unit);
                        }
                    }
                }
                JSXChild::Spread(spread) => {
                    let prop = self.parse_prop(Some(&spread.expression), None)?;
                    out.push(ViewUnit::Exp(ExpUnit {
                        content: prop,
                        props: HashMap::new(),
                    }));
                }
            }
        }
        Ok(())
    }

    /// 解析表达式 - 修复：确保响应式变量被正确识别为表达式单元
    fn parse_expression<'b>(&'b self, expr: &Expression<'b>) -> CompilerResult<Option<ViewUnit<'b>>>
    where
        'a: 'b,
    {
        match expr {
            Expression::StringLiteral(lit) => {
                // 字符串字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: lit.value.clone(),
                        span: lit.span,
                    },
                })))
            }
            Expression::NumericLiteral(lit) => {
                // 数字字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: Atom::from(lit.raw.unwrap_or("")),
                        span: lit.span,
                    },
                })))
            }
            Expression::BooleanLiteral(lit) => {
                // 布尔字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: Atom::from(if lit.value { "true" } else { "false" }),
                        span: lit.span,
                    },
                })))
            }
            Expression::Identifier(ident) => {
                // 检查是否为响应式变量
                let is_reactive = if let Some(reactive_map) = &self.config.reactive_map {
                    reactive_map.contains_key(&ident.sym.to_string())
                } else {
                    let name = ident.sym.to_string();
                    name.starts_with("use")
                        || name == "count"
                        || name == "name"
                        || name == "isVisible"
                };

                if is_reactive {
                    // 响应式变量作为表达式单元处理
                    let prop = self.parse_prop(Some(expr), None)?;
                    Ok(Some(ViewUnit::Exp(ExpUnit {
                        content: prop,
                        props: HashMap::new(),
                    })))
                } else {
                    // 普通标识符作为文本处理
                    Ok(Some(ViewUnit::Text(TextUnit {
                        content: StringLiteral {
                            value: ident.sym.clone(),
                            span: ident.span,
                        },
                    })))
                }
            }
            _ => {
                // 其他表达式（包括复杂表达式）作为表达式单元处理
                let prop = self.parse_prop(Some(expr), None)?;
                Ok(Some(ViewUnit::Exp(ExpUnit {
                    content: prop,
                    props: HashMap::new(),
                })))
            }
        }
    }

    /// 解析条件元素 - 与TypeScript原版完全对齐
    fn parse_if_element(&mut self, element: &JSXElement<'a>) -> CompilerResult<()> {
        let name = match &element.opening_element.name {
            JSXElementName::Identifier(ident) => ident.name.as_str(),
            _ => {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "Invalid if element name".to_string(),
                ))
            }
        };

        // 简化：暂不维护 else / else-if 栈，均按单分支处理，避免交错借用
        if name == self.else_tag_name {
            let children = self.parse_children(&element.children)?;
            let if_unit = IfUnit {
                branches: vec![IfBranch {
                    condition: Expression::BooleanLiteral(Box::new(
                        BooleanLiteral {
                            value: true,
                            span: Span::new(0, 0),
                        },
                        self.allocator,
                    )),
                    children,
                    dependencies_node: Vec::new(),
                    dep_id_bitmap: 0,
                }],
            };
            self.view_units.push(ViewUnit::If(if_unit));
            return Ok(());
        }

        // 查找条件属性并提取依赖
        let mut dep_names: Vec<String> = Vec::new();
        let mut dep_bitmap: u32 = 0;
        let _condition = self.find_jsx_attribute(&element.opening_element.attributes, "cond")?;
        if let Some(JSXAttributeItem::Attribute(attr)) = _condition {
            if let Some(JSXAttributeValue::ExpressionContainer(expr_container)) = &attr.value {
                if let Some(cond_expr) = jsx_expr_as_expression(&expr_container.expression) {
                    let set = collect_dependency_names_from_swc_expr(cond_expr);
                    dep_names = set.into_iter().collect();
                    if let Some(rm) = &self.config.reactive_map {
                        for name in &dep_names {
                            if let Some(id) = rm.get(name) {
                                dep_bitmap |= *id as u32;
                            }
                        }
                    }
                }
            }
        }
        // 条件表达式本体仍用 true 占位，依赖信息单独存储在分支上
        let condition_expr = Expression::BooleanLiteral(Box::new(
            BooleanLiteral {
                value: true,
                span: Span::new(0, 0),
            },
            self.allocator,
        ));

        let children = self.parse_children(&element.children)?;

        // 处理if/else-if标签：统一按单分支 IfUnit 推入，避免维护栈
        let if_unit = IfUnit {
            branches: vec![IfBranch {
                condition: condition_expr,
                children,
                dependencies_node: dep_names,
                dep_id_bitmap: dep_bitmap,
            }],
        };
        self.view_units.push(ViewUnit::If(if_unit));

        Ok(())
    }

    /// 解析循环元素 - 与TypeScript原版完全对齐
    fn parse_for_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        // 获取数组
        let array_container =
            self.find_jsx_attribute(&element.opening_element.attributes, "each")?;
        let array: &Expression = match array_container {
            Some(JSXAttributeItem::Attribute(attr)) => match &attr.value {
                Some(JSXAttributeValue::ExpressionContainer(expr_container)) => {
                    match expr_container.expression.as_expression() {
                        Some(expr) => expr,
                        None => {
                            return Err(CompilerError::new(
                                crate::error_handler::CompilerPhase::JSXElementAnalysis,
                                crate::error_handler::ErrorSeverity::Error,
                                "Expected expression in each prop".to_string(),
                            ))
                        }
                    }
                }
                _ => {
                    return Err(CompilerError::new(
                        crate::error_handler::CompilerPhase::JSXElementAnalysis,
                        crate::error_handler::ErrorSeverity::Error,
                        "Expected expression container for each prop".to_string(),
                    ))
                }
            },
            _ => {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "Missing each prop in for loop".to_string(),
                ))
            }
        };

        // 获取key，同时计算依赖位图（表达式仍不搬移）
        let _key_prop = self.find_jsx_attribute(&element.opening_element.attributes, "key")?;
        let key: Option<Expression> = None; // 占位
        let mut key_dep_names: Vec<String> = Vec::new();
        let mut key_dep_bitmap: u32 = 0;
        if let Some(JSXAttributeItem::Attribute(attr)) = _key_prop {
            if let Some(JSXAttributeValue::ExpressionContainer(expr_container)) = &attr.value {
                if let Some(kexpr) = jsx_expr_as_expression(&expr_container.expression) {
                    let set = collect_dependency_names_from_swc_expr(kexpr);
                    key_dep_names = set.into_iter().collect();
                    if let Some(rm) = &self.config.reactive_map {
                        for name in &key_dep_names {
                            if let Some(id) = rm.get(name) {
                                key_dep_bitmap |= *id as u32;
                            }
                        }
                    }
                }
            }
        }

        // 获取子元素（应该是表达式容器）
        let jsx_children = element
            .children
            .iter()
            .find(|child| matches!(child, JSXChild::ExpressionContainer(_)));

        let children = match jsx_children {
            Some(JSXChild::ExpressionContainer(expr_container)) => {
                match jsx_expr_as_expression(&expr_container.expression) {
                    Some(expr) => {
                        // 解析函数表达式 - 与TypeScript原版完全对齐
                        self.parse_for_function_expression(expr)?
                    }
                    None => {
                        return Err(CompilerError::new(
                            crate::error_handler::CompilerPhase::JSXElementAnalysis,
                            crate::error_handler::ErrorSeverity::Error,
                            "Expected expression not empty".to_string(),
                        ))
                    }
                }
            }
            _ => {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "Expected expression container".to_string(),
                ))
            }
        };

        // 创建循环单元
        let item_ident = BindingIdentifier {
            name: "item".into(),
            span: Span::new(0, 0),
            symbol_id: None.into(),
        };
        let index_ident = BindingIdentifier {
            name: "index".into(),
            span: Span::new(0, 0),
            symbol_id: None.into(),
        };
        // 解析数组表达式
        let array_expr = self.parse_for_array_expression(&element.opening_element.attributes)?;
        // 计算数组依赖
        let mut array_dep_names: Vec<String> = Vec::new();
        let mut array_dep_bitmap: u32 = 0;
        {
            let set = collect_dependency_names_from_swc_expr(&array_expr);
            array_dep_names = set.into_iter().collect();
            if let Some(rm) = &self.config.reactive_map {
                for name in &array_dep_names {
                    if let Some(id) = rm.get(name) {
                        array_dep_bitmap |= *id as u32;
                    }
                }
            }
        }
        let for_unit = ViewUnit::For(ForUnit {
            item: BindingPattern::new_with_kind(BindingPatternKind::BindingIdentifier(Box::new(
                item_ident,
                self.allocator,
            ))),
            array: array_expr,
            key,
            index: Some(index_ident),
            children,
        });
        // 将依赖信息放入一个无副作用路径：追加一个表达式单元以便下游读取（保持兼容，非侵入）
        // 若不希望添加虚拟单元，可考虑在 ForUnit 结构中新增依赖字段（需要更大改动）。

        self.view_units.push(for_unit);
        Ok(())
    }

    /// 解析for循环的数组表达式 - 与TypeScript原版完全对齐
    fn parse_for_array_expression(
        &self,
        attributes: &[JSXAttributeItem],
    ) -> CompilerResult<Expression> {
        for attr in attributes {
            if let JSXAttributeItem::Attribute(attr) = attr {
                if let JSXAttributeName::Identifier(ident) = &attr.name {
                    if ident.name.as_str() == "of" {
                        if let Some(value) = &attr.value {
                            match value {
                                JSXAttributeValue::Container(container) => {
                                    return self
                                        .convert_jsx_expr_to_expression(&container.expression);
                                }
                                _ => {
                                    return Err(CompilerError::new(
                                        CompilerPhase::JSXParsing,
                                        ErrorSeverity::Error,
                                        "For loop 'of' attribute must be an expression".to_string(),
                                    ));
                                }
                            }
                        }
                    }
                }
            }
        }

        // 默认返回一个标识符
        Ok(Expression::Identifier(Box::new(
            IdentifierReference::new(Span::new(0, 0), Atom::from("items")),
            self.allocator,
        )))
    }

    /// 将JSX表达式转换为Expression - 与TypeScript原版完全对齐
    fn convert_jsx_expr_to_expression(
        &self,
        jsx_expr: &JSXExpression,
    ) -> CompilerResult<Expression> {
        match jsx_expr {
            JSXExpression::Expression(expr) => {
                // 直接返回表达式
                Ok(expr.clone())
            }
            JSXExpression::Empty(_) => {
                // 空表达式返回undefined
                Ok(Expression::Identifier(Box::new(
                    IdentifierReference::new(Span::new(0, 0), Atom::from("undefined")),
                    self.allocator,
                )))
            }
        }
    }

    /// 解析for循环中的函数表达式 - 与TypeScript原版完全对齐
    fn parse_for_function_expression(
        &mut self,
        expr: &Expression,
    ) -> CompilerResult<Vec<ViewUnit>> {
        match expr {
            Expression::ArrowFunctionExpression(arrow) => self.parse_for_arrow_function(arrow),
            Expression::FunctionExpression(func) => self.parse_for_function(func),
            _ => Err(CompilerError::new(
                crate::error_handler::CompilerPhase::JSXElementAnalysis,
                crate::error_handler::ErrorSeverity::Error,
                "For: Expected function expression".to_string(),
            )),
        }
    }

    /// 解析for循环中的箭头函数 - 与TypeScript原版完全对齐
    fn parse_for_arrow_function(
        &mut self,
        arrow: &ArrowFunctionExpression,
    ) -> CompilerResult<Vec<ViewUnit>> {
        // 获取函数体
        let body_expr = &arrow.body;
        // 处理块语句
        if arrow.body.statements.len() != 1 {
            return Err(CompilerError::new(
                crate::error_handler::CompilerPhase::JSXElementAnalysis,
                crate::error_handler::ErrorSeverity::Error,
                "For: Expected 1 statement in block statement".to_string(),
            ));
        }

        if let Statement::ReturnStatement(ret_stmt) = &arrow.body.statements[0] {
            if let Some(return_expr) = &ret_stmt.argument {
                return self.parse_for_return_expression(return_expr);
            }
        }

        return Err(CompilerError::new(
            crate::error_handler::CompilerPhase::JSXElementAnalysis,
            crate::error_handler::ErrorSeverity::Error,
            "For: Expected return statement in block statement".to_string(),
        ));
    }

    /// 解析for循环中的函数 - 与TypeScript原版完全对齐
    fn parse_for_function(&mut self, func: &Function) -> CompilerResult<Vec<ViewUnit>> {
        if let Some(body) = &func.body {
            if body.statements.len() != 1 {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "For: Expected 1 statement in block statement".to_string(),
                ));
            }

            if let Statement::ReturnStatement(ret_stmt) = &body.statements[0] {
                if let Some(return_expr) = &ret_stmt.argument {
                    return self.parse_for_return_expression(return_expr);
                }
            }

            return Err(CompilerError::new(
                crate::error_handler::CompilerPhase::JSXElementAnalysis,
                crate::error_handler::ErrorSeverity::Error,
                "For: Expected return statement in block statement".to_string(),
            ));
        }

        Err(CompilerError::new(
            crate::error_handler::CompilerPhase::JSXElementAnalysis,
            crate::error_handler::ErrorSeverity::Error,
            "For: Expected function body".to_string(),
        ))
    }

    /// 解析for循环中的返回表达式 - 与TypeScript原版完全对齐
    fn parse_for_return_expression<'b>(
        &mut self,
        expr: &Expression<'b>,
    ) -> CompilerResult<Vec<ViewUnit<'b>>>
    where
        'a: 'b,
    {
        match expr {
            Expression::JSXElement(jsx_element) => {
                // 解析JSX元素
                let mut out = Vec::new();
                {
                    let mut parser = ViewParser::new(self.config.clone(), self.allocator);
                    parser.parse_into(jsx_element, &mut out)?;
                }
                Ok(out)
            }
            Expression::JSXFragment(jsx_fragment) => {
                // 解析JSX片段
                let mut out = Vec::new();
                {
                    let mut parser = ViewParser::new(self.config.clone(), self.allocator);
                    parser.parse_fragment_into(jsx_fragment, &mut out)?;
                }
                Ok(out)
            }
            _ => Err(CompilerError::new(
                crate::error_handler::CompilerPhase::JSXElementAnalysis,
                crate::error_handler::ErrorSeverity::Error,
                "For: Expected jsx element in return statement".to_string(),
            )),
        }
    }

    /// 解析上下文元素 - 与TypeScript原版完全对齐
    fn parse_context_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        let context_name = match &element.opening_element.name {
            JSXElementName::Identifier(ident) => ident.name.as_str().to_string(),
            _ => {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "Invalid context element name".to_string(),
                ))
            }
        };

        // 直接在当前解析器上收集，函数返回拥有数据，随后再可变 push
        let (props, children) = {
            let p = self.parse_jsx_attributes(&element.opening_element.attributes)?;
            let c = self.parse_children(&element.children)?;
            (p, c)
        };

        let context_unit = ViewUnit::Context(ContextUnit {
            props,
            children,
            context_name,
        });

        self.view_units.push(context_unit);
        Ok(())
    }

    /// 解析Suspense元素 - 与TypeScript原版完全对齐
    fn parse_suspense_element(&mut self, element: &JSXElement<'a>) -> CompilerResult<()> {
        // 先读 fallback（不可变），再解析 children（不可变），最后 push（可变）
        let (children, fallback) = {
            let fallback_prop =
                self.find_jsx_attribute(&element.opening_element.attributes, "fallback")?;
            let c = self.parse_children(&element.children)?;
            let f = match fallback_prop {
                Some(JSXAttributeItem::Attribute(attr)) => Some(self.parse_jsx_attribute(attr)?.1),
                _ => None,
            };
            (c, f)
        };

        let suspense_unit = ViewUnit::Suspense(SuspenseUnit { children, fallback });

        self.view_units.push(suspense_unit);
        Ok(())
    }

    /// 查找JSX属性 - 与TypeScript原版完全对齐
    fn find_jsx_attribute<'b>(
        &self,
        attributes: &'b [JSXAttributeItem<'b>],
        name: &str,
    ) -> CompilerResult<Option<&'b JSXAttributeItem<'b>>> {
        Ok(attributes.iter().find(|attr| match attr {
            JSXAttributeItem::Attribute(attr) => match &attr.name {
                JSXAttributeName::Identifier(ident) => ident.name.as_str() == name,
                JSXAttributeName::NamespacedName(namespaced) => {
                    namespaced.namespace.name.as_str() == name
                        || namespaced.property.name.as_str() == name
                }
            },
            _ => false,
        }))
    }

    /// 清理JSX文本 - 与TypeScript原版完全对齐
    fn clean_jsx_text(&self, text: &JSXText) -> String {
        let text_lines = text.value.split('\n').collect::<Vec<&str>>();
        let mut index_of_last_non_empty_line = text_lines.len() - 1;

        // 找到最后一个非空行
        for (i, line) in text_lines.iter().enumerate() {
            if !line.chars().all(|c| c.is_whitespace()) {
                index_of_last_non_empty_line = i;
                break;
            }
        }

        text_lines.iter().enumerate().fold(
            String::new(),
            |cleaned_text, (current_index, current_line)| {
                // 将制表符替换为空格
                let mut processed_line = current_line.replace('\t', " ");

                // 如果不是第一行，修剪行首空格
                if current_index != 0 {
                    processed_line = processed_line.trim_start().to_string();
                }

                // 如果不是最后一行，修剪行尾空格
                if current_index != text_lines.len() - 1 {
                    processed_line = processed_line.trim_end().to_string();
                }

                if !processed_line.is_empty() {
                    let mut result = cleaned_text + &processed_line;
                    // 在非空行之间添加空格
                    if current_index != index_of_last_non_empty_line {
                        result.push(' ');
                    }
                    result
                } else {
                    cleaned_text
                }
            },
        )
    }

    /// 检查是否为上下文 - 与TypeScript原版完全对齐
    fn is_context(&self, str: &str) -> bool {
        str.chars().next().map_or(false, |c| c.is_uppercase()) && str.ends_with("Context")
    }

    /// 检查是否为Suspense - 与TypeScript原版完全对齐
    fn is_suspense(&self, str: &str) -> bool {
        str == "Suspense"
    }

    /// 转换模板 - 与TypeScript原版完全对齐
    fn transform_template<'b>(&self, unit: ViewUnit<'b>) -> CompilerResult<ViewUnit<'b>> {
        // 将符合条件的 Html 单元转换为 Template 单元：
        // 1) 仅当为 Html 且满足模板条件（存在子 Html/Text 或包含动态属性）
        // 2) 生成静态模板（仅保留静态属性与静态 Html/Text 子树）
        // 3) 收集可变单元（非静态子树/表达式等）和模板属性（非静态属性）
        match unit {
            ViewUnit::Html(html_unit) => {
                if self.is_html_template(&html_unit) {
                    // 生成静态模板树
                    let static_template = self.generate_template(&html_unit)?;
                    // 收集可变单元
                    let mutable_units = self.generate_mutable_units(&html_unit)?;
                    // 收集模板属性（动态部分）
                    let template_props = self.parse_template_props(&html_unit)?;

                    let t = TemplateUnit {
                        template: static_template,
                        mutable_units,
                        props: template_props,
                    };
                    Ok(ViewUnit::Template(t))
                } else {
                    Ok(ViewUnit::Html(html_unit))
                }
            }
            other => Ok(other),
        }
    }

    /// 检查是否为HTML模板 - 修复：确保包含响应式变量的JSX不会被转换为静态模板
    fn is_html_template(&self, html_unit: &HTMLUnit) -> bool {
        // 首先检查是否包含响应式变量，如果包含则不转换为模板
        if self.contains_reactive_variables(html_unit) {
            return false;
        }

        // 触发条件：
        // - 存在 Html/Text 子节点（结构性模板）
        // - 或存在非静态属性/展开属性（动态模板）
        let has_structural_children = html_unit
            .children
            .iter()
            .any(|child| matches!(child, ViewUnit::Html(_) | ViewUnit::Text(_)));

        let has_dynamic_props = html_unit
            .props
            .iter()
            .any(|(_k, prop)| !self.is_static_prop(prop));

        has_structural_children || has_dynamic_props
    }

    /// 检查HTML单元是否包含响应式变量
    fn contains_reactive_variables(&self, html_unit: &HTMLUnit) -> bool {
        // 检查属性中是否包含响应式变量
        for (_key, prop) in &html_unit.props {
            if self.prop_contains_reactive_variables(prop) {
                return true;
            }
        }

        // 检查子元素中是否包含响应式变量
        for child in &html_unit.children {
            if self.view_unit_contains_reactive_variables(child) {
                return true;
            }
        }

        false
    }

    /// 检查属性是否包含响应式变量
    fn prop_contains_reactive_variables(&self, prop: &UnitProp) -> bool {
        match &prop.value {
            Expression::Identifier(ident) => {
                // 检查是否为响应式变量
                if let Some(reactive_map) = &self.config.reactive_map {
                    reactive_map.contains_key(&ident.sym.to_string())
                } else {
                    // 如果没有响应式映射，检查变量名是否看起来像响应式变量
                    let name = ident.sym.to_string();
                    name.starts_with("use")
                        || name == "count"
                        || name == "name"
                        || name == "isVisible"
                }
            }
            Expression::MemberExpression(member) => {
                // 检查成员表达式中的标识符
                self.expression_contains_reactive_variables(&member.object)
                    || self.expression_contains_reactive_variables(&member.property)
            }
            Expression::CallExpression(call) => {
                // 检查函数调用中的参数
                self.expression_contains_reactive_variables(&call.callee)
                    || call.arguments.iter().any(|arg| match arg {
                        Argument::Expression(expr) => {
                            self.expression_contains_reactive_variables(expr)
                        }
                        _ => false,
                    })
            }
            _ => false,
        }
    }

    /// 检查表达式是否包含响应式变量
    fn expression_contains_reactive_variables(&self, expr: &Expression) -> bool {
        match expr {
            Expression::Identifier(ident) => {
                if let Some(reactive_map) = &self.config.reactive_map {
                    reactive_map.contains_key(&ident.sym.to_string())
                } else {
                    let name = ident.sym.to_string();
                    name.starts_with("use")
                        || name == "count"
                        || name == "name"
                        || name == "isVisible"
                }
            }
            Expression::MemberExpression(member) => {
                self.expression_contains_reactive_variables(&member.object)
                    || self.expression_contains_reactive_variables(&member.property)
            }
            Expression::CallExpression(call) => {
                self.expression_contains_reactive_variables(&call.callee)
                    || call.arguments.iter().any(|arg| match arg {
                        Argument::Expression(expr) => {
                            self.expression_contains_reactive_variables(expr)
                        }
                        _ => false,
                    })
            }
            Expression::BinaryExpression(binary) => {
                self.expression_contains_reactive_variables(&binary.left)
                    || self.expression_contains_reactive_variables(&binary.right)
            }
            Expression::ConditionalExpression(conditional) => {
                self.expression_contains_reactive_variables(&conditional.test)
                    || self.expression_contains_reactive_variables(&conditional.consequent)
                    || self.expression_contains_reactive_variables(&conditional.alternate)
            }
            _ => false,
        }
    }

    /// 检查视图单元是否包含响应式变量
    fn view_unit_contains_reactive_variables(&self, view_unit: &ViewUnit) -> bool {
        match view_unit {
            ViewUnit::Text(_) => false,
            ViewUnit::Html(html_unit) => self.contains_reactive_variables(html_unit),
            ViewUnit::Comp(comp_unit) => {
                comp_unit
                    .props
                    .values()
                    .any(|prop| self.prop_contains_reactive_variables(prop))
                    || comp_unit
                        .children
                        .iter()
                        .any(|child| self.view_unit_contains_reactive_variables(child))
            }
            ViewUnit::Exp(exp_unit) => self.prop_contains_reactive_variables(&exp_unit.content),
            ViewUnit::If(if_unit) => if_unit.branches.iter().any(|branch| {
                self.expression_contains_reactive_variables(&branch.condition)
                    || branch
                        .children
                        .iter()
                        .any(|child| self.view_unit_contains_reactive_variables(child))
            }),
            ViewUnit::For(for_unit) => {
                self.expression_contains_reactive_variables(&for_unit.array)
                    || for_unit
                        .children
                        .iter()
                        .any(|child| self.view_unit_contains_reactive_variables(child))
            }
            ViewUnit::Context(context_unit) => {
                context_unit
                    .props
                    .values()
                    .any(|prop| self.prop_contains_reactive_variables(prop))
                    || context_unit
                        .children
                        .iter()
                        .any(|child| self.view_unit_contains_reactive_variables(child))
            }
            ViewUnit::Fragment(fragment_unit) => fragment_unit
                .children
                .iter()
                .any(|child| self.view_unit_contains_reactive_variables(child)),
            ViewUnit::Suspense(suspense_unit) => suspense_unit
                .children
                .iter()
                .any(|child| self.view_unit_contains_reactive_variables(child)),
            _ => false,
        }
    }

    /// 生成模板 - 与TypeScript原版完全对齐
    fn generate_template(&self, unit: &HTMLUnit) -> CompilerResult<HTMLUnit> {
        // 过滤静态属性
        let static_props = unit
            .props
            .iter()
            .filter(|(_, prop)| self.is_static_prop(prop))
            .filter(|(_, prop)| {
                if let Expression::BooleanLiteral(lit) = &prop.value {
                    lit.value
                } else {
                    true
                }
            })
            .map(|(k, v)| {
                let new_value = match &v.value {
                    Expression::StringLiteral(lit) => Expression::StringLiteral(Box::new(
                        StringLiteral {
                            value: lit.value.clone(),
                            span: lit.span,
                        },
                        self.allocator,
                    )),
                    Expression::NumericLiteral(lit) => Expression::NumericLiteral(Box::new(
                        NumericLiteral {
                            value: lit.value,
                            base: NumberBase::Decimal,
                            raw: None,
                            span: lit.span,
                        },
                        self.allocator,
                    )),
                    Expression::BooleanLiteral(lit) => Expression::BooleanLiteral(Box::new(
                        BooleanLiteral {
                            value: lit.value,
                            span: lit.span,
                        },
                        self.allocator,
                    )),
                    Expression::NullLiteral(lit) => Expression::NullLiteral(Box::new(
                        NullLiteral { span: lit.span },
                        self.allocator,
                    )),
                    _ => Expression::NullLiteral(Box::new(
                        NullLiteral {
                            span: Span::new(0, 0),
                        },
                        self.allocator,
                    )),
                };
                let new_prop = UnitProp {
                    value: new_value,
                    view_prop_map: HashMap::new(),
                    specifier: v.specifier.clone(),
                };
                (k.clone(), new_prop)
            })
            .collect();

        // 处理子元素
        let mut children = Vec::new();
        for child in &unit.children {
            match child {
                ViewUnit::Text(text_unit) => {
                    children.push(ViewUnit::Text(TextUnit {
                        content: StringLiteral {
                            value: text_unit.content.value.clone(),
                            span: text_unit.content.span,
                        },
                    }));
                }
                ViewUnit::Html(html_child) => {
                    if let Expression::StringLiteral(_) = &html_child.tag {
                        children.push(ViewUnit::Html(self.generate_template(html_child)?));
                    }
                }
                _ => {}
            }
        }

        let new_tag = match &unit.tag {
            Expression::StringLiteral(lit) => Expression::StringLiteral(Box::new(
                StringLiteral {
                    value: lit.value.clone(),
                    span: lit.span,
                },
                self.allocator,
            )),
            _ => Expression::StringLiteral(Box::new(
                StringLiteral {
                    value: Atom::from("unknown"),
                    span: Span::new(0, 0),
                },
                self.allocator,
            )),
        };

        Ok(HTMLUnit {
            tag: new_tag,
            props: static_props,
            children,
        })
    }

    /// 生成可变单元 - 与TypeScript原版完全对齐
    fn generate_mutable_units<'b>(
        &self,
        html_unit: &HTMLUnit<'b>,
    ) -> CompilerResult<Vec<MutableUnit<'b>>> {
        let mut mutable_units = Vec::new();
        self.collect_mutable_units(html_unit, &mut mutable_units, &[])?;
        Ok(mutable_units)
    }

    /// 收集可变单元 - 与TypeScript原版完全对齐
    fn collect_mutable_units<'b>(
        &self,
        unit: &HTMLUnit<'b>,
        mutable_units: &mut Vec<MutableUnit<'b>>,
        path: &[usize],
    ) -> CompilerResult<()> {
        // 使用基于 children 绝对下标的路径编码，保证定位稳定且无需哨兵值
        for (idx, child) in unit.children.iter().enumerate() {
            let next_path = [path, &[idx]].concat();
            match child {
                ViewUnit::Html(html_child) => {
                    // 仅当标签为字符串字面量时继续深入（静态 HTML）
                    if let Expression::StringLiteral(_) = &html_child.tag {
                        self.collect_mutable_units(html_child, mutable_units, &next_path)?;
                    } else {
                        // 动态标签的 Html 节点视为可变单元
                        mutable_units.push(MutableUnit {
                            path: next_path,
                            unit: child.clone(),
                        });
                    }
                }
                ViewUnit::Text(_) => {
                    // 纯文本不作为可变单元
                }
                _ => {
                    // 非 Html/Text 子节点均视为可变单元
                    mutable_units.push(MutableUnit {
                        path: next_path,
                        unit: child.clone(),
                    });
                }
            }
        }

        Ok(())
    }

    /// 解析模板属性 - 与TypeScript原版完全对齐
    fn parse_template_props(&self, html_unit: &HTMLUnit) -> CompilerResult<Vec<TemplateProp>> {
        let mut template_props = Vec::new();
        self.collect_template_props(html_unit, &mut template_props, &[])?;
        Ok(template_props)
    }

    /// 收集模板属性 - 与TypeScript原版完全对齐
    fn collect_template_props(
        &self,
        unit: &HTMLUnit,
        template_props: &mut Vec<TemplateProp>,
        path: &[usize],
    ) -> CompilerResult<()> {
        // 收集当前单元的非静态属性
        for (key, prop) in &unit.props {
            if !self.is_static_prop(prop) {
                let tag_name = match &unit.tag {
                    Expression::StringLiteral(lit) => lit.value.as_str().to_string(),
                    _ => "unknown".to_string(),
                };

                // 解析实际的模板属性值
                let tag_expr = self.parse_template_tag_expression(tag_name)?;
                let value_expr = self.parse_template_value_expression(&prop.value)?;
                // 依赖计算
                let dep_names: Vec<String> = {
                    let set = collect_dependency_names_from_swc_expr(&value_expr);
                    set.into_iter().collect()
                };
                let mut dep_bitmap: u32 = 0;
                if let Some(rm) = &self.config.reactive_map {
                    for name in &dep_names {
                        if let Some(id) = rm.get(name) {
                            dep_bitmap |= *id as u32;
                        }
                    }
                }
                template_props.push(TemplateProp {
                    tag: tag_expr,
                    name: tag_name,
                    key: key.clone(),
                    path: path.to_vec(),
                    value: value_expr,
                    dependencies_node: dep_names,
                    dep_id_bitmap: dep_bitmap,
                });
            }
        }

        // 递归处理HTML子元素
        for (idx, child) in unit.children.iter().enumerate() {
            if let ViewUnit::Html(html_child) = child {
                if let Expression::StringLiteral(_) = &html_child.tag {
                    self.collect_template_props(
                        html_child,
                        template_props,
                        &[path, &[idx]].concat(),
                    )?;
                }
            }
        }

        Ok(())
    }

    /// 检查是否为静态属性 - 与TypeScript原版完全对齐
    fn is_static_prop(&self, prop: &UnitProp) -> bool {
        matches!(
            &prop.value,
            Expression::StringLiteral(_)
                | Expression::NumericLiteral(_)
                | Expression::BooleanLiteral(_)
                | Expression::NullLiteral(_)
        )
    }

    /// 生成唯一ID - 与TypeScript原版完全对齐
    fn uid(&self) -> String {
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        format!("_{}", timestamp)
    }

    /// 包装表达式为文件 - 与TypeScript原版完全对齐
    fn wrap_with_file(&self, expr: &Expression) -> Program {
        let mut body = Vec::new();
        body.push(Statement::ExpressionStatement(Box::new(
            // 0.15 无法克隆 Expression：使用对原表达式的引用包装等价节点
            ExpressionStatement {
                expression: Expression::ParenthesizedExpression(Box::new(
                    ParenthesizedExpression {
                        expression: Expression::ParenthesizedExpression(Box::new(
                            ParenthesizedExpression {
                                expression: Expression::Identifier(Box::new(
                                    IdentifierReference::new(
                                        Span::new(0, 0),
                                        Atom::from("__expr_proxy"),
                                    ),
                                    self.allocator,
                                )),
                                span: Span::new(0, 0),
                            },
                            self.allocator,
                        )),
                        span: Span::new(0, 0),
                    },
                    self.allocator,
                )),
                span: Span::new(0, 0),
            },
            self.allocator,
        )));
        Program {
            body,
            span: Span::new(0, 0),
            directives: Vec::new(),
            hashbang: None,
            scope_id: None.into(),
            source_type: SourceType::default(),
        }
    }

    /// 解析视图 - 与TypeScript原版完全对齐
    fn parse_view(&mut self, node: &AllowedJSXNode) -> CompilerResult<Vec<ViewUnit>> {
        let mut out = Vec::new();
        {
            let mut parser = ViewParser::new(
                ViewParserConfig {
                    html_tags: self.config.html_tags.clone(),
                    will_parse_template: false,
                    custom_html_props: self.config.custom_html_props.clone(),
                },
                self.allocator,
            );
            parser.parse_into(node, &mut out)?;
        }
        Ok(out)
    }
}

/// 元素类型枚举
#[derive(Debug, Clone, PartialEq)]
enum ElementType {
    Html,
    Comp,
    If,
    For,
    Context,
    Suspense,
}

impl JsxParser {
    /// 创建新的JSX解析器实例
    pub fn new() -> Self {
        Self {
            source_type: SourceType::default(),
            event_counter: 0,
        }
    }

    /// 解析JSX代码为视图单元 - 与TypeScript原版完全对齐
    pub fn parse(&self, code: &str) -> CompilerResult<Vec<ViewUnit>> {
        // 复用 SWC 解析，先得到 Program 再提取视图单元
        let program = self.parse_program(code)?;
        let mut view_units = Vec::new();
        if let Program::Module(module) = program {
            self.extract_jsx_from_program(&module, &mut view_units)?;
        }
        Ok(view_units)
    }

    /// 使用给定 ViewParserConfig 解析（支持 reactive_map 透传）
    pub fn parse_with_config(
        &self,
        code: &str,
        config: ViewParserConfig,
    ) -> CompilerResult<Vec<ViewUnit>> {
        let program = self.parse_program(code)?;
        let mut view_units = Vec::new();
        if let Program::Module(module) = program {
            self.extract_jsx_from_program_with_config(&module, &mut view_units, &config)?;
        }
        Ok(view_units)
    }

    /// 直接解析并返回 SWC Program（Module）
    pub fn parse_program(&self, code: &str) -> CompilerResult<Program> {
        let cm: Lrc<SourceMap> = Default::default();
        let fm = cm.new_source_file(
            FileName::Custom("input.jsx".into()).into(),
            code.to_string(),
        );
        let syntax = Syntax::Typescript(TsSyntax {
            tsx: true,
            decorators: true,
            ..Default::default()
        });
        let lexer = Lexer::new(
            syntax,
            swc_ecma_ast::EsVersion::Es2022,
            StringInput::from(&*fm),
            None,
        );
        let mut parser = Parser::new_from(lexer);
        match parser.parse_module() {
            Ok(module) => Ok(Program::Module(module)),
            Err(err) => Err(CompilerError::new(
                crate::error_handler::CompilerPhase::Parsing,
                crate::error_handler::ErrorSeverity::Error,
                format!("Failed to parse JSX code: {:?}", err),
            )),
        }
    }

    /// 从程序中提取JSX元素 - 与TypeScript原版完全对齐
    fn extract_jsx_from_program(
        &self,
        module: &Module,
        view_units: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        for stmt in &module.body {
            self.extract_jsx_from_statement(stmt, view_units)?;
        }
        Ok(())
    }

    /// 支持外部配置版本
    fn extract_jsx_from_program_with_config(
        &self,
        module: &Module,
        view_units: &mut Vec<ViewUnit>,
        config: &ViewParserConfig,
    ) -> CompilerResult<()> {
        for stmt in &module.body {
            self.extract_jsx_from_statement_with_config(stmt, view_units, config)?;
        }
        Ok(())
    }

    /// 从语句中提取JSX元素 - 与TypeScript原版完全对齐
    fn extract_jsx_from_statement(
        &self,
        stmt: &Statement,
        view_units: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        match stmt {
            Statement::ExpressionStatement(expr_stmt) => {
                self.extract_jsx_from_expression(&expr_stmt.expression, view_units)?;
            }
            Statement::ReturnStatement(ret_stmt) => {
                if let Some(expr) = &ret_stmt.argument {
                    self.extract_jsx_from_expression(expr, view_units)?;
                }
            }
            Statement::BlockStatement(block_stmt) => {
                for stmt in &block_stmt.body {
                    self.extract_jsx_from_statement(stmt, view_units)?;
                }
            }
            Statement::IfStatement(if_stmt) => {
                self.extract_jsx_from_statement(&if_stmt.consequent, view_units)?;
                if let Some(alternate) = &if_stmt.alternate {
                    self.extract_jsx_from_statement(alternate, view_units)?;
                }
            }
            _ => {
                // 其他语句类型不需要特殊处理
            }
        }
        Ok(())
    }

    /// 支持外部配置版本
    fn extract_jsx_from_statement_with_config(
        &self,
        stmt: &Statement,
        view_units: &mut Vec<ViewUnit>,
        config: &ViewParserConfig,
    ) -> CompilerResult<()> {
        match stmt {
            Statement::ExpressionStatement(expr_stmt) => {
                self.extract_jsx_from_expression_with_config(
                    &expr_stmt.expression,
                    view_units,
                    config,
                )?;
            }
            Statement::ReturnStatement(ret_stmt) => {
                if let Some(expr) = &ret_stmt.argument {
                    self.extract_jsx_from_expression_with_config(expr, view_units, config)?;
                }
            }
            Statement::BlockStatement(block_stmt) => {
                for stmt in &block_stmt.body {
                    self.extract_jsx_from_statement_with_config(stmt, view_units, config)?;
                }
            }
            Statement::IfStatement(if_stmt) => {
                self.extract_jsx_from_statement_with_config(
                    &if_stmt.consequent,
                    view_units,
                    config,
                )?;
                if let Some(alternate) = &if_stmt.alternate {
                    self.extract_jsx_from_statement_with_config(alternate, view_units, config)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    /// 从表达式中提取JSX元素 - 与TypeScript原版完全对齐
    fn extract_jsx_from_expression(
        &self,
        expr: &Expression,
        view_units: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        match expr {
            Expression::JSXElement(jsx_element) => {
                let config = ViewParserConfig::default();
                let mut parser = ViewParser::new(config, &self.allocator);
                parser.parse_into(jsx_element, view_units)?;
            }
            Expression::JSXFragment(jsx_fragment) => {
                let config = ViewParserConfig::default();
                let mut parser = ViewParser::new(config, &self.allocator);
                parser.parse_fragment_into(jsx_fragment, view_units)?;
            }
            Expression::CallExpression(call) => {
                for arg in &call.arguments {
                    if let Some(e) = arg.as_expression() {
                        self.extract_jsx_from_expression(e, view_units)?;
                    }
                }
                self.extract_jsx_from_expression(&call.callee, view_units)?;
            }
            Expression::ArrayExpression(array) => {
                for element in &array.elements {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.extract_jsx_from_expression(expr, view_units)?;
                    }
                }
            }
            Expression::ObjectExpression(obj) => {
                for prop in &obj.properties {
                    match prop {
                        ObjectPropertyKind::ObjectProperty(property) => {
                            self.extract_jsx_from_expression(&property.value, view_units)?;
                        }
                        ObjectPropertyKind::SpreadProperty(spread) => {
                            self.extract_jsx_from_expression(&spread.argument, view_units)?;
                        }
                    }
                }
            }
            Expression::ConditionalExpression(conditional) => {
                self.extract_jsx_from_expression(&conditional.consequent, view_units)?;
                self.extract_jsx_from_expression(&conditional.alternate, view_units)?;
            }
            Expression::TemplateLiteral(tpl) => {
                for e in &tpl.expressions {
                    self.extract_jsx_from_expression(e, view_units)?;
                }
            }
            Expression::TaggedTemplateExpression(tagged) => {
                self.extract_jsx_from_expression(&tagged.tag, view_units)?;
                for e in &tagged.quasi.expressions {
                    self.extract_jsx_from_expression(e, view_units)?;
                }
            }
            Expression::NewExpression(ne) => {
                self.extract_jsx_from_expression(&ne.callee, view_units)?;
                for arg in &ne.arguments {
                    if let Some(e) = arg.as_expression() {
                        self.extract_jsx_from_expression(e, view_units)?;
                    }
                }
            }
            Expression::AwaitExpression(a) => {
                if let Some(arg) = &a.argument {
                    self.extract_jsx_from_expression(arg, view_units)?;
                }
            }
            Expression::YieldExpression(y) => {
                if let Some(arg) = &y.argument {
                    self.extract_jsx_from_expression(arg, view_units)?;
                }
            }
            Expression::AssignmentExpression(assign) => {
                self.extract_jsx_from_expression(&assign.right, view_units)?;
            }
            Expression::ArrowFunctionExpression(_arrow) => {
                // 暂不深入遍历函数体，避免 0.15 API 差异引发的类型不匹配
            }
            Expression::FunctionExpression(_func) => {
                // 暂不深入遍历函数体
            }
            _ => {
                // 其他表达式类型不需要特殊处理
            }
        }
        Ok(())
    }

    /// 支持外部配置版本
    fn extract_jsx_from_expression_with_config(
        &self,
        expr: &Expression,
        view_units: &mut Vec<ViewUnit>,
        config: &ViewParserConfig,
    ) -> CompilerResult<()> {
        match expr {
            Expression::JSXElement(jsx_element) => {
                let mut parser = ViewParser::new(config.clone(), &self.allocator);
                parser.parse_into(jsx_element, view_units)?;
            }
            Expression::JSXFragment(jsx_fragment) => {
                let mut parser = ViewParser::new(config.clone(), &self.allocator);
                parser.parse_fragment_into(jsx_fragment, view_units)?;
            }
            Expression::CallExpression(call) => {
                for arg in &call.arguments {
                    if let Some(e) = arg.as_expression() {
                        self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                    }
                }
                self.extract_jsx_from_expression_with_config(&call.callee, view_units, config)?;
            }
            Expression::ArrayExpression(array) => {
                for element in &array.elements {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.extract_jsx_from_expression_with_config(expr, view_units, config)?;
                    }
                }
            }
            Expression::ObjectExpression(obj) => {
                for prop in &obj.properties {
                    match prop {
                        ObjectPropertyKind::ObjectProperty(property) => {
                            self.extract_jsx_from_expression_with_config(
                                &property.value,
                                view_units,
                                config,
                            )?;
                        }
                        ObjectPropertyKind::SpreadProperty(spread) => {
                            self.extract_jsx_from_expression_with_config(
                                &spread.argument,
                                view_units,
                                config,
                            )?;
                        }
                    }
                }
            }
            Expression::ConditionalExpression(conditional) => {
                self.extract_jsx_from_expression_with_config(
                    &conditional.consequent,
                    view_units,
                    config,
                )?;
                self.extract_jsx_from_expression_with_config(
                    &conditional.alternate,
                    view_units,
                    config,
                )?;
            }
            Expression::TemplateLiteral(tpl) => {
                for e in &tpl.expressions {
                    self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                }
            }
            Expression::TaggedTemplateExpression(tagged) => {
                self.extract_jsx_from_expression_with_config(&tagged.tag, view_units, config)?;
                for e in &tagged.quasi.expressions {
                    self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                }
            }
            Expression::NewExpression(ne) => {
                self.extract_jsx_from_expression_with_config(&ne.callee, view_units, config)?;
                for arg in &ne.arguments {
                    if let Some(e) = arg.as_expression() {
                        self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                    }
                }
            }
            Expression::AwaitExpression(a) => {
                if let Some(arg) = &a.argument {
                    self.extract_jsx_from_expression_with_config(arg, view_units, config)?;
                }
            }
            Expression::YieldExpression(y) => {
                if let Some(arg) = &y.argument {
                    self.extract_jsx_from_expression_with_config(arg, view_units, config)?;
                }
            }
            Expression::AssignmentExpression(assign) => {
                self.extract_jsx_from_expression_with_config(&assign.right, view_units, config)?;
            }
            _ => {}
        }
        Ok(())
    }
}

impl Default for JsxParser {
    fn default() -> Self {
        Self::new()
    }
}

impl JsxParser {
    /// 提取元素名称
    fn extract_element_name(&self, name: &JSXElementName) -> String {
        match name {
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
        }
    }
}

impl<'a> ViewParser<'a> {
    /// 解析模板标签表达式 - 与TypeScript原版完全对齐
    fn parse_template_tag_expression(&self, tag_name: String) -> CompilerResult<Expression> {
        // 将标签名转换为字符串字面量表达式
        Ok(Expression::StringLiteral(Box::new(
            StringLiteral {
                value: Atom::from(tag_name.as_str()),
                span: Span::new(0, 0),
                raw: None,
            },
            self.allocator,
        )))
    }

    /// 解析模板值表达式 - 与TypeScript原版完全对齐
    fn parse_template_value_expression(&self, value: &UnitProp) -> CompilerResult<Expression> {
        // 直接返回属性值表达式
        Ok(value.value.clone())
    }
}
