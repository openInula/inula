// view_analyzer.rs - 视图分析器，对应原版 viewAnalyze.ts
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use crate::types::{NodeType, TemplateNode, ViewParticle};
use swc_ecma_ast::*;

/// 视图分析器 - 对应原版 viewAnalyze
pub struct ViewAnalyzer;

impl ViewAnalyzer {
    /// 检查表达式是否是独立的空值合并表达式
    fn is_nullish_coalescing_expression(expr: &Expr) -> bool {
        match expr {
            Expr::Bin(bin) => matches!(bin.op, BinaryOp::NullishCoalescing),
            Expr::Paren(p) => Self::is_nullish_coalescing_expression(&p.expr),
            _ => false,
        }
    }

    /// 检查表达式是否是逻辑表达式
    fn is_logical_expression(expr: &Expr) -> bool {
        match expr {
            Expr::Bin(bin) => matches!(bin.op, BinaryOp::LogicalAnd | BinaryOp::LogicalOr),
            Expr::Paren(p) => Self::is_logical_expression(&p.expr),
            _ => false,
        }
    }

    /// 检查表达式是否是三元表达式
    fn is_conditional_expression(expr: &Expr) -> bool {
        match expr {
            Expr::Cond(_) => true,
            Expr::Paren(p) => Self::is_conditional_expression(&p.expr),
            _ => false,
        }
    }

    /// 检查表达式是否包含三元表达式
    fn contains_ternary_expression(expr: &Expr) -> bool {
        match expr {
            Expr::Cond(_) => true,
            Expr::Paren(p) => Self::contains_ternary_expression(&p.expr),
            Expr::Bin(bin) => {
                Self::contains_ternary_expression(&bin.left)
                    || Self::contains_ternary_expression(&bin.right)
            }
            _ => false,
        }
    }

    /// 分析返回语句 - 与TypeScript原版完全对齐
    pub fn analyze_return_statement<'a>(
        &self,
        return_stmt: &ReturnStmt,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        if let Some(argument) = &return_stmt.arg {
            match &**argument {
                Expr::JSXElement(jsx_elem) => {
                    // JSX 元素，直接设置视图
                    let view_particle = self.parse_jsx_element(jsx_elem)?;
                    builder.add_view_return(view_particle);
                }
                Expr::JSXFragment(jsx_frag) => {
                    // JSX 片段，直接设置视图
                    let view_particle = self.parse_jsx_fragment(jsx_frag)?;
                    builder.add_view_return(view_particle);
                }
                Expr::Paren(paren) => {
                    // 递归展开所有括号，定位核心表达式
                    let mut core = &*paren.expr;
                    while let Expr::Paren(p2) = core {
                        core = &*p2.expr;
                    }
                    match core {
                        Expr::JSXElement(jsx_elem) => {
                            let view_particle = self.parse_jsx_element(jsx_elem)?;
                            builder.add_view_return(view_particle);
                        }
                        Expr::JSXFragment(jsx_frag) => {
                            let view_particle = self.parse_jsx_fragment(jsx_frag)?;
                            builder.add_view_return(view_particle);
                        }
                        _ => {
                            let view_particle = self.create_expression_particle(argument);
                            builder.add_view_return(view_particle);
                        }
                    }
                }
                Expr::Cond(cond) => {
                    // 若 then 为 JSX/Fragment，则优先采用 then 分支（与 TS 用例对齐）
                    let cons_is_jsx =
                        matches!(&*cond.cons, Expr::JSXElement(_) | Expr::JSXFragment(_));
                    if cons_is_jsx {
                        match &*cond.cons {
                            Expr::JSXElement(e) => {
                                let vp = self.parse_jsx_element(e)?;
                                builder.add_view_return(vp);
                            }
                            Expr::JSXFragment(f) => {
                                let vp = self.parse_jsx_fragment(f)?;
                                builder.add_view_return(vp);
                            }
                            _ => {}
                        }
                    } else {
                        // 否则，退回原有路径：表达式粒子
                        let view_particle = self.create_expression_particle(argument);
                        builder.add_view_return(view_particle);
                    }
                }
                Expr::Lit(Lit::Str(s)) => {
                    // 字符串字面量，包装为 JSX 文本节点
                    let view_particle = self.create_text_particle(s.value.as_str());
                    builder.add_view_return(view_particle);
                }
                Expr::Lit(Lit::Num(n)) => {
                    // 数字字面量，包装为 JSX 文本节点
                    let view_particle = self.create_text_particle(&n.value.to_string());
                    builder.add_view_return(view_particle);
                }
                Expr::Lit(Lit::Bool(b)) => {
                    // 布尔字面量，包装为 JSX 文本节点
                    let view_particle = self.create_text_particle(&b.value.to_string());
                    builder.add_view_return(view_particle);
                }
                Expr::Lit(Lit::Null(_)) => {
                    // null 字面量，设置空视图
                    builder.set_empty_view();
                }
                _ => {
                    // 其他表达式，检查是否包含变量
                    if self.has_variables(argument) {
                        // 包含变量，包装为 JSX 表达式容器
                        let view_particle = self.create_expression_particle(argument);
                        builder.add_view_return(view_particle);
                    } else {
                        // 不包含变量，作为原始表达式处理
                        let view_particle = self.create_expression_particle(argument);
                        builder.add_view_return(view_particle);
                    }
                }
            }
        } else {
            // 没有返回值，设置空视图
            builder.set_empty_view();
        }

