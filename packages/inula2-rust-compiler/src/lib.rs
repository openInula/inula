use wasm_bindgen::prelude::*;
use swc_core::ecma::parser::{Parser, StringInput, Syntax};
use std::rc::Rc;
use swc_core::common::{FileName, SourceMap, sync::Lrc};
use swc_core::ecma::parser::EsSyntax;
use bitvec::prelude::BitVec;
use crate::types::*;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen;
use std::collections::HashMap;
use serde_json;
use swc_core::ecma::ast::*;
use web_sys::console;

mod types;

pub mod jsx_parser {
    use super::*;
    use crate::reactivity_parser::ReactivityParser;

    #[wasm_bindgen]
    pub struct JsxParser {
        source_map: Lrc<SourceMap>,
    }

    #[wasm_bindgen]
    impl JsxParser {
        #[wasm_bindgen(constructor)]
        pub fn new() -> Self {
            Self {
                source_map: Rc::new(SourceMap::default()),
            }
        }

        pub fn parse(&self, code: &str) -> Result<JsValue, JsValue> {
            console::log_1(&JsValue::from_str(&format!("Parsing code: {}", code)));
            let syntax = Syntax::Es(EsSyntax {
                jsx: true,
                ..Default::default()
            });
            let fm = self.source_map.new_source_file(FileName::Anon.into(), code.into());
            let input = StringInput::from(&*fm);
            let mut parser = Parser::new(syntax, input, None);

            let module = parser.parse_module().map_err(|e| {
                console::log_1(&JsValue::from_str(&format!("Parse error details: {:?}", e)));
                JsValue::from_str(&format!("Parse error: {:?}", e))
            })?;

            let mut view_units = Vec::new();
            for item in module.body {
                match item {
                    ModuleItem::Stmt(Stmt::Decl(Decl::Var(var))) => {
                        for decl in var.decls {
                            if let Some(ref init) = decl.init {
                                if let Some(state_unit) = self.parse_state_decl(&decl, &init) {
                                    view_units.push(ViewUnit::State(state_unit));
                                }
                            }
                        }
                    }
                    ModuleItem::Stmt(Stmt::Expr(ExprStmt { expr, .. })) => {
                        let mut view_unit = self.convert_to_view_unit(&expr)?;
                        view_unit = self.transform_template(view_unit);
                        view_units.push(view_unit);
                    }
                    _ => {}
                }
            }

            let view_unit_json = serde_json::to_string(&view_units)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {:?}", e)))?;
            console::log_1(&JsValue::from_str(&format!("ViewUnit JSON: {}", view_unit_json)));
            Ok(JsValue::from_str(&view_unit_json))
        }

