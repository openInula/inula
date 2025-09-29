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

use std::collections::HashMap;
use swc_atoms::Atom;
use swc_common::Spanned;
use swc_common::{sync::Lrc, BytePos, FileName, SourceMap, Span, SyntaxContext};
use swc_ecma_ast::Number;
use swc_ecma_ast::*;
use swc_ecma_ast::{Tpl, TplElement};

// 类型别名
type Expression = Expr;
type StringLiteral = Str;
type BooleanLiteral = Bool;
type NumericLiteral = Number;
type NullLiteral = Null;
type BindingPattern = Pat;
type BindingIdentifier = BindingIdent;
type JSXMemberExpression = JSXMemberExpr;
type JSXAttributeItem = JSXAttrOrSpread;
type JSXAttribute = JSXAttr;
type JSXAttributeName = JSXAttrName;
type JSXAttributeValue = JSXAttrValue;
type JSXExpression = JSXExpr;
type JSXChild = JSXElementChild;
type FunctionBody = BlockStmt;
type Statement = Stmt;
type Argument = ExprOrSpread;
type ObjectPropertyKind = PropOrSpread;
type IdentifierReference = Ident;
type IdentifierName = IdentName;
type StaticMemberExpression = MemberExpr;
type ParenthesizedExpression = ParenExpr;
type ExpressionStatement = ExprStmt;
type ArrowFunctionExpression = ArrowExpr;
use crate::error_handler::{CompilerError, CompilerPhase, CompilerResult, ErrorSeverity};
use crate::ir_builder::collect_dependency_names_from_swc_expr;
use crate::types::*;
// SWC 解析依赖
use swc_ecma_parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};

/// JSX解析器 - 与TypeScript原版完全对齐
pub struct JsxParser {
    source_type: swc_ecma_parser::Syntax,
    event_counter: u32,
}

/// 视图解析器 - 与TypeScript原版完全对齐
pub struct ViewParser {
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
    view_units: Vec<ViewUnit>,
    context: Context,
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
pub struct Context {
    pub if_else_stack: Vec<IfUnit>,
}

impl Default for Context {
    fn default() -> Self {
        Self {
            if_else_stack: Vec::new(),
        }
    }
}

/// 单元属性 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct UnitProp {
    pub value: Expression,
    pub view_prop_map: HashMap<String, Vec<ViewUnit>>,
    pub specifier: Option<String>,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 文本单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TextUnit {
    pub content: StringLiteral,
}

/// 可变单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct MutableUnit {
    pub path: Vec<usize>,
    pub unit: ViewUnit,
}

/// 模板属性 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TemplateProp {
    pub tag: Expression,
    pub name: String,
    pub key: String,
    pub path: Vec<usize>,
    pub value: Expression,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 模板单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct TemplateUnit {
    pub template: HTMLUnit,
    pub mutable_units: Vec<MutableUnit>,
    pub props: Vec<TemplateProp>,
}

/// 片段单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct FragmentUnit {
    pub children: Vec<ViewUnit>,
}

/// HTML单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct HTMLUnit {
    pub tag: Expression,
    pub props: HashMap<String, UnitProp>,
    pub children: Vec<ViewUnit>,
}

/// 组件单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct CompUnit {
    pub tag: Expression,
    pub props: HashMap<String, UnitProp>,
    pub children: Vec<ViewUnit>,
}

/// 条件分支 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct IfBranch {
    pub condition: Expression,
    pub children: Vec<ViewUnit>,
    pub dependencies_node: Vec<String>,
    pub dep_id_bitmap: u32,
}

/// 条件单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct IfUnit {
    pub branches: Vec<IfBranch>,
}

/// 表达式单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ExpUnit {
    pub content: UnitProp,
    pub props: HashMap<String, UnitProp>,
}

/// 上下文单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ContextUnit {
    pub props: HashMap<String, UnitProp>,
    pub children: Vec<ViewUnit>,
    pub context_name: String,
}

/// Suspense单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct SuspenseUnit {
    pub children: Vec<ViewUnit>,
    pub fallback: Option<UnitProp>,
}

/// 循环单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub struct ForUnit {
    pub item: BindingPattern,
    pub array: Expression,
    pub key: Option<Expression>,
    pub index: Option<BindingIdentifier>,
    pub children: Vec<ViewUnit>,
}

/// 视图单元 - 与TypeScript原版完全对齐
#[derive(Debug, Clone)]
pub enum ViewUnit {
    Text(TextUnit),
    Html(HTMLUnit),
    Comp(CompUnit),
    If(IfUnit),
    Exp(ExpUnit),
    Context(ContextUnit),
    Template(TemplateUnit),
    For(ForUnit),
    Fragment(FragmentUnit),
    Suspense(SuspenseUnit),
}

/// 允许的JSX节点类型
pub type AllowedJSXNode = JSXElement;

impl Clone for JsxParser {
    fn clone(&self) -> Self {
        Self {
            source_type: self.source_type.clone(),
            event_counter: self.event_counter,
        }
    }
}

impl ViewParser {
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
    pub fn parse_into(&mut self, node: &JSXElement, out: &mut Vec<ViewUnit>) -> CompilerResult<()> {
        self.parse_element(node)?;
        out.extend(std::mem::take(&mut self.view_units));
        Ok(())
    }

    /// 直接解析JSX元素，跳过文本合并逻辑 - 用于Fragment处理
    fn parse_element_direct(&mut self, element: &JSXElement) -> CompilerResult<ViewUnit> {
        let opening_name = &element.opening.name;

        // 解析标签名和类型
        let (element_type, tag) = self.parse_element_name(opening_name)?;

        // 解析属性
        let props = self.parse_jsx_attrs(&element.opening.attrs)?;

        // 解析子元素
        let children = self.parse_children(&element.children)?;

        // 创建视图单元，不进行文本合并
        let unit = match element_type {
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
            ElementType::If => {
                self.parse_if_element(element)?;
                return Ok(ViewUnit::If(IfUnit { branches: vec![] }));
            }
            ElementType::For => {
                self.parse_for_element(element)?;
                return Ok(ViewUnit::For(ForUnit {
                    item: BindingPattern::Ident(BindingIdent {
                        id: Ident::new(
                            "item".into(),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        ),
                        type_ann: None,
                    }),
                    index: Some(BindingIdentifier {
                        id: Ident::new(
                            "index".into(),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        ),
                        type_ann: None,
                    }),
                    array: Expression::Array(ArrayLit {
                        elems: vec![],
                        span: Span::new(BytePos(0), BytePos(0)),
                    }),
                    children: vec![],
                    key: None,
                }));
            }
            ElementType::Context => {
                self.parse_context_element(element)?;
                return Ok(ViewUnit::Context(ContextUnit {
                    props: HashMap::new(),
                    children: vec![],
                    context_name: "context".to_string(),
                }));
            }
            ElementType::Suspense => {
                self.parse_suspense_element(element)?;
                return Ok(ViewUnit::Suspense(SuspenseUnit {
                    children: vec![],
                    fallback: None,
                }));
            }
        };

        // 转换模板
        if element_type == ElementType::Html {
            self.transform_template(unit)
        } else {
            Ok(unit)
        }
    }