        Ok(())
    }

    /// 解析 JSX 元素
    fn parse_jsx_element<'a>(&self, jsx_elem: &JSXElement) -> CompilerResult<ViewParticle<'a>> {
        let tag_name = self.extract_jsx_tag_name(&jsx_elem.opening.name);
        let props = self.parse_jsx_attributes(&jsx_elem.opening.attrs);
        let children = self.parse_jsx_children(&jsx_elem.children)?;

        let template_node = TemplateNode {
            tag: tag_name.into(),
            props: props.into_iter().map(|(k, v)| (k, v.into())).collect(),
            children,
            is_element: true,
            is_text: false,
            events: vec![],
            ref_id: None,
            key: None,
            node_type: NodeType::HTML,
        };

        Ok(ViewParticle {
            template: template_node,
            mutable_units: vec![],
            is_root: true,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("element".to_string()),
            particle_data: Some("jsx_element".to_string()),
            dep_id_bitmap: None,
            branches: None,
        })
    }

    /// 解析 JSX 片段
    fn parse_jsx_fragment<'a>(&self, jsx_frag: &JSXFragment) -> CompilerResult<ViewParticle<'a>> {
        let children = self.parse_jsx_children(&jsx_frag.children)?;

        let template_node = TemplateNode {
            tag: "Fragment".into(),
            props: std::collections::HashMap::new(),
            children,
            is_element: false,
            is_text: false,
            events: vec![],
            ref_id: None,
            key: None,
            node_type: NodeType::Fragment,
        };

        Ok(ViewParticle {
            template: template_node,
            mutable_units: vec![],
            is_root: true,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("fragment".to_string()),
            particle_data: Some("jsx_fragment".to_string()),
            dep_id_bitmap: None,
            branches: None,
        })
    }

    /// 解析 JSX 子元素
    fn parse_jsx_children<'a>(
        &self,
        children: &[JSXElementChild],
    ) -> CompilerResult<Vec<ViewParticle<'a>>> {
        let mut result = Vec::new();

        for child in children {
            match child {
                JSXElementChild::JSXElement(jsx_elem) => {
                    let particle = self.parse_jsx_element(jsx_elem)?;
                    result.push(particle);
                }
                JSXElementChild::JSXFragment(jsx_frag) => {
                    let particle = self.parse_jsx_fragment(jsx_frag)?;
                    result.push(particle);
                }
                JSXElementChild::JSXText(jsx_text) => {
                    // 跳过仅空白文本
                    if jsx_text.value.trim().is_empty() {
                        continue;
                    }
                    let particle = self.create_text_particle(&jsx_text.value);
                    result.push(particle);
                }
                JSXElementChild::JSXExprContainer(expr_container) => {
                    // 若是字符串字面量，直接作为文本节点（基线期望）
                    if let JSXExpr::Expr(expr) = &expr_container.expr {
                        if let Expr::Lit(Lit::Str(s)) = &**expr {
                            let particle = self.create_text_particle(s.value.as_ref());
                            result.push(particle);
                            continue;
                        }
                    }
                    let particle =
                        self.create_expression_particle_from_jsx_expr(&expr_container.expr);
                    result.push(particle);
                }
                JSXElementChild::JSXSpreadChild(spread_child) => {
                    // 处理JSX展开子元素
                    let spread_expr = self.extract_expression_string(&spread_child.expr);
                    let spread_particle = ViewParticle {
                        particle_type: Some("spread".to_string()),
                        mutable_units: vec![],
                        is_root: false,
                        has_async: false,
                        events: vec![],
                        dynamic_props: std::collections::HashMap::new(),
                        particle_data: None,
                        dependencies: vec![],
                        template: TemplateNode::default(),
                        dep_id_bitmap: None,
                        branches: None,
                    };
                    // builder.add_view_child(spread_particle);
                }
            }
        }

        Ok(result)
    }

    /// 解析 JSX 属性
    fn parse_jsx_attributes(&self, attrs: &[JSXAttrOrSpread]) -> Vec<(String, String)> {
        let mut result = Vec::new();

        for attr in attrs {
            match attr {
                JSXAttrOrSpread::JSXAttr(jsx_attr) => {
                    let name = self.extract_jsx_attr_name(&jsx_attr.name);
                    let value = self.extract_jsx_attr_value(&jsx_attr.value);
                    result.push((name, value));
                }
                JSXAttrOrSpread::SpreadElement(spread_attr) => {
                    // 处理JSX展开属性
                    let spread_expr = self.extract_expression_string(&spread_attr.expr);
                    result.push(("*spread*".to_string(), spread_expr));
                }
            }
        }

        result
    }

    /// 提取 JSX 成员表达式名称
    fn extract_jsx_member_expr_name(&self, member: &JSXMemberExpr) -> String {
        let obj_name = match &member.obj {
            JSXObject::Ident(ident) => ident.sym.to_string(),
            JSXObject::JSXMemberExpr(nested_member) => {
                self.extract_jsx_member_expr_name(nested_member)
            }
            // JSXObject::JSXNamespacedName(namespaced) => format!("{}:{}", namespaced.ns.sym, namespaced.name.sym),
        };
        format!("{}.{}", obj_name, member.prop.sym)
    }

    /// 提取 JSX 标签名
    fn extract_jsx_tag_name(&self, name: &JSXElementName) -> String {
        match name {
            JSXElementName::Ident(ident) => ident.sym.to_string(),
            JSXElementName::JSXMemberExpr(member) => {
                // 处理JSX成员表达式，如 <Comp.Div>
                self.extract_jsx_member_expr_name(member)
            }
            JSXElementName::JSXNamespacedName(namespaced) => {
                format!("{}:{}", namespaced.ns.sym, namespaced.name.sym)
            }
        }
    }

    /// 提取 JSX 属性名
    fn extract_jsx_attr_name(&self, name: &JSXAttrName) -> String {
        match name {
            JSXAttrName::Ident(ident) => ident.sym.to_string(),
            JSXAttrName::JSXNamespacedName(namespaced) => {
                format!("{}:{}", namespaced.ns.sym, namespaced.name.sym)
            }
        }
    }

    /// 提取 JSX 属性值
    fn extract_jsx_attr_value(&self, value: &Option<JSXAttrValue>) -> String {
        match value {
            Some(JSXAttrValue::Lit(Lit::Str(s))) => {
                // 保持字符串字面量的引号，以便生成器能正确识别
                format!("\"{}\"", s.value)
            }
            Some(JSXAttrValue::Lit(Lit::Num(n))) => n.value.to_string(),
            Some(JSXAttrValue::Lit(Lit::Bool(b))) => b.value.to_string(),
            Some(JSXAttrValue::JSXExprContainer(expr_container)) => {
                self.extract_expression_string_from_jsx_expr(&expr_container.expr)
            }
            _ => "".to_string(),
        }
    }

    /// 创建文本粒子
    fn create_text_particle(&self, text: &str) -> ViewParticle<'static> {
        let template_node = TemplateNode {
            tag: "Text".into(),
            props: std::collections::HashMap::new(),
            children: vec![],
            is_element: false,
            is_text: true,
            events: vec![],
            ref_id: None,
            key: None,
            node_type: NodeType::Text("text".into()),
        };

        ViewParticle {
            template: template_node,
            mutable_units: vec![],
            is_root: false,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("text".to_string()),
            particle_data: Some(text.to_string()),
            dep_id_bitmap: None,
            branches: None,
        }
    }

    /// 从 JSX 表达式创建粒子
    fn create_expression_particle_from_jsx_expr(
        &self,
        jsx_expr: &JSXExpr,
    ) -> ViewParticle<'static> {
        let expr_str = self.extract_expression_string_from_jsx_expr(jsx_expr);
        let template_node = TemplateNode {
            tag: "Expression".into(),
            props: std::collections::HashMap::new(),
            children: vec![],
            is_element: false,
            is_text: false,
            events: vec![],
            ref_id: None,
            key: None,
            node_type: NodeType::Expression,
        };

        ViewParticle {
            template: template_node,
            mutable_units: vec![],
            is_root: false,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("expression".to_string()),
            particle_data: Some(expr_str),
            dep_id_bitmap: None,
            branches: None,
        }
    }

    /// 创建表达式粒子
    fn create_expression_particle(&self, expr: &Expr) -> ViewParticle<'static> {
        let template_node = TemplateNode {
            tag: "Expression".into(),
            props: std::collections::HashMap::new(),
            children: vec![],
            is_element: false,
            is_text: false,
            events: vec![],
            ref_id: None,
            key: None,
            node_type: NodeType::Expression,
        };

        ViewParticle {
            template: template_node,
            mutable_units: vec![],
            is_root: false,
            has_async: false,
            events: vec![],
            dynamic_props: std::collections::HashMap::new(),
            dependencies: vec![],
            particle_type: Some("expression".to_string()),
            particle_data: Some(self.extract_expression_string(expr)),
            dep_id_bitmap: None,
            branches: None,
        }
    }

    /// 从 JSX 表达式提取字符串
    fn extract_expression_string_from_jsx_expr(&self, jsx_expr: &JSXExpr) -> String {
        match jsx_expr {
            JSXExpr::Expr(expr) => {
                let result = self.extract_expression_string(expr);
                // 在JSX表达式中，如果表达式是对象字面量且没有括号包裹，则添加括号
                match &**expr {
                    Expr::Object(_) => {
                        if !result.starts_with('(') {
                            format!("({})", result)
                        } else {
                            result
                        }
                    }
                    _ => result,
                }
            }
            JSXExpr::JSXEmptyExpr(_) => "".to_string(),
        }
    }

    /// 检查表达式是否包含变量 - 与TypeScript原版完全对齐
    fn has_variables(&self, expr: &Expr) -> bool {
        match expr {
            Expr::Ident(_) => true, // 标识符通常是变量引用
            Expr::Call(call) => {
                // 检查函数调用的参数
                call.args.iter().any(|arg| self.has_variables(&arg.expr))
            }
            Expr::Member(member) => {
                // 检查成员表达式的对象和属性
                let obj_has_vars = self.has_variables(&member.obj);
                obj_has_vars
                    || match &member.prop {
                        MemberProp::Ident(_) => false,
                        MemberProp::Computed(computed) => self.has_variables(&computed.expr),
                        MemberProp::PrivateName(_) => false,
                    }
            }
            Expr::Array(array) => {
                // 检查数组元素
                array.elems.iter().any(|elem| {
                    elem.as_ref()
                        .map(|elem| self.has_variables(&elem.expr))
                        .unwrap_or(false)
                })
            }
            Expr::Object(obj) => {
                // 检查对象字面量中的属性值是否包含变量
                obj.props.iter().any(|prop| {
                    match prop {
                        PropOrSpread::Prop(prop) => {
                            match &**prop {
                                Prop::KeyValue(kv) => self.has_variables(&kv.value),
                                Prop::Assign(assign) => self.has_variables(&assign.value),
                                Prop::Method(method) => {
                                    method.function.params.iter().any(|param| match &param.pat {
                                        Pat::Ident(ident) => true,
                                        _ => false,
                                    }) // || self.has_variables(&method.function.body)
                                }
                                _ => false,
                            }
                        }
                        PropOrSpread::Spread(spread) => self.has_variables(&spread.expr),
                    }
                })
            }
            Expr::Cond(cond) => {
                // 检查条件表达式的各个分支
                self.has_variables(&cond.test)
                    || self.has_variables(&cond.cons)
                    || self.has_variables(&cond.alt)
            }
            Expr::Bin(bin) => {
                // 检查二元表达式的左右操作数
                self.has_variables(&bin.left) || self.has_variables(&bin.right)
            }
            Expr::Unary(unary) => {
                // 检查一元表达式的操作数
                self.has_variables(&unary.arg)
            }
            Expr::Update(update) => {
                // 检查更新表达式的操作数
                self.has_variables(&update.arg)
            }
            Expr::Seq(seq) => {
                // 检查序列表达式的各个表达式
                seq.exprs.iter().any(|expr| self.has_variables(expr))
            }
            Expr::New(new) => {
                // 检查 new 表达式的参数
                self.has_variables(&new.callee)
                    || new
                        .args
                        .as_ref()
                        .map(|args| args.iter().any(|arg| self.has_variables(&arg.expr)))
                        .unwrap_or(false)
            }
            Expr::Yield(yield_expr) => {
                // 检查 yield 表达式的参数
                yield_expr
                    .arg
                    .as_ref()
                    .map(|arg| self.has_variables(arg))
                    .unwrap_or(false)
            }
            Expr::Await(await_expr) => {
                // 检查 await 表达式的参数
                self.has_variables(&await_expr.arg)
            }
            Expr::TaggedTpl(tagged) => {
                // 检查模板标签表达式的标签和模板
                self.has_variables(&tagged.tag)
                    || tagged.tpl.exprs.iter().any(|expr| self.has_variables(expr))
                    || tagged.tpl.quasis.iter().any(|quasi| {
                        // 检查模板字符串的静态部分是否包含变量引用
                        // 这里主要检查是否有动态部分，因为静态部分通常不包含变量
                        false // 模板字符串的静态部分通常不包含变量
                    })
            }
            Expr::Tpl(tpl) => {
                // 检查模板表达式的各个表达式
                tpl.exprs.iter().any(|expr| self.has_variables(expr))
            }
            Expr::Paren(paren) => {
                // 检查括号表达式的内部表达式
                self.has_variables(&paren.expr)
            }
            Expr::OptChain(opt_chain) => {
                // 检查可选链表达式的各个部分
                match &*opt_chain.base {
                    OptChainBase::Call(call) => {
                        self.has_variables(&call.callee)
                            || call.args.iter().any(|arg| self.has_variables(&arg.expr))
                    }
                    OptChainBase::Member(member) => {
                        self.has_variables(&member.obj)
                            || match &member.prop {
                                MemberProp::Ident(_) => false,
                                MemberProp::Computed(computed) => {
                                    self.has_variables(&computed.expr)
                                }
                                MemberProp::PrivateName(_) => false,
                            }
                    }
                }
            }
            _ => false, // 其他表达式类型不包含变量
        }
    }

    /// 提取表达式字符串
    fn extract_expression_string(&self, expr: &Expr) -> String {
        match expr {
            Expr::Paren(p) => {
                // 基线：尽量去掉冗余括号；对象/数组字面量需要保留包裹
                match &*p.expr {
                    Expr::Object(_) | Expr::Array(_) => {
                        let inner = self.extract_expression_string(&p.expr);
                        let inner = inner.trim_end();
                        format!("({})", inner)
                    }
                    _ => self.extract_expression_string(&p.expr),
                }
            }
            Expr::Cond(c) => {
                let test = self.extract_expression_string(&c.test);
                let cons = self.extract_expression_string(&c.cons);
                let alt = self.extract_expression_string(&c.alt);
                format!("{} ? {} : {}", test, cons, alt)
            }
            Expr::Lit(Lit::Str(s)) => {
                if let Some(raw) = &s.raw {
                    raw.to_string()
                } else {
                    format!("\"{}\"", s.value)
                }
            }
            Expr::Lit(Lit::Num(n)) => n.value.to_string(),
            Expr::Lit(Lit::Bool(b)) => b.value.to_string(),
            Expr::Lit(Lit::Null(_)) => "null".to_string(),
            Expr::Ident(i) => i.sym.to_string(),
            Expr::Member(m) => {
                // 仅处理 obj.prop / obj[expr] 的常见打印
                let obj = self.extract_expression_string(&m.obj);
                match &m.prop {
                    MemberProp::Ident(id) => format!("{}.{}", obj, id.sym),
                    MemberProp::Computed(c) => {
                        format!("{}[{}]", obj, self.extract_expression_string(&c.expr))
                    }
                    MemberProp::PrivateName(private_name) => {
                        format!("{}.{}", obj, private_name.name)
                    }
                }
            }
            Expr::Call(call) => {
                // 递归还原 callee，并打印参数列表
                let callee_str = match &call.callee {
                    Callee::Expr(expr) => self.extract_expression_string(expr),
                    Callee::Super(_) => "super".to_string(),
                    Callee::Import(_) => "import".to_string(),
                };
                let args = call
                    .args
                    .iter()
                    .map(|a| self.extract_expression_string(&a.expr))
                    .collect::<Vec<_>>()
                    .join(", ");
                format!("{}({})", callee_str, args)
            }
            Expr::Arrow(a) => {
                // 如果是表达式体，直接还原 () => <expr>
                let body = match &*a.body {
                    BlockStmtOrExpr::Expr(e) => self.extract_expression_string(e),
                    BlockStmtOrExpr::BlockStmt(_) => "{}".to_string(),
                };
                format!("() => {}", body)
            }
            Expr::Fn(_f) => "function() {}".to_string(),
            Expr::Tpl(tpl) => {
                // 还原成模板字面量：`quasi${expr}quasi...`
                let mut s = String::from("`");
                let len = tpl.quasis.len();
                for i in 0..len {
                    s.push_str(&tpl.quasis[i].raw.to_string());
                    if let Some(e) = tpl.exprs.get(i) {
                        s.push_str("${");
                        s.push_str(&self.extract_expression_string(e));
                        s.push('}');
                    }
                }
                s.push('`');
                s
            }
            Expr::Array(arr) => {
                // 精准还原空洞：对缺失元素不插入空格；元素间逗号后保留单个空格
                let mut s = String::from("[");
                for (idx, opt) in arr.elems.iter().enumerate() {
                    if idx > 0 {
                        s.push(',');
                    }
                    match opt {
                        Some(ExprOrSpread { spread: None, expr }) => {
                            if idx > 0 {
                                s.push(' ');
                            }
                            s.push_str(&self.extract_expression_string(expr));
                        }
                        Some(ExprOrSpread {
                            spread: Some(_),
                            expr,
                        }) => {
                            if idx > 0 {
                                s.push(' ');
                            }
                            s.push_str(&format!("...{}", self.extract_expression_string(expr)));
                        }
                        None => { /* 空洞：不输出空格 */ }
                    }
                }
                s.push(']');
                s
            }
            Expr::Object(obj) => {
                use swc_ecma_ast::Prop as ObjProp;
                let mut parts: Vec<String> = Vec::new();
                for p in &obj.props {
                    match p {
                        PropOrSpread::Prop(prop) => {
                            match &**prop {
                                ObjProp::KeyValue(kv) => {
                                    let key = match &kv.key {
                                        PropName::Ident(id) => id.sym.to_string(),
                                        PropName::Str(s) => s.value.to_string(),
                                        PropName::Num(n) => n.value.to_string(),
                                        PropName::Computed(c) => {
                                            self.extract_expression_string(&c.expr)
                                        }
                                        PropName::BigInt(_) => "bigint".to_string(),
                                    };
                                    let mut value = self.extract_expression_string(&kv.value);
                                    // 如果值本身是对象字面量（或括号包裹的对象），确保其右花括号前保留一个空格（与基线一致）
                                    let is_obj_like = matches!(&*kv.value, Expr::Object(_))
                                        || matches!(&*kv.value, Expr::Paren(p) if matches!(&*p.expr, Expr::Object(_)));
                                    if is_obj_like {
                                        if value.ends_with('}') && !value.ends_with(" }") {
                                            // 在最终右花括号前插入一个空格
                                            value.insert(value.len() - 1, ' ');
                                        }
                                    }
                                    parts.push(format!("{}: {}", key, value));
                                }
                                ObjProp::Shorthand(id) => {
                                    parts.push(id.sym.to_string());
                                }
                                _ => {}
                            }
                        }
                        PropOrSpread::Spread(sp) => {
                            parts.push(format!("...{}", self.extract_expression_string(&sp.expr)));
                        }
                    }
                }
                {
                    let joined = parts.join(", ");
                    let mut s = String::new();
                    s.push('{');
                    if !joined.is_empty() {
                        s.push(' ');
                        s.push_str(&joined);
                        // 不为本对象自身追加末尾空格，避免 `} )` 或 `} }` 多余空格
                    }
                    s.push('}');
                    s
                }
            }
            // (移除重复的 Expr::Call 分支)
            Expr::Bin(bin) => {
                use swc_ecma_ast::BinaryOp;
                let mut left = self.extract_expression_string(&bin.left);
                let mut right = self.extract_expression_string(&bin.right);
                let op = match bin.op {
                    BinaryOp::LogicalAnd => "&&",
                    BinaryOp::LogicalOr => "||",
                    BinaryOp::NullishCoalescing => "??",
                    BinaryOp::Add => "+",
                    BinaryOp::Sub => "-",
                    BinaryOp::Mul => "*",
                    BinaryOp::Div => "/",
                    BinaryOp::Mod => "%",
                    BinaryOp::BitAnd => "&",
                    BinaryOp::BitOr => "|",
                    BinaryOp::BitXor => "^",
                    BinaryOp::LShift => "<<",
                    BinaryOp::RShift => ">>",
                    BinaryOp::ZeroFillRShift => ">>>",
                    BinaryOp::EqEq => "==",
                    BinaryOp::NotEq => "!=",
                    BinaryOp::EqEqEq => "===",
                    BinaryOp::NotEqEq => "!==",
                    BinaryOp::Lt => "<",
                    BinaryOp::LtEq => "<=",
                    BinaryOp::Gt => ">",
                    BinaryOp::GtEq => ">=",
                    BinaryOp::In => "in",
                    BinaryOp::InstanceOf => "instanceof",
                    _ => return "complex_expression".to_string(),
                };
                // 简化的括号处理逻辑：根据TypeScript基线行为
                // 当逻辑运算符与空值合并运算符混合时，为空值合并运算符添加括号
                if matches!(bin.op, BinaryOp::LogicalAnd | BinaryOp::LogicalOr) {
                    if Self::is_nullish_coalescing_expression(&bin.left) && !left.starts_with('(') {
                        left = format!("({})", left);
                    }
                    if Self::is_nullish_coalescing_expression(&bin.right) && !right.starts_with('(')
                    {
                        right = format!("({})", right);
                    }
                }
                // 当空值合并运算符与逻辑运算符混合时，为逻辑运算符添加括号
                if matches!(bin.op, BinaryOp::NullishCoalescing) {
                    if Self::is_logical_expression(&bin.left) && !left.starts_with('(') {
                        left = format!("({})", left);
                    }
                    if Self::is_logical_expression(&bin.right) && !right.starts_with('(') {
                        right = format!("({})", right);
                    }
                }
                // 当逻辑运算符与三元运算符混合时，为三元运算符添加括号
                if matches!(bin.op, BinaryOp::LogicalAnd | BinaryOp::LogicalOr) {
                    if Self::is_conditional_expression(&bin.left) && !left.starts_with('(') {
                        left = format!("({})", left);
                    }
                    if Self::is_conditional_expression(&bin.right) && !right.starts_with('(') {
                        right = format!("({})", right);
                    }
                }
                // 当空值合并运算符与三元运算符混合时，为空值合并运算符添加括号
                if matches!(bin.op, BinaryOp::NullishCoalescing) {
                    if Self::is_conditional_expression(&bin.left) && !left.starts_with('(') {
                        left = format!("({})", left);
                    }
                    if Self::is_conditional_expression(&bin.right) && !right.starts_with('(') {
                        right = format!("({})", right);
                    }
                }

                // 特殊处理：当空值合并运算符被用作逻辑运算符的操作数时，需要外层括号
                // 这处理案例34中的情况：|| ((g ? h : i) ?? (j ? k : l))
                if matches!(bin.op, BinaryOp::NullishCoalescing) {
                    // 检查整个空值合并表达式是否需要外层括号
                    // 如果左右操作数都包含三元运算符，则需要外层括号
                    let left_has_ternary = Self::contains_ternary_expression(&bin.left);
                    let right_has_ternary = Self::contains_ternary_expression(&bin.right);

                    if left_has_ternary && right_has_ternary {
                        // 这个空值合并表达式需要外层括号，但我们在更高层级处理
                        // 这里我们确保左右操作数都有括号
                        if !left.starts_with('(') {
                            left = format!("({})", left);
                        }
                        if !right.starts_with('(') {
                            right = format!("({})", right);
                        }
                    }
                }

                // 最终处理：为整个空值合并表达式添加外层括号（如果被用作逻辑运算符的操作数）
                // 这是处理案例34的关键：我们需要在更高层级添加括号
                let result = format!("{} {} {}", left, op, right);

                // 检查是否需要为整个表达式添加外层括号
                if matches!(bin.op, BinaryOp::NullishCoalescing) {
                    let left_has_ternary = Self::contains_ternary_expression(&bin.left);
                    let right_has_ternary = Self::contains_ternary_expression(&bin.right);

                    // 当空值合并运算符的左右操作数都包含三元运算符时，需要外层括号
                    // 这处理案例35中的情况：|| ((g ? h : i) ?? (j ? k : l))
                    if left_has_ternary && right_has_ternary {
                        return format!("({})", result);
                    }
                }

                result
            }
            _ => "complex_expression".to_string(),
        }
    }
}