        fn parse_state_decl(&self, decl: &VarDeclarator, expr: &Expr) -> Option<StateUnit> {
            if let Expr::Call(call) = expr {
                if let Callee::Expr(callee) = &call.callee {
                    if let Expr::Ident(ident) = &**callee {
                        if ident.sym == "useState" {
                            if let Some(ExprOrSpread { expr: init_expr, .. }) = call.args.get(0) {
                                let initial_value = self.expr_to_string(init_expr);
                                if let Pat::Array(array_pat) = &decl.name {
                                    if let Some(Some(Pat::Ident(name))) = array_pat.elems.get(0) {
                                        console::log_1(&JsValue::from_str(&format!("Parsed state: {} = {}", name.id.sym, initial_value)));
                                        return Some(StateUnit {
                                            name: name.id.sym.to_string(),
                                            initial_value,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
            None
        }

        fn expr_to_string(&self, expr: &Expr) -> String {
            match expr {
                Expr::Bin(bin) => {
                    let left = self.expr_to_string(&bin.left);
                    let right = self.expr_to_string(&bin.right);
                    let op = match bin.op {
                        BinaryOp::Add => "+",
                        BinaryOp::Sub => "-",
                        _ => return format!("{:?}", bin.op),
                    };
                    let result = format!("{} {} {}", left, op, right);
                    console::log_1(&JsValue::from_str(&format!("BinExpr result: {}", result)));
                    result
                }
                Expr::Ident(ident) => {
                    let result = ident.sym.to_string();
                    console::log_1(&JsValue::from_str(&format!("Ident result: {}", result)));
                    result
                }
                Expr::Lit(lit) => {
                    let result = match lit {
                        Lit::Num(num) => num.value.to_string(),
                        Lit::Str(s) => format!("{:?}", s.value),
                        _ => format!("{:?}", lit),
                    };
                    console::log_1(&JsValue::from_str(&format!("Lit result: {}", result)));
                    result
                }
                Expr::Object(obj) => {
                    let props: Vec<String> = obj.props.iter().map(|prop| {
                        match prop {
                            PropOrSpread::Prop(prop) => {
                                if let Prop::KeyValue(kv) = &**prop {
                                    let key = match &kv.key {
                                        PropName::Ident(ident) => ident.sym.to_string(),
                                        PropName::Str(s) => s.value.to_string(),
                                        _ => "".to_string(),
                                    };
                                    let value = self.expr_to_string(&kv.value);
                                    format!("{}: {}", key, value)
                                } else {
                                    "".to_string()
                                }
                            }
                            _ => "".to_string(),
                        }
                    }).filter(|s| !s.is_empty()).collect();
                    let result = format!("{{ {} }}", props.join(", "));
                    console::log_1(&JsValue::from_str(&format!("Generated code: {}", result)));
                    result
                }
                Expr::Call(call) => {
                    if let Callee::Expr(boxed_expr) = &call.callee {
                        if let Expr::Member(member) = &**boxed_expr {
                            if let Expr::Ident(ident) = &*member.obj {
                                if member.prop.as_ident().map(|i| i.sym == "map").unwrap_or(false) {
                                    if let Some(ExprOrSpread { expr, .. }) = call.args.get(0) {
                                        if let Expr::Arrow(arrow) = &**expr {
                                            let param = arrow.params.get(0).map(|p| match p {
                                                Pat::Ident(ident) => ident.id.sym.to_string(),
                                                _ => "item".to_string(),
                                            }).unwrap_or("item".to_string());
                                            let body = match &*arrow.body {
                                                BlockStmtOrExpr::Expr(expr) => self.expr_to_string(expr),
                                                BlockStmtOrExpr::BlockStmt(_block) => format!("{{ ... }}"),
                                            };
                                            let result = format!("each {} in {} => {}", param, ident.sym, body);
                                            console::log_1(&JsValue::from_str(&format!("Each result: {}", result)));
                                            return result;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    use swc_core::ecma::codegen::{Emitter, Config};
                    use swc_core::ecma::codegen::text_writer::JsWriter;

                    let cm: Lrc<SourceMap> = Lrc::new(SourceMap::default());
                    let mut buf = Vec::new();
                    {
                        let writer = JsWriter::new(cm.clone(), "\n", &mut buf, None);
                        let mut emitter = Emitter {
                            cfg: Config::default().with_minify(false),
                            cm: cm.clone(),
                            comments: None,
                            wr: Box::new(writer),
                        };
                        let module = Module {
                            shebang: None,
                            body: vec![ModuleItem::Stmt(Stmt::Expr(ExprStmt {
                                expr: Box::new(expr.clone()),
                                span: Default::default(),
                            }))],
                            span: Default::default(),
                        };
                        emitter.emit_module(&module).expect("emit_module failed");
                    }
                    let code = String::from_utf8(buf).unwrap();
                    console::log_1(&JsValue::from_str(&format!("Generated code: {}", code)));
                    code.trim_end_matches(';').to_string()
                }
                _ => {
                    use swc_core::ecma::codegen::{Emitter, Config};
                    use swc_core::ecma::codegen::text_writer::JsWriter;

                    let cm: Lrc<SourceMap> = Lrc::new(SourceMap::default());
                    let mut buf = Vec::new();
                    {
                        let writer = JsWriter::new(cm.clone(), "\n", &mut buf, None);
                        let mut emitter = Emitter {
                            cfg: Config::default().with_minify(false),
                            cm: cm.clone(),
                            comments: None,
                            wr: Box::new(writer),
                        };
                        let module = Module {
                            shebang: None,
                            body: vec![ModuleItem::Stmt(Stmt::Expr(ExprStmt {
                                expr: Box::new(expr.clone()),
                                span: Default::default(),
                            }))],
                            span: Default::default(),
                        };
                        emitter.emit_module(&module).expect("emit_module failed");
                    }
                    let code = String::from_utf8(buf).unwrap();
                    console::log_1(&JsValue::from_str(&format!("Generated code: {}", code)));
                    code.trim_end_matches(';').to_string()
                }
            }
        }

        fn convert_to_view_unit(&self, expr: &Expr) -> Result<ViewUnit, JsValue> {
            match expr {
                Expr::JSXElement(jsx) => self.parse_jsx_element(jsx),
                Expr::JSXFragment(frag) => self.parse_jsx_fragment(frag),
                _ => {
                    let code = self.expr_to_string(expr);
                    console::log_1(&JsValue::from_str(&format!("Expression string: {}", code)));
                    Ok(ViewUnit::Exp(ExpUnit { content: code }))
                }
            }
        }

        fn is_context(&self, name: &str) -> bool {
            if name.len() < 7 {
                return false;
            }
            let last_7_chars = &name[name.len() - 7..];
            last_7_chars == "Context" && name.chars().next().unwrap().is_uppercase()
        }

        fn is_suspense(&self, name: &str) -> bool {
            name == "Suspense"
        }

        fn parse_jsx_context_element(&self, jsx: &JSXElement, context_name: &str) -> Result<ViewUnit, JsValue> {
            let mut props = HashMap::new();
            for attr_or_spread in &jsx.opening.attrs {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr_or_spread {
                    let name = match &attr.name {
                        JSXAttrName::Ident(ident) => ident.sym.to_string(),
                        _ => continue,
                    };
                    let value = self.parse_jsx_attr_value(&attr.value, &name)?;
                    props.insert(name, value);
                }
            }

            let mut children = Vec::new();
            for child in &jsx.children {
                match child {
                    JSXElementChild::JSXElement(el) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXElement(el.clone()))?));
                    }
                    JSXElementChild::JSXFragment(frag) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXFragment(frag.clone()))?));
                    }
                    JSXElementChild::JSXText(text) => {
                        let content = text.value.trim().to_string();
                        if !content.is_empty() {
                            children.push(Box::new(ViewUnit::Text(TextUnit { content })));
                        }
                    }
                    JSXElementChild::JSXExprContainer(expr_container) => {
                        if let JSXExpr::Expr(expr) = &expr_container.expr {
                            let code = self.expr_to_string(expr);
                            children.push(Box::new(ViewUnit::Exp(ExpUnit { content: code })));
                        }
                    }
                    _ => {}
                }
            }

            Ok(ViewUnit::Context(ContextUnit {
                context_name: context_name.to_string(),
                props,
                children,
            }))
        }

        fn parse_jsx_suspense_element(&self, jsx: &JSXElement) -> Result<ViewUnit, JsValue> {
            let mut children = Vec::new();
            let mut fallback = None;

            for attr_or_spread in &jsx.opening.attrs {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr_or_spread {
                    let name = match &attr.name {
                        JSXAttrName::Ident(ident) => ident.sym.to_string(),
                        _ => continue,
                    };
                    if name == "fallback" {
                        if let Some(JSXAttrValue::JSXExprContainer(container)) = &attr.value {
                            if let JSXExpr::Expr(expr) = &container.expr {
                                fallback = Some(Box::new(self.convert_to_view_unit(expr)?));
                            }
                        }
                    }
                }
            }

            for child in &jsx.children {
                match child {
                    JSXElementChild::JSXElement(el) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXElement(el.clone()))?));
                    }
                    JSXElementChild::JSXFragment(frag) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXFragment(frag.clone()))?));
                    }
                    JSXElementChild::JSXText(text) => {
                        let content = text.value.trim().to_string();
                        if !content.is_empty() {
                            children.push(Box::new(ViewUnit::Text(TextUnit { content })));
                        }
                    }
                    _ => {}
                }
            }