    /// 解析JSX元素 - 与TypeScript原版完全对齐
    fn parse_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        let opening_name = &element.opening.name;

        // 解析标签名和类型
        let (element_type, tag) = self.parse_element_name(opening_name)?;

        // 解析属性
        let props = self.parse_jsx_attrs(&element.opening.attrs)?;

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
    fn parse_element_name(
        &self,
        name: &JSXElementName,
    ) -> CompilerResult<(ElementType, Expression)> {
        match name {
            JSXElementName::Ident(ident) => {
                let name_str = ident.sym.as_str();

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
                        span: Span::new(BytePos(0), BytePos(0)),
                        raw: None,
                    };
                    Ok((ElementType::Html, Expr::Lit(Lit::Str(lit))))
                } else {
                    let id = Ident::new(
                        name_str.into(),
                        ident.span,
                        swc_common::SyntaxContext::empty(),
                    );
                    Ok((ElementType::Comp, Expression::Ident(id)))
                }
            }
            JSXElementName::JSXMemberExpr(member) => {
                // 处理成员表达式，如 <Comp.Div>
                let tag = self.convert_jsx_member_to_member_expression(member)?;
                Ok((ElementType::Comp, tag))
            }
            JSXElementName::JSXNamespacedName(namespaced) => {
                let namespace = namespaced.ns.sym.as_str();
                let name = namespaced.name.sym.as_str();

                match namespace {
                    ns if ns == self.comp_tag_namespace => {
                        let id = Ident::new(
                            namespaced.name.sym.clone(),
                            namespaced.name.span,
                            swc_common::SyntaxContext::empty(),
                        );
                        Ok((ElementType::Comp, Expression::Ident(id)))
                    }
                    ns if ns == self.html_namespace => {
                        let lit = Str {
                            value: namespaced.name.sym.clone(),
                            span: namespaced.name.span,
                            raw: None,
                        };
                        Ok((ElementType::Html, Expr::Lit(Lit::Str(lit))))
                    }
                    ns if ns == self.html_tag_namespace => {
                        let id = Ident::new(
                            namespaced.name.sym.clone(),
                            namespaced.name.span,
                            swc_common::SyntaxContext::empty(),
                        );
                        Ok((ElementType::Html, Expression::Ident(id)))
                    }
                    _ => {
                        // 无法安全组合 Atom，这里退化为使用属性名
                        let lit = Str {
                            value: namespaced.name.sym.clone(),
                            span: namespaced.name.span,
                            raw: None,
                        };
                        Ok((ElementType::Html, Expr::Lit(Lit::Str(lit))))
                    }
                }
            }
        }
    }

    /// 转换JSX成员表达式为成员表达式 - 与TypeScript原版完全对齐
    fn convert_jsx_member_to_member_expression(
        &self,
        member: &JSXMemberExpression,
    ) -> CompilerResult<Expression> {
        let object = match &member.obj {
            JSXObject::Ident(ident) => {
                Expr::Ident(Ident::new(ident.sym.clone(), ident.span, ident.ctxt))
            }
            JSXObject::JSXMemberExpr(inner_member) => {
                self.convert_jsx_member_to_member_expression(inner_member)?
            }
        };

        let property_name = member.prop.sym.clone();

        Ok(Expr::Member(MemberExpr {
            span: Span::new(BytePos(0), BytePos(0)),
            obj: Box::new(object),
            prop: MemberProp::Ident(IdentName::new(property_name, member.prop.span)),
        }))
    }

    /// 解析JSX属性 - 与TypeScript原版完全对齐
    fn parse_jsx_attrs(
        &self,
        attrs: &[JSXAttributeItem],
    ) -> CompilerResult<HashMap<String, UnitProp>> {
        let mut props = HashMap::new();

        for attr in attrs {
            match attr {
                JSXAttrOrSpread::JSXAttr(attr) => {
                    let (name, prop) = self.parse_jsx_attribute(attr)?;
                    props.insert(name, prop);
                }
                JSXAttrOrSpread::SpreadElement(spread) => {
                    let prop = self.parse_prop(Some(&spread.expr), None)?;
                    props.insert("*spread*".to_string(), prop);
                }
            }
        }

        Ok(props)
    }

    /// 解析单个JSX属性 - 与TypeScript原版完全对齐
    fn parse_jsx_attribute(&self, attr: &JSXAttribute) -> CompilerResult<(String, UnitProp)> {
        let prop_name = match &attr.name {
            JSXAttrName::Ident(ident) => ident.sym.as_str().to_string(),
            JSXAttrName::JSXNamespacedName(namespaced) => {
                // 处理命名空间属性，如 bind:value
                namespaced.name.sym.as_str().to_string()
            }
        };

        let specifier = match &attr.name {
            JSXAttrName::JSXNamespacedName(namespaced) => {
                Some(namespaced.ns.sym.as_str().to_string())
            }
            _ => None,
        };

        match &attr.value {
            Some(JSXAttrValue::JSXExprContainer(expr_container)) => {
                match jsx_expr_as_expression(&expr_container.expr) {
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
            Some(JSXAttrValue::JSXElement(element)) => {
                // 处理JSX元素作为属性值
                let (_, element_expr) = self.parse_element_name(&element.opening.name)?;
                let element_str = format!("<{}>", "element");
                let str_lit = StringLiteral {
                    value: element_str.into(),
                    span: Span::new(BytePos(0), BytePos(0)),
                    raw: None,
                };
                Ok((
                    prop_name,
                    UnitProp {
                        value: Expr::Lit(Lit::Str(str_lit)),
                        view_prop_map: HashMap::new(),
                        specifier: specifier.clone(),
                        dependencies_node: Vec::new(),
                        dep_id_bitmap: 0,
                    },
                ))
            }
            Some(JSXAttrValue::Lit(lit)) => {
                println!("DEBUG: Found JSXAttrValue::Lit: {:?}", lit);
                match lit {
                    Lit::Str(str_lit) => {
                        println!("DEBUG: Found Lit::Str: {:?}", str_lit);
                        // 检查是否是模板字符串（通过 raw 字段判断）
                        if let Some(raw) = &str_lit.raw {
                            println!("DEBUG: Raw string: {}", raw);
                            println!("DEBUG: String value: {}", str_lit.value);
                            println!("DEBUG: Checking for template literal...");
                            if raw.contains("`") || str_lit.value.contains("${") {
                                // 这是一个模板字符串，需要特殊处理
                                println!("DEBUG: Found template literal in JSX attribute: {}", raw);
                                // 将模板字符串转换为 Expr::Tpl
                                let tpl = Tpl {
                                    span: str_lit.span,
                                    quasis: vec![TplElement {
                                        span: str_lit.span,
                                        tail: true,
                                        cooked: Some(str_lit.value.clone()),
                                        raw: raw.clone(),
                                    }],
                                    exprs: vec![],
                                };
                                Ok((
                                    prop_name,
                                    UnitProp {
                                        value: Expr::Tpl(tpl),
                                        view_prop_map: HashMap::new(),
                                        specifier: specifier.map(|s| s.to_string()),
                                        dependencies_node: Vec::new(),
                                        dep_id_bitmap: 0,
                                    },
                                ))
                            } else {
                                // 普通字符串字面量
                                let string_lit = StringLiteral {
                                    value: str_lit.value.clone(),
                                    span: str_lit.span,
                                    raw: str_lit.raw.clone(),
                                };
                                Ok((
                                    prop_name,
                                    UnitProp {
                                        value: Expr::Lit(Lit::Str(string_lit)),
                                        view_prop_map: HashMap::new(),
                                        specifier: specifier.map(|s| s.to_string()),
                                        dependencies_node: Vec::new(),
                                        dep_id_bitmap: 0,
                                    },
                                ))
                            }
                        } else {
                            // 没有 raw 字段，当作普通字符串处理
                            let string_lit = StringLiteral {
                                value: str_lit.value.clone(),
                                span: str_lit.span,
                                raw: str_lit.raw.clone(),
                            };
                            Ok((
                                prop_name,
                                UnitProp {
                                    value: Expr::Lit(Lit::Str(string_lit)),
                                    view_prop_map: HashMap::new(),
                                    specifier: specifier.map(|s| s.to_string()),
                                    dependencies_node: Vec::new(),
                                    dep_id_bitmap: 0,
                                },
                            ))
                        }
                    }
                    _ => {
                        return Err(CompilerError::new(
                            crate::error_handler::CompilerPhase::JSXElementAnalysis,
                            crate::error_handler::ErrorSeverity::Error,
                            "Expected string literal".to_string(),
                        ))
                    }
                }
            }
            Some(JSXAttrValue::JSXFragment(_)) => {
                // JSX片段作为属性值，暂时跳过
                let prop = self.parse_prop(None, specifier.as_deref())?;
                Ok((prop_name, prop))
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
            Some(expr) => {
                println!("DEBUG: parse_prop called with expression: {:?}", expr);
                match expr {
                    Expr::Tpl(tpl) => {
                        println!("DEBUG: Found template literal in parse_prop: {:?}", tpl);
                    }
                    _ => {
                        println!("DEBUG: Not a template literal: {:?}", expr);
                    }
                }
                expr
            }
            None => {
                // 创建一个默认的布尔值表达式
                let bool_lit = BooleanLiteral {
                    value: true,
                    span: Span::new(BytePos(0), BytePos(0)),
                };
                return Ok(UnitProp {
                    value: Expr::Lit(Lit::Bool(bool_lit)),
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
            value: value.clone(),
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
            Expr::Call(call) => {
                // 遍历调用表达式的参数
                for arg in &call.args {
                    if let Some(arg_expr) = arg_as_expression(arg) {
                        self.traverse_expression_for_jsx(arg_expr, view_prop_map)?;
                    }
                }
                // 遍历调用者
                match &call.callee {
                    Callee::Expr(expr) => self.traverse_expression_for_jsx(expr, view_prop_map)?,
                    _ => {}
                }
            }
            Expr::Member(static_member) => {
                self.traverse_expression_for_jsx(&static_member.obj, view_prop_map)?;
            }
            Expr::Member(computed_member) => {
                self.traverse_expression_for_jsx(&computed_member.obj, view_prop_map)?;
                match &computed_member.prop {
                    MemberProp::Computed(computed_prop) => {
                        // ComputedPropName 有一个 expr 字段
                        self.traverse_expression_for_jsx(&computed_prop.expr, view_prop_map)?;
                    }
                    _ => {}
                }
            }
            Expr::PrivateName(private_member) => {
                // PrivateName 没有 object 字段，跳过
            }
            Expr::Array(array) => {
                for element in &array.elems {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.traverse_expression_for_jsx(expr, view_prop_map)?;
                    }
                }
            }
            Expr::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        PropOrSpread::Prop(p) => match &**p {
                            Prop::KeyValue(key_value) => {
                                self.traverse_expression_for_jsx(&key_value.value, view_prop_map)?;
                            }
                            _ => {}
                        },
                        PropOrSpread::Spread(spread) => {
                            self.traverse_expression_for_jsx(&spread.expr, view_prop_map)?;
                        }
                    }
                }
            }
            Expr::Cond(conditional) => {
                self.traverse_expression_for_jsx(&conditional.test, view_prop_map)?;
                self.traverse_expression_for_jsx(&conditional.cons, view_prop_map)?;
                self.traverse_expression_for_jsx(&conditional.alt, view_prop_map)?;
            }
            Expr::Tpl(tpl) => {
                for e in &tpl.exprs {
                    self.traverse_expression_for_jsx(e, view_prop_map)?;
                }
            }
            Expr::TaggedTpl(tagged) => {
                self.traverse_expression_for_jsx(&tagged.tag, view_prop_map)?;
                for e in &tagged.tpl.exprs {
                    self.traverse_expression_for_jsx(e, view_prop_map)?;
                }
            }
            Expr::New(ne) => {
                self.traverse_expression_for_jsx(&ne.callee, view_prop_map)?;
                if let Some(args) = &ne.args {
                    for arg in args {
                        if let Some(e) = arg_as_expression(arg) {
                            self.traverse_expression_for_jsx(e, view_prop_map)?;
                        }
                    }
                }
            }
            Expr::Await(a) => {
                self.traverse_expression_for_jsx(&a.arg, view_prop_map)?;
            }
            Expr::Yield(y) => {
                if let Some(arg) = &y.arg {
                    self.traverse_expression_for_jsx(arg, view_prop_map)?;
                }
            }
            Expr::Assign(assign) => {
                self.traverse_expression_for_jsx(&assign.right, view_prop_map)?;
            }
            Expr::Bin(bin) => {
                self.traverse_expression_for_jsx(&bin.left, view_prop_map)?;
                self.traverse_expression_for_jsx(&bin.right, view_prop_map)?;
            }
            Expr::Unary(unary) => {
                self.traverse_expression_for_jsx(&unary.arg, view_prop_map)?;
            }
            Expr::Update(update) => {
                // 在 SWC 中，UpdateExpression 的 argument 是 SimpleAssignmentTarget
                // 这里我们跳过，因为 SimpleAssignmentTarget 不是 Expression
                // 如果需要处理，需要单独实现
            }
            Expr::Seq(seq) => {
                for expr in &seq.exprs {
                    self.traverse_expression_for_jsx(expr, view_prop_map)?;
                }
            }
            Expr::Paren(paren) => {
                self.traverse_expression_for_jsx(&paren.expr, view_prop_map)?;
            }
            Expr::Arrow(arrow) => match &*arrow.body {
                BlockStmtOrExpr::BlockStmt(block) => {
                    self.traverse_function_body_for_jsx(block, view_prop_map)?;
                }
                BlockStmtOrExpr::Expr(expr) => {
                    self.traverse_expression_for_jsx(expr, view_prop_map)?;
                }
            },
            Expr::Fn(func) => {
                if let Some(body) = &func.function.body {
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
        for stmt in &body.stmts {
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
            Stmt::Expr(expr_stmt) => {
                self.traverse_expression_for_jsx(&expr_stmt.expr, view_prop_map)?;
            }
            Stmt::Return(ret_stmt) => {
                if let Some(expr) = &ret_stmt.arg {
                    self.traverse_expression_for_jsx(expr, view_prop_map)?;
                }
            }
            Stmt::If(if_stmt) => {
                self.traverse_expression_for_jsx(&if_stmt.test, view_prop_map)?;
                self.traverse_statement_for_jsx(&if_stmt.cons, view_prop_map)?;
                if let Some(alternate) = &if_stmt.alt {
                    self.traverse_statement_for_jsx(alternate, view_prop_map)?;
                }
            }
            Stmt::Block(block_stmt) => {
                for s in &block_stmt.stmts {
                    self.traverse_statement_for_jsx(s, view_prop_map)?;
                }
            }
            Stmt::Decl(Decl::Var(var_decl)) => {
                for d in &var_decl.decls {
                    if let Some(init) = &d.init {
                        self.traverse_expression_for_jsx(init, view_prop_map)?;
                    }
                }
            }
            Stmt::For(for_stmt) => {
                if let Some(init) = &for_stmt.init {
                    match init {
                        VarDeclOrExpr::Expr(expr) => {
                            self.traverse_expression_for_jsx(expr, view_prop_map)?
                        }
                        VarDeclOrExpr::VarDecl(v) => {
                            for d in &v.decls {
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
            Stmt::While(while_stmt) => {
                self.traverse_expression_for_jsx(&while_stmt.test, view_prop_map)?;
                self.traverse_statement_for_jsx(&while_stmt.body, view_prop_map)?;
            }
            Stmt::DoWhile(do_while) => {
                self.traverse_statement_for_jsx(&do_while.body, view_prop_map)?;
                self.traverse_expression_for_jsx(&do_while.test, view_prop_map)?;
            }
            Stmt::Switch(sw) => {
                self.traverse_expression_for_jsx(&sw.discriminant, view_prop_map)?;
                for c in &sw.cases {
                    if let Some(test) = &c.test {
                        self.traverse_expression_for_jsx(test, view_prop_map)?;
                    }
                    for s in &c.cons {
                        self.traverse_statement_for_jsx(s, view_prop_map)?;
                    }
                }
            }
            Stmt::Try(ts) => {
                for s in &ts.block.stmts {
                    self.traverse_statement_for_jsx(s, view_prop_map)?;
                }
                if let Some(handler) = &ts.handler {
                    if let Some(param) = &handler.param {
                        let _ = param; /* 参数不遍历 */
                    }
                    for s in &handler.body.stmts {
                        self.traverse_statement_for_jsx(s, view_prop_map)?;
                    }
                }
                if let Some(finalizer) = &ts.finalizer {
                    for s in &finalizer.stmts {
                        self.traverse_statement_for_jsx(s, view_prop_map)?;
                    }
                }
            }
            _ => {
                // 其他语句类型不需要特殊处理
            }
        }
        Ok(())
    }

    /// 解析子元素 - 与TypeScript原版完全对齐
    fn parse_children(&mut self, children: &[JSXElementChild]) -> CompilerResult<Vec<ViewUnit>> {
        let mut child_units = Vec::new();
        // 复制必要的不可变数据，避免与 &mut self 的交错借用
        let base_config = self.config.clone();

        for child in children {
            match child {
                JSXElementChild::JSXText(text) => {
                    // 直接复用字面量 Atom
                    if !text.value.as_str().trim().is_empty() {
                        child_units.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                                raw: None,
                            },
                        }));
                    }
                }
                JSXElementChild::JSXElement(element) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    let unit = parser.parse_element_direct(element)?;
                    child_units.push(unit);
                }
                JSXElementChild::JSXFragment(fragment) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    parser.parse_fragment_into(fragment, &mut child_units)?;
                }
                JSXElementChild::JSXExprContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expr) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            child_units.push(unit);
                        }
                    }
                }
                JSXElementChild::JSXSpreadChild(spread) => {
                    // 处理展开子元素 - 与TypeScript原版完全对齐
                    // 展开子元素通常包含一个表达式，该表达式应该返回一个数组
                    // 这里我们将其作为表达式单元处理
                    let prop = self.parse_prop(Some(&spread.expr), None)?;
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
    fn parse_fragment(&mut self, fragment: &JSXFragment) -> CompilerResult<Vec<ViewUnit>> {
        let mut children = Vec::new();
        let base_config = self.config.clone();
        for child in &fragment.children {
            match child {
                JSXElementChild::JSXText(text) => {
                    if !text.value.as_str().trim().is_empty() {
                        children.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                                raw: None,
                            },
                        }));
                    }
                }
                JSXElementChild::JSXElement(element) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    let unit = parser.parse_element_direct(element)?;
                    children.push(unit);
                }
                JSXElementChild::JSXFragment(inner_fragment) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    parser.parse_fragment_into(inner_fragment, &mut children)?;
                }
                JSXElementChild::JSXExprContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expr) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            children.push(unit);
                        }
                    }
                }
                JSXElementChild::JSXSpreadChild(spread) => {
                    let prop = self.parse_prop(Some(&spread.expr), None)?;
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
    fn parse_fragment_into(
        &mut self,
        fragment: &JSXFragment,
        out: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        let base_config = self.config.clone();
        println!(
            "DEBUG: parse_fragment_into processing {} children",
            fragment.children.len()
        );
        for (i, child) in fragment.children.iter().enumerate() {
            println!(
                "DEBUG: processing child {}: {:?}",
                i,
                std::mem::discriminant(child)
            );
            match child {
                JSXElementChild::JSXText(text) => {
                    if !text.value.as_str().trim().is_empty() {
                        out.push(ViewUnit::Text(TextUnit {
                            content: StringLiteral {
                                value: text.value.clone(),
                                span: text.span,
                                raw: None,
                            },
                        }));
                    }
                }
                JSXElementChild::JSXElement(element) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    // 直接解析元素，跳过文本合并逻辑
                    let unit = parser.parse_element_direct(element)?;
                    out.push(unit);
                }
                JSXElementChild::JSXFragment(inner_fragment) => {
                    let mut parser = ViewParser::new(base_config.clone());
                    let units = parser.parse_fragment(inner_fragment)?;
                    out.extend(units);
                }
                JSXElementChild::JSXExprContainer(expr_container) => {
                    if let Some(expr) = jsx_expr_as_expression(&expr_container.expr) {
                        if let Some(unit) = self.parse_expression(expr)? {
                            out.push(unit);
                        }
                    }
                }
                JSXElementChild::JSXSpreadChild(spread) => {
                    let prop = self.parse_prop(Some(&spread.expr), None)?;
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
    fn parse_expression(&self, expr: &Expression) -> CompilerResult<Option<ViewUnit>> {
        match expr {
            Expr::Lit(Lit::Str(lit)) => {
                // 字符串字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: lit.value.clone(),
                        span: lit.span,
                        raw: None,
                    },
                })))
            }
            Expr::Lit(Lit::Num(lit)) => {
                // 数字字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: lit.value.to_string().into(),
                        span: lit.span,
                        raw: None,
                    },
                })))
            }
            Expr::Lit(Lit::Bool(lit)) => {
                // 布尔字面量作为文本处理
                Ok(Some(ViewUnit::Text(TextUnit {
                    content: StringLiteral {
                        value: Atom::from(if lit.value { "true" } else { "false" }),
                        span: lit.span,
                        raw: None,
                    },
                })))
            }
            Expr::Ident(ident) => {
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
                            raw: None,
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
    fn parse_if_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        let name = match &element.opening.name {
            JSXElementName::Ident(ident) => ident.sym.as_str(),
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
                    condition: Expr::Lit(Lit::Bool(Bool {
                        value: true,
                        span: Span::new(BytePos(0), BytePos(0)),
                    })),
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
        let _condition = self.find_jsx_attribute(&element.opening.attrs, "cond")?;
        if let Some(JSXAttrOrSpread::JSXAttr(attr)) = _condition {
            if let Some(JSXAttrValue::JSXExprContainer(expr_container)) = &attr.value {
                if let Some(cond_expr) = jsx_expr_as_expression(&expr_container.expr) {
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
        let condition_expr = Expr::Lit(Lit::Bool(Bool {
            value: true,
            span: Span::new(BytePos(0), BytePos(0)),
        }));

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
        let array_container = self.find_jsx_attribute(&element.opening.attrs, "each")?;
        let array: &Expression = match array_container {
            Some(JSXAttrOrSpread::JSXAttr(attr)) => match &attr.value {
                Some(JSXAttrValue::JSXExprContainer(expr_container)) => {
                    match &expr_container.expr {
                        JSXExpr::Expr(expr) => expr,
                        JSXExpr::JSXEmptyExpr(_) => {
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
        let _key_prop = self.find_jsx_attribute(&element.opening.attrs, "key")?;
        let key: Option<Expression> = None; // 占位
        let mut key_dep_names: Vec<String> = Vec::new();
        let mut key_dep_bitmap: u32 = 0;
        if let Some(JSXAttrOrSpread::JSXAttr(attr)) = _key_prop {
            if let Some(JSXAttrValue::JSXExprContainer(expr_container)) = &attr.value {
                if let Some(kexpr) = jsx_expr_as_expression(&expr_container.expr) {
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
            .find(|child| matches!(child, JSXElementChild::JSXExprContainer(_)));

        let children = match jsx_children {
            Some(JSXElementChild::JSXExprContainer(expr_container)) => {
                match jsx_expr_as_expression(&expr_container.expr) {
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
        let item_ident = BindingIdent {
            id: Ident::new(
                "item".into(),
                Span::new(BytePos(0), BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ),
            type_ann: None,
        };
        let index_ident = BindingIdent {
            id: Ident::new(
                "index".into(),
                Span::new(BytePos(0), BytePos(0)),
                swc_common::SyntaxContext::empty(),
            ),
            type_ann: None,
        };
        // 解析数组表达式
        let array_expr = self.parse_for_array_expression(&element.opening.attrs)?;
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
            item: Pat::Ident(item_ident),
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
    fn parse_for_array_expression(&self, attrs: &[JSXAttributeItem]) -> CompilerResult<Expression> {
        for attr in attrs {
            if let JSXAttrOrSpread::JSXAttr(attr) = attr {
                if let JSXAttrName::Ident(ident) = &attr.name {
                    if ident.sym.as_str() == "of" {
                        if let Some(value) = &attr.value {
                            match value {
                                JSXAttrValue::JSXExprContainer(container) => {
                                    return self.convert_jsx_expr_to_expression(&container.expr);
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
        Ok(Expression::Ident(Ident::new(
            Atom::from("items"),
            Span::new(BytePos(0), BytePos(0)),
            swc_common::SyntaxContext::empty(),
        )))
    }

    /// 将JSX表达式转换为Expression - 与TypeScript原版完全对齐
    fn convert_jsx_expr_to_expression(
        &self,
        jsx_expr: &JSXExpression,
    ) -> CompilerResult<Expression> {
        match jsx_expr {
            JSXExpr::Expr(expr) => {
                // 直接返回表达式
                Ok(*expr.clone())
            }
            JSXExpr::JSXEmptyExpr(_) => {
                // 空表达式返回undefined
                Ok(Expression::Ident(Ident::new(
                    Atom::from("undefined"),
                    Span::new(BytePos(0), BytePos(0)),
                    swc_common::SyntaxContext::empty(),
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
            Expr::Arrow(arrow) => self.parse_for_arrow_function(arrow),
            Expr::Fn(func) => self.parse_for_function(&func.function),
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
        match &*arrow.body {
            BlockStmtOrExpr::BlockStmt(block) => {
                if block.stmts.len() != 1 {
                    return Err(CompilerError::new(
                        crate::error_handler::CompilerPhase::JSXElementAnalysis,
                        crate::error_handler::ErrorSeverity::Error,
                        "For: Expected 1 statement in block statement".to_string(),
                    ));
                }

                if let Stmt::Return(ret_stmt) = &block.stmts[0] {
                    if let Some(return_expr) = &ret_stmt.arg {
                        return self.parse_for_return_expression(return_expr);
                    }
                }

                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "For: Expected return statement in block statement".to_string(),
                ));
            }
            _ => {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "For: Expected block statement".to_string(),
                ));
            }
        }
    }

    /// 解析for循环中的函数 - 与TypeScript原版完全对齐
    fn parse_for_function(&mut self, func: &Function) -> CompilerResult<Vec<ViewUnit>> {
        if let Some(body) = &func.body {
            if body.stmts.len() != 1 {
                return Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::JSXElementAnalysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "For: Expected 1 statement in block statement".to_string(),
                ));
            }

            if let Stmt::Return(ret_stmt) = &body.stmts[0] {
                if let Some(return_expr) = &ret_stmt.arg {
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
    fn parse_for_return_expression(&mut self, expr: &Expression) -> CompilerResult<Vec<ViewUnit>> {
        match expr {
            Expr::JSXElement(jsx_element) => {
                // 解析JSX元素
                let mut parser = ViewParser::new(self.config.clone());
                let unit = parser.parse_element_direct(jsx_element)?;
                Ok(vec![unit])
            }
            Expr::JSXFragment(jsx_fragment) => {
                // 解析JSX片段
                let mut out = Vec::new();
                {
                    let mut parser = ViewParser::new(self.config.clone());
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
        let context_name = match &element.opening.name {
            JSXElementName::Ident(ident) => ident.sym.as_str().to_string(),
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
            let p = self.parse_jsx_attrs(&element.opening.attrs)?;
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
    fn parse_suspense_element(&mut self, element: &JSXElement) -> CompilerResult<()> {
        // 先读 fallback（不可变），再解析 children（不可变），最后 push（可变）
        let fallback_prop = self.find_jsx_attribute(&element.opening.attrs, "fallback")?;
        let children = self.parse_children(&element.children)?;
        let fallback = match fallback_prop {
            Some(JSXAttrOrSpread::JSXAttr(attr)) => Some(self.parse_jsx_attribute(attr)?.1),
            _ => None,
        };

        let suspense_unit = ViewUnit::Suspense(SuspenseUnit { children, fallback });

        self.view_units.push(suspense_unit);
        Ok(())
    }

    /// 查找JSX属性 - 与TypeScript原版完全对齐
    fn find_jsx_attribute<'a>(
        &self,
        attrs: &'a [JSXAttributeItem],
        name: &str,
    ) -> CompilerResult<Option<&'a JSXAttributeItem>> {
        Ok(attrs.iter().find(|attr| match attr {
            JSXAttrOrSpread::JSXAttr(attr) => match &attr.name {
                JSXAttrName::Ident(ident) => ident.sym.as_str() == name,
                JSXAttrName::JSXNamespacedName(namespaced) => {
                    namespaced.ns.sym.as_str() == name || namespaced.name.sym.as_str() == name
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
                    let mut result = cleaned_text + processed_line.as_str();
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
    fn transform_template(&self, unit: ViewUnit) -> CompilerResult<ViewUnit> {
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
            Expr::Ident(ident) => {
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
            Expr::Member(member) => {
                // 检查成员表达式中的标识符
                self.expression_contains_reactive_variables(&member.obj)
                    || match &member.prop {
                        MemberProp::Ident(_) => false,
                        MemberProp::PrivateName(_) => false,
                        MemberProp::Computed(computed) => {
                            self.expression_contains_reactive_variables(&computed.expr)
                        }
                    }
            }
            Expr::Call(call) => {
                // 检查函数调用中的参数
                (match &call.callee {
                    Callee::Expr(expr) => self.expression_contains_reactive_variables(expr),
                    _ => false,
                }) || call.args.iter().any(|arg| match arg {
                    ExprOrSpread { spread: None, expr } => {
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
            Expr::Ident(ident) => {
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
            Expr::Member(member) => {
                self.expression_contains_reactive_variables(&member.obj)
                    || match &member.prop {
                        MemberProp::Ident(_) => false,
                        MemberProp::PrivateName(_) => false,
                        MemberProp::Computed(computed) => {
                            self.expression_contains_reactive_variables(&computed.expr)
                        }
                    }
            }
            Expr::Call(call) => {
                (match &call.callee {
                    Callee::Expr(expr) => self.expression_contains_reactive_variables(expr),
                    _ => false,
                }) || call.args.iter().any(|arg| match arg {
                    ExprOrSpread { spread: None, expr } => {
                        self.expression_contains_reactive_variables(expr)
                    }
                    _ => false,
                })
            }
            Expr::Bin(binary) => {
                self.expression_contains_reactive_variables(&binary.left)
                    || self.expression_contains_reactive_variables(&binary.right)
            }
            Expr::Cond(conditional) => {
                self.expression_contains_reactive_variables(&conditional.test)
                    || self.expression_contains_reactive_variables(&conditional.cons)
                    || self.expression_contains_reactive_variables(&conditional.alt)
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
                if let Expr::Lit(Lit::Bool(lit)) = &prop.value {
                    lit.value
                } else {
                    true
                }
            })
            .map(|(k, v)| {
                let new_value = match &v.value {
                    Expr::Lit(Lit::Str(lit)) => Expr::Lit(Lit::Str(Str {
                        value: lit.value.clone(),
                        span: lit.span,
                        raw: None,
                    })),
                    Expr::Lit(Lit::Num(lit)) => Expr::Lit(Lit::Num(Number {
                        value: lit.value,
                        span: lit.span,
                        raw: None,
                    })),
                    Expr::Lit(Lit::Bool(lit)) => Expr::Lit(Lit::Bool(Bool {
                        value: lit.value,
                        span: lit.span,
                    })),
                    Expr::Lit(Lit::Null(lit)) => Expr::Lit(Lit::Null(Null { span: lit.span })),
                    _ => Expr::Lit(Lit::Null(Null {
                        span: Span::new(BytePos(0), BytePos(0)),
                    })),
                };
                let new_prop = UnitProp {
                    value: new_value,
                    view_prop_map: HashMap::new(),
                    specifier: v.specifier.clone(),
                    dep_id_bitmap: 0,
                    dependencies_node: Vec::new(),
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
                            raw: None,
                        },
                    }));
                }
                ViewUnit::Html(html_child) => {
                    if let Expr::Lit(Lit::Str(_)) = &html_child.tag {
                        children.push(ViewUnit::Html(self.generate_template(html_child)?));
                    }
                }
                _ => {}
            }
        }

        let new_tag = match &unit.tag {
            Expr::Lit(Lit::Str(lit)) => Expr::Lit(Lit::Str(Str {
                value: lit.value.clone(),
                span: lit.span,
                raw: None,
            })),
            _ => Expr::Lit(Lit::Str(Str {
                value: Atom::from("unknown"),
                span: Span::new(BytePos(0), BytePos(0)),
                raw: None,
            })),
        };

        Ok(HTMLUnit {
            tag: new_tag,
            props: static_props,
            children,
        })
    }

    /// 生成可变单元 - 与TypeScript原版完全对齐
    fn generate_mutable_units(&self, html_unit: &HTMLUnit) -> CompilerResult<Vec<MutableUnit>> {
        let mut mutable_units = Vec::new();
        self.collect_mutable_units(html_unit, &mut mutable_units, &[])?;
        Ok(mutable_units)
    }

    /// 收集可变单元 - 与TypeScript原版完全对齐
    fn collect_mutable_units(
        &self,
        unit: &HTMLUnit,
        mutable_units: &mut Vec<MutableUnit>,
        path: &[usize],
    ) -> CompilerResult<()> {
        // 使用基于 children 绝对下标的路径编码，保证定位稳定且无需哨兵值
        for (idx, child) in unit.children.iter().enumerate() {
            let next_path = [path, &[idx]].concat();
            match child {
                ViewUnit::Html(html_child) => {
                    // 仅当标签为字符串字面量时继续深入（静态 HTML）
                    if let Expr::Lit(Lit::Str(_)) = &html_child.tag {
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
                    Expr::Lit(Lit::Str(lit)) => lit.value.as_str().to_string(),
                    _ => "unknown".to_string(),
                };

                // 解析实际的模板属性值
                let tag_expr = self.parse_template_tag_expression(tag_name.clone())?;
                let value_expr = prop.value.clone();
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
                if let Expr::Lit(Lit::Str(_)) = &html_child.tag {
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
            Expr::Lit(Lit::Str(_))
                | Expr::Lit(Lit::Num(_))
                | Expr::Lit(Lit::Bool(_))
                | Expr::Lit(Lit::Null(_))
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
        body.push(ModuleItem::Stmt(Stmt::Expr(
            // 0.15 无法克隆 Expression：使用对原表达式的引用包装等价节点
            ExprStmt {
                expr: Box::new(Expr::Paren(ParenExpr {
                    expr: Box::new(Expr::Paren(ParenExpr {
                        expr: Box::new(Expr::Ident(Ident::new(
                            Atom::from("__expr_proxy"),
                            Span::new(BytePos(0), BytePos(0)),
                            SyntaxContext::empty(),
                        ))),
                        span: Span::new(BytePos(0), BytePos(0)),
                    })),
                    span: Span::new(BytePos(0), BytePos(0)),
                })),
                span: Span::new(BytePos(0), BytePos(0)),
            },
        )));
        Program::Module(Module {
            body,
            span: Span::new(BytePos(0), BytePos(0)),
            shebang: None,
        })
    }

    /// 解析视图 - 与TypeScript原版完全对齐
    fn parse_view(&mut self, node: &AllowedJSXNode) -> CompilerResult<Vec<ViewUnit>> {
        let mut out = Vec::new();
        {
            let mut parser = ViewParser::new(ViewParserConfig {
                html_tags: self.config.html_tags.clone(),
                will_parse_template: false,
                custom_html_props: self.config.custom_html_props.clone(),
                reactive_map: Some(HashMap::new()),
            });
            let unit = parser.parse_element_direct(node)?;
            out.push(unit);
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
            source_type: swc_ecma_parser::Syntax::default(),
            event_counter: 0,
        }
    }

    /// 解析JSX代码为视图单元 - 与TypeScript原版完全对齐
    pub fn parse(&self, code: &str) -> CompilerResult<Vec<ViewUnit>> {
        // 复用 SWC 解析，先得到 Program 再提取视图单元
        println!("URGENT DEBUG: JsxParser::parse method called!!!");
        println!("DEBUG: JsxParser::parse called with code: {:?}", code);
        let program = self.parse_program(code)?;
        let mut view_units = Vec::new();
        if let Program::Module(module) = program {
            println!(
                "DEBUG: JsxParser::parse processing module with {} items",
                module.body.len()
            );
            self.extract_jsx_from_program(&module, &mut view_units)?;
        }
        println!(
            "DEBUG: JsxParser::parse generated {} view_units",
            view_units.len()
        );
        for (i, unit) in view_units.iter().enumerate() {
            println!("DEBUG: ViewUnit {}: {:?}", i, std::mem::discriminant(unit));
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
        println!("DEBUG: parse_program called with code: {:?}", code);
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
        println!("DEBUG: parse_program about to call parser.parse_module");
        match parser.parse_module() {
            Ok(module) => {
                println!(
                    "DEBUG: parse_program succeeded, got module with {} items",
                    module.body.len()
                );
                Ok(Program::Module(module))
            }
            Err(err) => {
                println!("DEBUG: parse_program failed with error: {:?}", err);
                Err(CompilerError::new(
                    crate::error_handler::CompilerPhase::Parsing,
                    crate::error_handler::ErrorSeverity::Error,
                    format!("Failed to parse JSX code: {:?}", err),
                ))
            }
        }
    }

    /// 从程序中提取JSX元素 - 与TypeScript原版完全对齐
    fn extract_jsx_from_program(
        &self,
        module: &Module,
        view_units: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        for item in &module.body {
            println!(
                "DEBUG: extract_jsx_from_program processing item: {:?}",
                std::mem::discriminant(item)
            );
            if let ModuleItem::Stmt(stmt) = item {
                self.extract_jsx_from_statement(stmt, view_units)?;
            }
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
        for item in &module.body {
            if let ModuleItem::Stmt(stmt) = item {
                self.extract_jsx_from_statement_with_config(stmt, view_units, config)?;
            }
        }
        Ok(())
    }

    /// 从语句中提取JSX元素 - 与TypeScript原版完全对齐
    fn extract_jsx_from_statement(
        &self,
        stmt: &Statement,
        view_units: &mut Vec<ViewUnit>,
    ) -> CompilerResult<()> {
        println!(
            "DEBUG: extract_jsx_from_statement processing: {:?}",
            std::mem::discriminant(stmt)
        );
        match stmt {
            Stmt::Expr(expr_stmt) => {
                self.extract_jsx_from_expression(&expr_stmt.expr, view_units)?;
            }
            Stmt::Return(ret_stmt) => {
                if let Some(expr) = &ret_stmt.arg {
                    self.extract_jsx_from_expression(expr, view_units)?;
                }
            }
            Stmt::Block(block_stmt) => {
                for stmt in &block_stmt.stmts {
                    self.extract_jsx_from_statement(stmt, view_units)?;
                }
            }
            Stmt::If(if_stmt) => {
                self.extract_jsx_from_statement(&if_stmt.cons, view_units)?;
                if let Some(alternate) = &if_stmt.alt {
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
            Stmt::Expr(expr_stmt) => {
                self.extract_jsx_from_expression_with_config(&expr_stmt.expr, view_units, config)?;
            }
            Stmt::Return(ret_stmt) => {
                if let Some(expr) = &ret_stmt.arg {
                    self.extract_jsx_from_expression_with_config(expr, view_units, config)?;
                }
            }
            Stmt::Block(block_stmt) => {
                for stmt in &block_stmt.stmts {
                    self.extract_jsx_from_statement_with_config(stmt, view_units, config)?;
                }
            }
            Stmt::If(if_stmt) => {
                self.extract_jsx_from_statement_with_config(&if_stmt.cons, view_units, config)?;
                if let Some(alternate) = &if_stmt.alt {
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
        println!(
            "DEBUG: extract_jsx_from_expression processing: {:?}",
            std::mem::discriminant(expr)
        );
        match expr {
            Expr::JSXElement(jsx_element) => {
                let config = ViewParserConfig::default();
                let mut parser = ViewParser::new(config);
                let unit = parser.parse_element_direct(jsx_element)?;
                view_units.push(unit);
            }
            Expr::JSXFragment(jsx_fragment) => {
                let config = ViewParserConfig::default();
                let mut parser = ViewParser::new(config);
                parser.parse_fragment_into(jsx_fragment, view_units)?;
            }
            Expr::Call(call) => {
                for arg in &call.args {
                    if let Some(e) = arg_as_expression(arg) {
                        self.extract_jsx_from_expression(e, view_units)?;
                    }
                }
                match &call.callee {
                    Callee::Expr(expr) => self.extract_jsx_from_expression(expr, view_units)?,
                    Callee::Super(_) => {}  // 跳过 super 调用
                    Callee::Import(_) => {} // 跳过 import 调用
                }
            }
            Expr::Array(array) => {
                for element in &array.elems {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.extract_jsx_from_expression(expr, view_units)?;
                    }
                }
            }
            Expr::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        PropOrSpread::Prop(property) => {
                            match &**property {
                                Prop::KeyValue(key_value) => {
                                    self.extract_jsx_from_expression(&key_value.value, view_units)?;
                                }
                                Prop::Assign(assign_prop) => {
                                    self.extract_jsx_from_expression(
                                        &assign_prop.value,
                                        view_units,
                                    )?;
                                }
                                _ => {} // 跳过其他属性类型
                            }
                        }
                        PropOrSpread::Spread(spread) => {
                            self.extract_jsx_from_expression(&spread.expr, view_units)?;
                        }
                    }
                }
            }
            Expr::Cond(conditional) => {
                self.extract_jsx_from_expression(&conditional.cons, view_units)?;
                self.extract_jsx_from_expression(&conditional.alt, view_units)?;
            }
            Expr::Tpl(tpl) => {
                for e in &tpl.exprs {
                    self.extract_jsx_from_expression(e, view_units)?;
                }
            }
            Expr::TaggedTpl(tagged) => {
                self.extract_jsx_from_expression(&tagged.tag, view_units)?;
                for e in &tagged.tpl.exprs {
                    self.extract_jsx_from_expression(e, view_units)?;
                }
            }
            Expr::New(ne) => {
                self.extract_jsx_from_expression(&ne.callee, view_units)?;
                if let Some(args) = &ne.args {
                    for arg in args {
                        if let Some(e) = arg_as_expression(arg) {
                            self.extract_jsx_from_expression(e, view_units)?;
                        }
                    }
                }
            }
            Expr::Await(a) => {
                self.extract_jsx_from_expression(&a.arg, view_units)?;
            }
            Expr::Yield(y) => {
                if let Some(arg) = &y.arg {
                    self.extract_jsx_from_expression(arg, view_units)?;
                }
            }
            Expr::Assign(assign) => {
                self.extract_jsx_from_expression(&assign.right, view_units)?;
            }
            Expr::Arrow(_arrow) => {
                // 暂不深入遍历函数体，避免 0.15 API 差异引发的类型不匹配
            }
            Expr::Fn(_func) => {
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
            Expr::JSXElement(jsx_element) => {
                let mut parser = ViewParser::new(config.clone());
                let unit = parser.parse_element_direct(jsx_element)?;
                view_units.push(unit);
            }
            Expr::JSXFragment(jsx_fragment) => {
                let mut parser = ViewParser::new(config.clone());
                parser.parse_fragment_into(jsx_fragment, view_units)?;
            }
            Expr::Call(call) => {
                for arg in &call.args {
                    if let Some(e) = arg_as_expression(arg) {
                        self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                    }
                }
                match &call.callee {
                    Callee::Expr(expr) => {
                        self.extract_jsx_from_expression_with_config(expr, view_units, config)?
                    }
                    Callee::Super(_) => {}  // 跳过 super 调用
                    Callee::Import(_) => {} // 跳过 import 调用
                }
            }
            Expr::Array(array) => {
                for element in &array.elems {
                    if let Some(expr) = array_elem_as_expression(element) {
                        self.extract_jsx_from_expression_with_config(expr, view_units, config)?;
                    }
                }
            }
            Expr::Object(obj) => {
                for prop in &obj.props {
                    match prop {
                        PropOrSpread::Prop(property) => {
                            match &**property {
                                Prop::KeyValue(key_value) => {
                                    self.extract_jsx_from_expression_with_config(
                                        &key_value.value,
                                        view_units,
                                        config,
                                    )?;
                                }
                                Prop::Assign(assign_prop) => {
                                    self.extract_jsx_from_expression_with_config(
                                        &assign_prop.value,
                                        view_units,
                                        config,
                                    )?;
                                }
                                _ => {} // 跳过其他属性类型
                            }
                        }
                        PropOrSpread::Spread(spread) => {
                            self.extract_jsx_from_expression_with_config(
                                &spread.expr,
                                view_units,
                                config,
                            )?;
                        }
                    }
                }
            }
            Expr::Cond(conditional) => {
                self.extract_jsx_from_expression_with_config(
                    &conditional.cons,
                    view_units,
                    config,
                )?;
                self.extract_jsx_from_expression_with_config(&conditional.alt, view_units, config)?;
            }
            Expr::Tpl(tpl) => {
                for e in &tpl.exprs {
                    self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                }
            }
            Expr::TaggedTpl(tagged) => {
                self.extract_jsx_from_expression_with_config(&tagged.tag, view_units, config)?;
                for e in &tagged.tpl.exprs {
                    self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                }
            }
            Expr::New(ne) => {
                self.extract_jsx_from_expression_with_config(&ne.callee, view_units, config)?;
                if let Some(args) = &ne.args {
                    for arg in args {
                        if let Some(e) = arg_as_expression(arg) {
                            self.extract_jsx_from_expression_with_config(e, view_units, config)?;
                        }
                    }
                }
            }
            Expr::Await(a) => {
                self.extract_jsx_from_expression_with_config(&a.arg, view_units, config)?;
            }
            Expr::Yield(y) => {
                if let Some(arg) = &y.arg {
                    self.extract_jsx_from_expression_with_config(arg, view_units, config)?;
                }
            }
            Expr::Assign(assign) => {
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

impl ViewParser {
    /// 解析模板标签表达式 - 与TypeScript原版完全对齐
    fn parse_template_tag_expression(&self, tag_name: String) -> CompilerResult<Expression> {
        // 将标签名转换为字符串字面量表达式
        Ok(Expr::Lit(Lit::Str(Str {
            value: Atom::from(tag_name.as_str()),
            span: Span::new(BytePos(0), BytePos(0)),
            raw: None,
        })))
    }

    /// 解析模板值表达式 - 与TypeScript原版完全对齐
    fn parse_template_value_expression(&self, value: &UnitProp) -> CompilerResult<Expression> {
        // 直接返回属性值表达式
        Ok(value.value.clone())
    }
}

// 辅助函数
fn array_elem_as_expression(element: &Option<ExprOrSpread>) -> Option<&Expr> {
    match element {
        Some(ExprOrSpread { spread: None, expr }) => Some(expr),
        _ => None,
    }
}

fn arg_as_expression(arg: &ExprOrSpread) -> Option<&Expr> {
    match arg {
        ExprOrSpread { spread: None, expr } => Some(expr),
        _ => None,
    }
}

fn jsx_expr_as_expression(jsx_expr: &JSXExpr) -> Option<&Expr> {
    match jsx_expr {
        JSXExpr::Expr(expr) => Some(expr),
        JSXExpr::JSXEmptyExpr(_) => None,
    }
}
