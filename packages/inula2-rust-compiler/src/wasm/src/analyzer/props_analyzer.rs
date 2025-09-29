// props_analyzer.rs - 属性分析器，对应原版 propsAnalyze.ts
use crate::error_handler::CompilerResult;
use crate::ir_builder::IRBuilder;
use crate::types::PropType;
use swc_ecma_ast::*;

/// 属性分析器 - 对应原版 propsAnalyze
pub struct PropsAnalyzer;

impl PropsAnalyzer {
    /// 分析组件属性
    pub fn analyze_component_props<'a>(
        &self,
        params: &[Param],
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        for param in params {
            self.analyze_parameter(param, builder)?;
        }
        Ok(())
    }

    /// 分析 Hook 属性
    pub fn analyze_hook_props<'a>(
        &self,
        params: &[Param],
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        for param in params {
            self.analyze_parameter(param, builder)?;
        }
        Ok(())
    }

    /// 分析单个参数
    fn analyze_parameter<'a>(
        &self,
        param: &Param,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        match &param.pat {
            Pat::Ident(_ident) => {
                // 单个属性 - 组件参数不需要生成变量声明
                // 参数已经在函数签名中定义，不需要额外的变量声明
            }
            Pat::Array(array_pat) => {
                // 数组解构
                self.analyze_array_destructuring(array_pat, builder)?;
            }
            Pat::Object(object_pat) => {
                // 对象解构
                self.analyze_object_destructuring(object_pat, builder)?;
            }
            Pat::Rest(rest_pat) => {
                // 剩余参数
                if let Pat::Ident(ident) = &*rest_pat.arg {
                    let prop_name = ident.sym.as_str();

                    builder.add_rest_props(prop_name.to_string(), "PROPS", None);
                }
            }
            _ => {
                // 其他模式
                builder.add_raw_stmt("complex parameter pattern".to_string());
            }
        }

        Ok(())
    }

    /// 分析数组解构
    fn analyze_array_destructuring<'a>(
        &self,
        array_pat: &ArrayPat,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        for (index, elem) in array_pat.elems.iter().enumerate() {
            if let Some(pat) = elem {
                match pat {
                    Pat::Ident(ident) => {
                        let prop_name = ident.sym.as_str();
                        let prop_type = self.infer_prop_type(prop_name);

                        builder.add_single_prop(
                            prop_name.to_string(),
                            Pat::Ident(BindingIdent {
                                id: Ident::new(
                                    "undefined".into(),
                                    swc_common::Span::new(
                                        swc_common::BytePos(0),
                                        swc_common::BytePos(0),
                                    ),
                                    swc_common::SyntaxContext::empty(),
                                ),
                                type_ann: None,
                            }),
                            "PROPS",
                            None,
                        );
                    }
                    Pat::Object(object_pat) => {
                        // 嵌套对象解构
                        self.analyze_object_destructuring(object_pat, builder)?;
                    }
                    Pat::Array(nested_array_pat) => {
                        // 嵌套数组解构
                        self.analyze_array_destructuring(nested_array_pat, builder)?;
                    }
                    _ => {
                        // 其他模式
                        builder.add_raw_stmt(format!("complex array element at index {}", index));
                    }
                }
            }
        }

        Ok(())
    }

    /// 分析对象解构
    fn analyze_object_destructuring<'a>(
        &self,
        object_pat: &ObjectPat,
        builder: &mut IRBuilder<'a>,
    ) -> CompilerResult<()> {
        for prop in &object_pat.props {
            match prop {
                ObjectPatProp::KeyValue(_key_value) => {
                    // 对象解构的键值对 - 组件参数不需要生成变量声明
                    // 参数已经在函数签名中定义，不需要额外的变量声明
                }
                ObjectPatProp::Assign(_assign) => {
                    // 对象解构的赋值 - 组件参数不需要生成变量声明
                    // 参数已经在函数签名中定义，不需要额外的变量声明
                }
                ObjectPatProp::Rest(rest) => {
                    if let Pat::Ident(ident) = &*rest.arg {
                        let prop_name = ident.sym.as_str();

                        builder.add_rest_props(prop_name.to_string(), "PROPS", None);
                    }
                }
            }
        }

        Ok(())
    }

    /// 提取属性名
    fn extract_prop_name(&self, key: &PropName) -> String {
        match key {
            PropName::Ident(ident) => ident.sym.to_string(),
            PropName::Str(str_lit) => str_lit.value.to_string(),
            PropName::Num(num_lit) => num_lit.value.to_string(),
            PropName::Computed(computed) => match &*computed.expr {
                Expr::Lit(Lit::Str(s)) => s.value.to_string(),
                Expr::Lit(Lit::Num(n)) => n.value.to_string(),
                Expr::Ident(i) => i.sym.to_string(),
                _ => "computed_prop".to_string(),
            },
            PropName::BigInt(_) => "bigint".to_string(),
        }
    }

    /// 推断属性类型
    fn infer_prop_type(&self, prop_name: &str) -> PropType {
        // 根据属性名推断类型
        if prop_name.starts_with("on") && prop_name.len() > 2 {
            PropType::SINGLE
        } else if prop_name == "children" {
            PropType::SINGLE
        } else if prop_name == "key" {
            PropType::SINGLE
        } else if prop_name == "ref" {
            PropType::SINGLE
        } else if prop_name.ends_with("Id") || prop_name.ends_with("Index") {
            PropType::SINGLE
        } else if prop_name.ends_with("s") && prop_name.len() > 3 {
            PropType::SINGLE
        } else if prop_name.starts_with("is") || prop_name.starts_with("has") {
            PropType::SINGLE
        } else {
            PropType::SINGLE
        }
    }

    /// 分析默认值
    fn analyze_default_value<'a>(&self, param: &Param) -> Option<String> {
        // 从参数中提取默认值
        None
    }

    /// 提取表达式字符串
    fn extract_expression_string(&self, expr: &Expr) -> String {
        match expr {
            Expr::Lit(Lit::Str(s)) => format!("\"{}\"", s.value),
            Expr::Lit(Lit::Num(n)) => n.value.to_string(),
            Expr::Lit(Lit::Bool(b)) => b.value.to_string(),
            Expr::Lit(Lit::Null(_)) => "null".to_string(),
            Expr::Ident(i) => i.sym.to_string(),
            Expr::Array(array) => "[]".to_string(),
            Expr::Object(object) => "{}".to_string(),
            Expr::Arrow(arrow) => "() => {}".to_string(),
            Expr::Fn(fn_expr) => "function() {}".to_string(),
            _ => "complex_expression".to_string(),
        }
    }
}