            Ok(ViewUnit::Suspense(Box::new(SuspenseUnit {
                children,
                fallback,
            })))
        }

        fn parse_jsx_element(&self, jsx: &JSXElement) -> Result<ViewUnit, JsValue> {
            let tag = match &jsx.opening.name {
                JSXElementName::Ident(ident) => ident.sym.to_string(),
                JSXElementName::JSXMemberExpr(member) => {
                    let obj = match &member.obj {
                        JSXObject::Ident(ident) => ident.sym.to_string(),
                        _ => return Err(JsValue::from_str("Only simple JSX member expressions are supported")),
                    };
                    format!("{}.{}", obj, member.prop.sym)
                }
                _ => return Err(JsValue::from_str("Unsupported JSX element name")),
            };

            let context_name = tag.split('.').next().unwrap_or(&tag);
            if self.is_context(context_name) {
                return self.parse_jsx_context_element(jsx, context_name);
            } else if self.is_suspense(&tag) {
                return self.parse_jsx_suspense_element(jsx);
            } else if tag == "Fragment" {
                let fragment = JSXFragment {
                    span: jsx.span,
                    opening: JSXOpeningFragment {
                        span: jsx.opening.span,
                    },
                    children: jsx.children.clone(),
                    closing: JSXClosingFragment {
                        span: jsx.closing.as_ref().map(|c| c.span).unwrap_or(jsx.span),
                    },
                };
                return self.parse_jsx_fragment(&fragment);
            } else if tag == "For" {
                return self.parse_jsx_for_element(jsx);
            } else if tag == "If" {
                return self.parse_jsx_if_element(jsx);
            }

            let mut props = HashMap::new();
            for attr_or_spread in &jsx.opening.attrs {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr_or_spread {
                    let name = match &attr.name {
                        JSXAttrName::Ident(ident) => ident.sym.to_string(),
                        _ => return Err(JsValue::from_str("Only identifier attributes are supported")),
                    };
                    let value = self.parse_jsx_attr_value(&attr.value, &name)?;
                    props.insert(name, value);
                }
            }

            let mut children: Vec<Box<ViewUnit>> = Vec::new();
            for child in &jsx.children {
                match child {
                    JSXElementChild::JSXText(text) => {
                        let content = text.value.trim().to_string();
                        if !content.is_empty() {
                            children.push(Box::new(ViewUnit::Text(TextUnit { content })));
                        }
                    }
                    JSXElementChild::JSXElement(el) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXElement(el.clone()))?));
                    }
                    JSXElementChild::JSXFragment(frag) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXFragment(frag.clone()))?));
                    }
                    JSXElementChild::JSXExprContainer(expr_container) => {
                        match &expr_container.expr {
                            JSXExpr::Expr(expr) => {
                                let code = self.expr_to_string(expr);
                                console::log_1(&JsValue::from_str(&format!("JSX expression: {}", code)));
                                children.push(Box::new(ViewUnit::Exp(ExpUnit { content: code })));
                            }
                            _ => {}
                        }
                    }
                    _ => {}
                }
            }

            Ok(ViewUnit::Html(HtmlUnit {
                tag,
                props,
                children,
            }))
        }

        fn parse_jsx_for_element(&self, jsx: &JSXElement) -> Result<ViewUnit, JsValue> {
            let mut array = String::new();
            let mut item = String::new();
            let mut index = None;
            let mut key = None;

            for attr_or_spread in &jsx.opening.attrs {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr_or_spread {
                    let name = match &attr.name {
                        JSXAttrName::Ident(ident) => ident.sym.to_string(),
                        _ => continue,
                    };
                    let value = self.parse_jsx_attr_value(&attr.value, &name)?.value;
                    match name.as_str() {
                        "array" => array = value,
                        "item" => item = value,
                        "index" => index = Some(value),
                        "key" => key = Some(value),
                        _ => {}
                    }
                }
            }

            if array.is_empty() || item.is_empty() {
                return Err(JsValue::from_str("For component requires 'array' and 'item' props"));
            }

            let mut children: Vec<Box<ViewUnit>> = Vec::new();
            for child in &jsx.children {
                match child {
                    JSXElementChild::JSXElement(el) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXElement(el.clone()))?));
                    }
                    JSXElementChild::JSXFragment(frag) => {
                        children.push(Box::new(self.convert_to_view_unit(&Expr::JSXFragment(frag.clone()))?));
                    }
                    _ => {}
                }
            }

            Ok(ViewUnit::For(ForUnit {
                array,
                item,
                index,
                key,
                children,
            }))
        }

        fn parse_jsx_if_element(&self, jsx: &JSXElement) -> Result<ViewUnit, JsValue> {
            let mut branches = Vec::new();
            let mut current_condition = String::new();
            let mut current_children = Vec::new();

            for child in &jsx.children {
                match child {
                    JSXElementChild::JSXElement(el) => {
                        if !current_condition.is_empty() {
                            branches.push(Box::new(IfBranch {
                                condition: current_condition.clone(),
                                children: current_children.drain(..).collect(),
                            }));
                        }
                        current_condition = self.get_if_branch_condition(el)?;
                        current_children.push(Box::new(self.convert_to_view_unit(&Expr::JSXElement(el.clone()))?));
                    }
                    _ => {}
                }
            }

            if !current_condition.is_empty() {
                branches.push(Box::new(IfBranch {
                    condition: current_condition,
                    children: current_children,
                }));
            }

            Ok(ViewUnit::If(IfUnit { branches }))
        }

        fn get_if_branch_condition(&self, el: &JSXElement) -> Result<String, JsValue> {
            for attr_or_spread in &el.opening.attrs {
                if let JSXAttrOrSpread::JSXAttr(attr) = attr_or_spread {
                    let name = match &attr.name {
                        JSXAttrName::Ident(ident) => ident.sym.to_string(),
                        _ => continue,
                    };
                    if name == "condition" {
                        return Ok(self.parse_jsx_attr_value(&attr.value, &name)?.value);
                    }
                }
            }
            Err(JsValue::from_str("If branch requires 'condition' prop"))
        }

        fn parse_jsx_fragment(&self, frag: &JSXFragment) -> Result<ViewUnit, JsValue> {
            let mut children = Vec::new();
            for child in &frag.children {
                match child {
                    JSXElementChild::JSXText(text) => {
                        let content = text.value.trim().to_string();
                        if !content.is_empty() {
                            children.push(Box::new(ViewUnit::Text(TextUnit { content })));
                        }
                    }
                    JSXElementChild::JSXElement(el) => {
                        children.push(Box::new(self.parse_jsx_element(el)?));
                    }
                    JSXElementChild::JSXFragment(f) => {
                        children.push(Box::new(self.parse_jsx_fragment(f)?));
                    }
                    _ => {}
                }
            }
            Ok(ViewUnit::Fragment(FragmentUnit { children }))
        }

        fn parse_jsx_attr_value(&self, value: &Option<JSXAttrValue>, attr_name: &str) -> Result<PropValue, JsValue> {
            match value {
                Some(JSXAttrValue::Lit(lit)) => {
                    let value_str = match lit {
                        Lit::Str(s) => format!("{:?}", s.value),
                        Lit::Num(n) => n.value.to_string(),
                        _ => format!("{:?}", lit),
                    };
                    Ok(PropValue {
                        value: value_str,
                        dep_id_bitmap: 0,
                        dependencies: Vec::new(),
                        is_event: false,
                    })
                }
                Some(JSXAttrValue::JSXExprContainer(container)) => {
                    let inner_expr = match &container.expr {
                        JSXExpr::Expr(expr) => expr,
                        _ => return Err(JsValue::from_str("Unsupported JSX expression type")),
                    };
                    let expr_str = self.expr_to_string(inner_expr);
                    let mut reactivity_parser = ReactivityParser::new();
                    let dependencies_js = reactivity_parser.analyze_expression_str(&expr_str)?;
                    let dependencies: DependencyInfo = serde_wasm_bindgen::from_value(dependencies_js)
                        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {:?}", e)))?;
                    Ok(PropValue {
                        value: expr_str,
                        dep_id_bitmap: dependencies.total_bitmap.len() as u32,
                        dependencies: dependencies.dependencies.keys().cloned().collect(),
                        is_event: attr_name.starts_with("on") && attr_name.chars().nth(2).map_or(false, |c| c.is_uppercase()),
                    })
                }
                None => Ok(PropValue {
                    value: "true".to_string(),
                    dep_id_bitmap: 0,
                    dependencies: Vec::new(),
                    is_event: false,
                }),
                _ => Err(JsValue::from_str("Unsupported attribute value type")),
            }
        }

        fn transform_template(&self, view_unit: ViewUnit) -> ViewUnit {
            match view_unit {
                ViewUnit::Html(html_unit) if self.is_html_template(&html_unit) => {
                    let template = self.generate_template(&html_unit);
                    let mutable_units = self.generate_mutable_units(&html_unit);
                    let props = self.parse_template_props(&html_unit);
                    ViewUnit::Template(TemplateUnit {
                        template,
                        mutable_units,
                        props,
                    })
                },
                _ => view_unit
            }
        }

        fn is_html_template(&self, html_unit: &HtmlUnit) -> bool {
            html_unit.children.iter().any(|child| matches!(**child, ViewUnit::Html(_) | ViewUnit::Text(_)))
        }

        fn generate_template(&self, html_unit: &HtmlUnit) -> HtmlUnit {
            let mut static_props = HashMap::new();
            for (key, prop) in &html_unit.props {
                if prop.dependencies.is_empty() && !prop.is_event {
                    static_props.insert(key.clone(), prop.clone());
                }
            }

            let mut static_children: Vec<Box<ViewUnit>> = Vec::new();
            for child in &html_unit.children {
                match &**child {
                    ViewUnit::Html(child_html) => {
                        static_children.push(Box::new(ViewUnit::Html(self.generate_template(child_html))));
                    }
                    ViewUnit::Text(_) => {
                        static_children.push(child.clone());
                    }
                    _ => {}
                }
            }

            HtmlUnit {
                tag: html_unit.tag.clone(),
                props: static_props,
                children: static_children,
            }
        }

        fn generate_mutable_units(&self, html_unit: &HtmlUnit) -> Vec<MutableUnit> {
            let mut mutable_units = Vec::new();
            self.collect_mutable_units(&html_unit.children, &mut mutable_units, vec![]);
            mutable_units
        }

        fn collect_mutable_units(&self, children: &[Box<ViewUnit>], mutable_units: &mut Vec<MutableUnit>, path: Vec<usize>) {
            for (i, child) in children.iter().enumerate() {
                let mut child_path = path.clone();
                child_path.push(i);
                match &**child {
                    ViewUnit::Exp(exp_unit) => {
                        console::log_1(&JsValue::from_str(&format!("Collecting mutable unit: {} at path {:?}", exp_unit.content, child_path)));
                        mutable_units.push(MutableUnit {
                            path: child_path,
                            unit: ViewUnit::Exp(exp_unit.clone()),
                        });
                    }
                    ViewUnit::Html(html_unit) => {
                        self.collect_mutable_units(&html_unit.children, mutable_units, child_path);
                    }
                    ViewUnit::For(for_unit) => {
                        console::log_1(&JsValue::from_str(&format!("Collecting for unit: {} at path {:?}", for_unit.array, child_path)));
                        mutable_units.push(MutableUnit {
                            path: child_path.clone(),
                            unit: ViewUnit::For(for_unit.clone()),
                        });
                        self.collect_mutable_units(&for_unit.children, mutable_units, child_path);
                    }
                    _ => {
                        if let Some(children) = self.get_view_unit_children(child) {
                            self.collect_mutable_units(&children, mutable_units, child_path);
                        }
                    }
                }
            }
        }

        fn get_view_unit_children(&self, view_unit: &ViewUnit) -> Option<Vec<Box<ViewUnit>>> {
            match view_unit {
                ViewUnit::Html(html_unit) => Some(html_unit.children.clone()),
                ViewUnit::Template(template_unit) => Some(vec![Box::new(ViewUnit::Html(template_unit.template.clone()))]),
                ViewUnit::For(for_unit) => Some(for_unit.children.clone()),
                ViewUnit::If(if_unit) => {
                    let mut children = Vec::new();
                    for branch in &if_unit.branches {
                        children.extend(branch.children.clone());
                    }
                    Some(children)
                }
                ViewUnit::Fragment(fragment_unit) => Some(fragment_unit.children.clone()),
                ViewUnit::Suspense(suspense_unit) => Some(suspense_unit.children.clone()),
                _ => None,
            }
        }

        fn parse_template_props(&self, html_unit: &HtmlUnit) -> Vec<TemplateProp> {
            let mut template_props = Vec::new();
            self.collect_template_props(html_unit, &mut template_props, vec![]);
            template_props
        }

        fn collect_template_props(&self, html_unit: &HtmlUnit, template_props: &mut Vec<TemplateProp>, path: Vec<usize>) {
            for (key, prop) in &html_unit.props {
                if !prop.dependencies.is_empty() || prop.is_event {
                    template_props.push(TemplateProp {
                        tag: html_unit.tag.clone(),
                        name: html_unit.tag.clone(),
                        key: key.clone(),
                        path: path.clone(),
                        value: prop.value.clone(),
                        is_event: prop.is_event,
                    });
                }
            }

            let mut html_index = -1;
            for (_i, child) in html_unit.children.iter().enumerate() {
                if let ViewUnit::Html(child_html) = &**child {
                    if self.is_html_template(child_html) {
                        html_index += 1;
                        self.collect_template_props(child_html, template_props, [&path[..], &[html_index as usize]].concat());
                    } else {
                        html_index += 1;
                    }
                }
            }
        }
    }
}

pub mod reactivity_parser {
    use super::*;
    use serde_wasm_bindgen::to_value;
    use std::collections::HashMap;

    #[wasm_bindgen]
    pub struct ReactivityParser {
        source_map: SourceMap,
        reactive_map: HashMap<String, usize>,
        derived_map: HashMap<String, Vec<String>>,
        dep_bitmap: BitVec<u8>,
        current_index: usize,
    }

    #[wasm_bindgen]
    impl ReactivityParser {
        #[wasm_bindgen(constructor)]
        pub fn new() -> Self {
            Self {
                source_map: SourceMap::default(),
                reactive_map: HashMap::new(),
                derived_map: HashMap::new(),
                dep_bitmap: BitVec::new(),
                current_index: 0,
            }
        }

        pub fn analyze(&mut self, view_unit_json: &str) -> Result<JsValue, JsValue> {
            let view_units: Vec<ViewUnit> = serde_json::from_str(view_unit_json)
                .map_err(|e| JsValue::from_str(&format!("Deserialization error: {:?}", e)))?;

            self.reactive_map.clear();
            self.derived_map.clear();
            self.current_index = 0;
            self.dep_bitmap.clear();

            let mut dependencies = DependencyInfo::default();
            for view_unit in view_units {
                let unit_deps = self.analyze_view_unit(&view_unit)?;
                dependencies.merge(unit_deps);
            }
            serde_wasm_bindgen::to_value(&dependencies)
                .map_err(|e| JsValue::from_str(&format!("Serialization error: {:?}", e)))
        }

        pub fn analyze_expression_str(&mut self, expr: &str) -> Result<JsValue, JsValue> {
            self.reactive_map.clear();
            self.derived_map.clear();
            self.current_index = 0;
            self.dep_bitmap.clear();

            let mut dependencies = DependencyInfo::default();
            self.analyze_expression(expr, &mut dependencies)?;
            to_value(&dependencies).map_err(|e| {
                JsValue::from_str(&format!("Serialization error: {:?}", e))
            })
        }

        fn analyze_view_unit(&mut self, view_unit: &ViewUnit) -> Result<DependencyInfo, JsValue> {
            let mut dependencies = DependencyInfo::default();
            match view_unit {
                ViewUnit::Html(html_unit) => {
                    for (key, prop) in &html_unit.props {
                        if !prop.is_event {
                            self.analyze_expression(&prop.value, &mut dependencies)?;
                        }
                    }
                    for child in &html_unit.children {
                        let child_deps = self.analyze_view_unit(child)?;
                        dependencies.merge(child_deps);
                    }
                }
                ViewUnit::Template(template_unit) => {
                    for prop in &template_unit.props {
                        if !prop.is_event {
                            self.analyze_expression(&prop.value, &mut dependencies)?;
                        }
                    }
                    for mutable_unit in &template_unit.mutable_units {
                        match &mutable_unit.unit {
                            ViewUnit::Exp(exp_unit) => {
                                self.analyze_expression(&exp_unit.content, &mut dependencies)?;
                            }
                            _ => {
                                let child_deps = self.analyze_view_unit(&mutable_unit.unit)?;
                                dependencies.merge(child_deps);
                            }
                        }
                    }
                    let template_deps = self.analyze_view_unit(&ViewUnit::Html(template_unit.template.clone()))?;
                    dependencies.merge(template_deps);
                }
                ViewUnit::For(for_unit) => {
                    self.analyze_expression(&for_unit.array, &mut dependencies)?;
                    let item_index = self.get_or_create_index(&for_unit.item);
                    dependencies.add_dependency(for_unit.item.clone(), item_index);
                    for child in &for_unit.children {
                        let child_deps = self.analyze_view_unit(child)?;
                        dependencies.merge(child_deps);
                    }
                }
                ViewUnit::If(if_unit) => {
                    for branch in &if_unit.branches {
                        self.analyze_expression(&branch.condition, &mut dependencies)?;
                        for child in &branch.children {
                            let child_deps = self.analyze_view_unit(child)?;
                            dependencies.merge(child_deps);
                        }
                    }
                }
                ViewUnit::Exp(exp_unit) => {
                    self.analyze_expression(&exp_unit.content, &mut dependencies)?;
                }
                ViewUnit::State(state_unit) => {
                    let index = self.get_or_create_index(&state_unit.name);
                    dependencies.add_dependency(state_unit.name.clone(), index);
                    self.analyze_expression(&state_unit.initial_value, &mut dependencies)?;
                }
                ViewUnit::Computed(computed_unit) => {
                    self.analyze_expression(&computed_unit.expression, &mut dependencies)?;
                    let index = self.get_or_create_index(&computed_unit.name);
                    dependencies.add_dependency(computed_unit.name.clone(), index);
                }
                _ => {}
            }
            Ok(dependencies)
        }

        fn analyze_expression(&mut self, expr: &str, dependencies: &mut DependencyInfo) -> Result<(), JsValue> {
            console::log_1(&JsValue::from_str(&format!("Analyzing expression: {}", expr)));
            if expr.contains("=") {
                let parts: Vec<&str> = expr.split('=').collect();
                if parts.len() == 2 {
                    let derived_name = parts[0].trim();
                    let derived_expr = parts[1].trim();
                    self.derived_map.insert(derived_name.to_string(), vec![derived_expr.to_string()]);
                    console::log_1(&JsValue::from_str(&format!("Derived property: {} = {}", derived_name, derived_expr)));
                    self.analyze_expression(derived_expr, dependencies)?;
                    return Ok(());
                }
            }
            if expr.contains("{") || expr.contains("[") {
                let normalized_expr = expr.trim_end_matches(';').trim();
                let cache_key = normalized_expr.replace("\n", "").replace("  ", " ");
                dependencies.cache.insert(cache_key.clone(), cache_key.clone());
                console::log_1(&JsValue::from_str(&format!("Cached complex expression: {}", cache_key)));
            }

            let fm = self.source_map.new_source_file(FileName::Anon.into(), expr.into());
            let input = StringInput::from(&*fm);
            let mut parser = Parser::new(Syntax::Es(EsSyntax {
                jsx: true,
                ..Default::default()
            }), input, None);

            let expr = parser.parse_expr().map_err(|e| {
                console::log_1(&JsValue::from_str(&format!("Expression parse error: {:?}", e)));
                JsValue::from_str(&format!("Expression parse error: {:?}", e))
            })?;

            console::log_1(&JsValue::from_str(&format!("Parsed expression: {:?}", expr)));
            let mut identifiers = std::collections::HashSet::new();
            self.traverse_identifiers(&*expr, &mut identifiers);
            console::log_1(&JsValue::from_str(&format!("Identifiers found: {:?}", identifiers)));

            for ident in identifiers {
                let bit = self.get_or_create_bit(&ident);
                console::log_1(&JsValue::from_str(&format!("Adding dependency: {} with bit {}", ident, bit)));
                dependencies.add_dependency(ident, bit);
            }

            Ok(())
        }

        fn traverse_identifiers(&self, expr: &Expr, identifiers: &mut std::collections::HashSet<String>) {
            match expr {
                Expr::Ident(ident) => {
                    identifiers.insert(ident.sym.to_string());
                }
                Expr::Bin(bin_expr) => {
                    self.traverse_identifiers(&bin_expr.left, identifiers);
                    self.traverse_identifiers(&bin_expr.right, identifiers);
                }
                Expr::Member(member) => {
                    self.traverse_identifiers(&member.obj, identifiers);
                }
                Expr::Call(call) => {
                    if let Callee::Expr(expr) = &call.callee {
                        self.traverse_identifiers(expr, identifiers);
                    }
                    for arg in &call.args {
                        self.traverse_identifiers(&arg.expr, identifiers);
                    }
                    if let Callee::Expr(boxed_expr) = &call.callee {
                        if let Expr::Member(member) = &**boxed_expr {
                            if let Expr::Ident(_ident) = &*member.obj {
                                if member.prop.as_ident().map(|i| i.sym == "map").unwrap_or(false) {
                                    if let Some(ExprOrSpread { expr, .. }) = call.args.get(0) {
                                        if let Expr::Arrow(arrow) = &**expr {
                                            if let Some(Pat::Ident(param)) = arrow.params.get(0) {
                                                identifiers.insert(param.id.sym.to_string());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                Expr::Lit(_) => {} // 忽略字面量
                _ => {}
            }
        }

        pub fn get_or_create_index(&mut self, ident: &str) -> usize {
            if let Some(&index) = self.reactive_map.get(ident) {
                index
            } else {
                let index = self.current_index;
                self.reactive_map.insert(ident.to_string(), index);
                self.dep_bitmap.push(true);
                self.current_index += 1;
                index
            }
        }

        pub fn get_or_create_bit(&mut self, ident: &str) -> usize {
            self.get_or_create_index(ident)
        }
    }
}

pub mod generator {
    use super::*;


    #[wasm_bindgen]
    pub struct Generator {
        // 配置
    }

    #[wasm_bindgen]
    impl Generator {
        #[wasm_bindgen(constructor)]
        pub fn new() -> Self {
            Self {}
        }

        pub fn generate(&self, view_unit_json: &str, dep_info_json: &str) -> Result<JsValue, JsValue> {
            let view_units: Vec<ViewUnit> = serde_json::from_str(view_unit_json)
                .map_err(|e| JsValue::from_str(&format!("Deserialization error: {:?}", e)))?;
            let dep_info: DependencyInfo = serde_json::from_str(dep_info_json)
                .map_err(|e| JsValue::from_str(&format!("Deserialization error: {:?}", e)))?;

            let mut code = String::new();
            // 仅为状态和计算属性生成 useState 声明
            for view_unit in &view_units {
                match view_unit {
                    ViewUnit::State(state_unit) => {
                        code.push_str(&format!(
                            "const [{}, set{}] = useState({});\n",
                            state_unit.name,
                            state_unit.name.chars().next().unwrap().to_uppercase().to_string() + &state_unit.name[1..],
                            state_unit.initial_value
                        ));
                    }
                    ViewUnit::Computed(computed_unit) => {
                        code.push_str(&format!(
                            "const {} = {};\n",
                            computed_unit.name,
                            computed_unit.expression
                        ));
                    }
                    _ => {}
                }
            }

            // 生成静态和动态部分
            for view_unit in view_units {
                self.generate_view_unit(&view_unit, &dep_info, &mut code)?;
            }
            console::log_1(&JsValue::from_str(&format!("Generated code: {}", code)));
            Ok(JsValue::from_str(&code))
        }

        fn generate_view_unit(&self, view_unit: &ViewUnit, dep_info: &DependencyInfo, code: &mut String) -> Result<(), JsValue> {
            match view_unit {
                ViewUnit::Html(html_unit) => {
                    code.push_str(&format!("const {} = document.createElement('{}');\n", html_unit.tag, html_unit.tag));
                    for (key, prop) in &html_unit.props {
                        if prop.is_event {
                            code.push_str(&format!(
                                "{}.addEventListener('{}', {});\n",
                                html_unit.tag,
                                key.trim_start_matches("on").to_lowercase(),
                                prop.value
                            ));
                        } else {
                            let value = if prop.dependencies.is_empty() {
                                format!("'{}'", prop.value.trim_matches('"'))
                            } else {
                                prop.value.clone()
                            };
                            code.push_str(&format!(
                                "{}.setAttribute('{}', {});\n",
                                html_unit.tag,
                                key,
                                value
                            ));
                        }
                    }
                    for (i, child) in html_unit.children.iter().enumerate() {
                        self.generate_view_unit(child, dep_info, code)?;
                        code.push_str(&format!("{}.appendChild({});\n", html_unit.tag, self.get_node_ref(child, i)));
                    }
                }
                ViewUnit::Template(template_unit) => {
                    // 生成模板的根节点
                    code.push_str(&format!("const template = document.createElement('{}');\n", template_unit.template.tag));
                    for (key, prop) in &template_unit.template.props {
                        if prop.is_event {
                            code.push_str(&format!(
                                "template.addEventListener('{}', {});\n",
                                key.trim_start_matches("on").to_lowercase(),
                                prop.value
                            ));
                        } else {
                            let value = if prop.dependencies.is_empty() {
                                format!("'{}'", prop.value.trim_matches('"'))
                            } else {
                                prop.value.clone()
                            };
                            code.push_str(&format!(
                                "template.setAttribute('{}', {});\n",
                                key,
                                value
                            ));
                        }
                    }
                    // 递归生成模板的子节点
                    for (i, child) in template_unit.template.children.iter().enumerate() {
                        self.generate_view_unit(child, dep_info, code)?;
                        code.push_str(&format!("template.appendChild({});\n", self.get_node_ref(child, i)));
                    }
                    // 处理动态属性
                    for prop in &template_unit.props {
                        let target_node = if prop.path.is_empty() {
                            "template".to_string()
                        } else {
                            let path_str = prop.path.iter().map(|i| i.to_string()).collect::<Vec<_>>().join("_");
                            format!("node_{}", path_str)
                        };
                        if prop.is_event {
                            code.push_str(&format!(
                                "{}.addEventListener('{}', {});\n",
                                prop.tag,
                                prop.key.trim_start_matches("on").to_lowercase(),
                                prop.value
                            ));
                        } else {
                            let value = if prop.value.starts_with('"') && prop.value.ends_with('"') {
                                format!("'{}'", prop.value.trim_matches('"'))
                            } else {
                                prop.value.clone()
                            };
                            code.push_str(&format!(
                                "{}.setAttribute('{}', {});\n",
                                prop.tag,
                                prop.key,
                                value
                            ));
                        }
                    }
                    // 处理可变单元
                    for mu in &template_unit.mutable_units {
                        let path_str = mu.path.iter().map(|i| i.to_string()).collect::<Vec<_>>().join("_");
                        match &mu.unit {
                            ViewUnit::Exp(exp_unit) => {
                                code.push_str(&format!(
                                    "const node_{} = document.createTextNode({});\n",
                                    path_str,
                                    exp_unit.content
                                ));
                                let parent_node = if mu.path.len() > 1 {
                                    format!("node_{}", mu.path[..mu.path.len()-1].iter().map(|i| i.to_string()).collect::<Vec<_>>().join("_"))
                                } else {
                                    match &*template_unit.template.children[mu.path[0]] {
                                        ViewUnit::Html(html_unit) => html_unit.tag.clone(),
                                        _ => "template".to_string()
                                    }
                                };
                                code.push_str(&format!("{}.appendChild(node_{});\n", parent_node, path_str));
                            }
                            ViewUnit::For(for_unit) => {
                                code.push_str(&format!(
                                    "{}.forEach(({}, {}) => {{\n",
                                    for_unit.array,
                                    for_unit.item,
                                    for_unit.index.as_ref().unwrap_or(&"index".to_string())
                                ));
                                for child in &for_unit.children {
                                    self.generate_view_unit(child, dep_info, code)?;
                                    code.push_str(&format!("template.appendChild({});\n", self.get_node_ref(child, 0)));
                                }
                                code.push_str("});\n");
                            }
                            _ => {}
                        }
                    }
                }
                ViewUnit::Text(text_unit) => {
                    code.push_str(&format!(
                        "const text = document.createTextNode('{}');\n",
                        text_unit.content
                    ));
                }
                ViewUnit::State(state_unit) => {
                    // 状态声明已在 generate 方法中处理
                }
                ViewUnit::Computed(computed_unit) => {
                    // 计算属性已在 generate 方法中处理
                }
                _ => {}
            }
            Ok(())
        }

        fn get_node_ref(&self, view_unit: &ViewUnit, index: usize) -> String {
            match view_unit {
                ViewUnit::Html(html_unit) => html_unit.tag.clone(),
                ViewUnit::Text(_) => "text".to_string(),
                ViewUnit::Exp(exp_unit) => format!("node_{}", exp_unit.content.replace(".", "_")),
                _ => format!("node_{}", index),
            }
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct DependencyInfo {
    pub dependencies: HashMap<String, usize>,
    pub total_bitmap: BitVec<u8>,
    pub cache: HashMap<String, String>,
}

impl DependencyInfo {
    pub fn add_dependency(&mut self, ident: String, index: usize) {
        self.dependencies.insert(ident.clone(), index);
        if index >= self.total_bitmap.len() {
            self.total_bitmap.resize(index + 1, false);
        }
        self.total_bitmap.set(index, true);
    }

    pub fn merge(&mut self, other: DependencyInfo) {
        for (ident, index) in other.dependencies {
            self.add_dependency(ident, index);
        }
        for (key, value) in other.cache {
            self.cache.insert(key, value);
        }
        for (i, bit) in other.total_bitmap.iter().enumerate() {
            if *bit {
                if i >= self.total_bitmap.len() {
                    self.total_bitmap.resize(i + 1, false);
                }
                self.total_bitmap.set(i, true);
            }
        }
    }
}

#[wasm_bindgen]
pub fn compile_jsx(jsx: &str) -> Result<JsValue, JsValue> {
    let parser = jsx_parser::JsxParser::new();
    parser.parse(jsx)
}

#[wasm_bindgen]
pub fn analyze_reactivity(view_unit_json: &str) -> Result<JsValue, JsValue> {
    let mut parser = reactivity_parser::ReactivityParser::new();
    parser.analyze(view_unit_json)
}

#[wasm_bindgen]
pub fn generate_code(view_unit_json: &str, dep_info_json: &str) -> Result<JsValue, JsValue> {
    let generator = generator::Generator::new();
    generator.generate(view_unit_json, dep_info_json)
}

pub mod bitmap {
    use super::*;
    pub fn create_dependency_bitmap() -> BitVec<u8> {
        BitVec::new()
    }
}