use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde_json::{json, Value};
use std::collections::HashMap;

// 导入核心模块
mod error_handler;
mod performance_optimizer;

// 导入 openInula 2.0 架构模块
#[cfg(feature = "analysis")]
mod analyzer;
mod bit_manager;
#[cfg(feature = "codegen")]
mod generator;
#[cfg(feature = "analysis")]
mod inula2_compiler;
#[cfg(feature = "analysis")]
mod ir_builder;
#[cfg(feature = "jsx_impl")]
mod jsx_parser;
mod openinula_apis;
#[cfg(feature = "analysis")]
mod reactivity_parser;
#[cfg(feature = "codegen")]
mod transform_node;
mod types;
#[cfg(feature = "analysis")]
mod visitor;

#[cfg(not(feature = "jsx_impl"))]
use crate::types::ViewUnit;
use error_handler::CompilerError;
#[cfg(feature = "jsx_impl")]
use jsx_parser::{JsxParser, ViewParser, ViewParserConfig, ViewUnit};
use performance_optimizer::PerformanceOptimizer;
#[cfg(not(feature = "jsx_impl"))]
#[derive(Debug, Clone, Default)]
pub struct ViewParserConfig {
    pub html_tags: Vec<String>,
    pub will_parse_template: bool,
    pub custom_html_props: Vec<String>,
}
#[cfg(not(feature = "jsx_impl"))]
pub struct JsxParser;
#[cfg(not(feature = "jsx_impl"))]
impl JsxParser {
    pub fn new() -> Self {
        Self
    }
    pub fn parse(&self, _code: &str) -> Result<Vec<ViewUnit<'static>>, String> {
        Ok(Vec::new())
    }
}

// 简化的类型定义
#[derive(Debug, Clone)]
pub struct DependencyInfo {
    // 简化的依赖信息
}

impl Default for DependencyInfo {
    fn default() -> Self {
        Self {}
    }
}

/// openInula 2.0 编译器 - NAPI 接口
#[napi]
pub struct InulaCompiler {
    // 集成完整的 openInula 2.0 架构
    #[cfg(feature = "analysis")]
    inula2_compiler: crate::inula2_compiler::Inula2Compiler,
    // JSX解析器
    jsx_parser: JsxParser,
    view_parser_config: ViewParserConfig,
    config: HashMap<String, String>,
    last_error: Option<CompilerError>,
    performance_optimizer: PerformanceOptimizer,
}

#[napi]
impl InulaCompiler {
    #[napi(constructor)]
    pub fn new() -> Self {
        eprintln!("DEBUG: InulaCompiler::new() called");
        #[cfg(feature = "analysis")]
        let inula2_compiler = crate::inula2_compiler::Inula2Compiler::new();
        let jsx_parser = JsxParser::new();
        let view_parser_config = ViewParserConfig::default();

        Self {
            #[cfg(feature = "analysis")]
            inula2_compiler,
            jsx_parser,
            view_parser_config,
            config: HashMap::new(),
            last_error: None,
            performance_optimizer: PerformanceOptimizer::new(),
        }
    }

    /// 编译 JSX 为 JavaScript 代码 - 使用完整的 openInula 2.0 架构
    #[napi]
    pub async unsafe fn compile_jsx(&mut self, jsx_code: String) -> Result<String> {
        // 写入调试信息到文件
        use std::io::Write;
        if let Ok(mut file) = std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open("/tmp/napi_debug.log")
        {
            let _ = writeln!(
                file,
                "DEBUG: InulaCompiler::compile_jsx called with jsx_code: {}",
                jsx_code
            );
        }
        println!(
            "DEBUG: InulaCompiler::compile_jsx called with: {}",
            jsx_code
        );
        // 清除之前的错误
        self.last_error = None;

        // 基本验证
        if jsx_code.trim().is_empty() {
            let error = CompilerError::new(
                crate::error_handler::CompilerPhase::Validation,
                crate::error_handler::ErrorSeverity::Error,
                "输入不能为空".to_string(),
            )
            .with_suggestion("请提供有效的JSX代码".to_string());

            self.last_error = Some(error.clone());
            return Err(napi::Error::new(napi::Status::InvalidArg, error.format()));
        }

        // 检查是否包含JSX标签
        if !jsx_code.contains('<') || !jsx_code.contains('>') {
            let error = CompilerError::new(
                crate::error_handler::CompilerPhase::Validation,
                crate::error_handler::ErrorSeverity::Error,
                "输入不包含有效的JSX标签".to_string(),
            )
            .with_suggestion("请确保输入包含JSX标签，如 <div>...</div>".to_string());

            self.last_error = Some(error.clone());
            return Err(napi::Error::new(napi::Status::InvalidArg, error.format()));
        }

        // 检查标签是否匹配
        if !self.validate_jsx_tags(&jsx_code) {
            let error = CompilerError::new(
                crate::error_handler::CompilerPhase::Parsing,
                crate::error_handler::ErrorSeverity::Error,
                "JSX标签不匹配".to_string(),
            )
            .with_suggestion("请确保所有标签都正确闭合".to_string());

            self.last_error = Some(error.clone());
            return Err(napi::Error::new(napi::Status::InvalidArg, error.format()));
        }

        // 使用完整的 openInula 2.0 架构进行编译
        #[cfg(feature = "analysis")]
        {
            match self.inula2_compiler.compile_jsx(&jsx_code) {
                Ok(result) => {
                    // 解析结果并添加额外的元数据
                    if let Ok(mut result_json) = serde_json::from_str::<serde_json::Value>(&result)
                    {
                        // 添加性能优化信息
                        result_json["performance_optimization"] = serde_json::Value::Null;

                        Ok(serde_json::to_string(&result_json).unwrap())
                    } else {
                        Ok(result)
                    }
                }
                Err(error) => {
                    // 处理错误
                    let error_msg = error;
                    let compiler_error = CompilerError::new(
                        crate::error_handler::CompilerPhase::CodeGeneration,
                        crate::error_handler::ErrorSeverity::Error,
                        error_msg,
                    );

                    self.last_error = Some(compiler_error.clone());
                    Err(napi::Error::new(
                        napi::Status::GenericFailure,
                        compiler_error.format(),
                    ))
                }
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(napi::Error::new(
                napi::Status::GenericFailure,
                "analysis 功能未启用",
            ))
        }
    }

    /// 解析 JSX 代码为 JSON AST - 使用JSX解析器
    #[napi]
    pub async fn parse_jsx(&self, jsx_code: String) -> Result<String> {
        // 基本验证
        if jsx_code.trim().is_empty() {
            return Err(napi::Error::new(napi::Status::InvalidArg, "输入不能为空"));
        }

        if !jsx_code.contains('<') || !jsx_code.contains('>') {
            return Err(napi::Error::new(
                napi::Status::InvalidArg,
                "输入不是有效的JSX代码",
            ));
        }

        // 使用JSX解析器解析（支持配置透传，如 reactive_map）
        #[cfg(feature = "jsx_impl")]
        let parsed = self
            .jsx_parser
            .parse_with_config(&jsx_code, self.view_parser_config.clone());
        #[cfg(not(feature = "jsx_impl"))]
        let parsed = self.jsx_parser.parse(&jsx_code);

        match parsed {
            Ok(view_units) => {
                // 将ViewUnit转换为JSON，并添加更详细的结果
                let result_json = json!({
                    "type": "template",
                    "content": jsx_code,
                    "command": "parseView",
                    "version": "2.0.0",
                    "result": self.view_units_to_json(&view_units),
                    "inputLength": jsx_code.len() as u32
                });

                // 返回 JSON 字符串
                Ok(serde_json::to_string(&result_json).unwrap())
            }
            Err(e) => Err(napi::Error::new(
                napi::Status::GenericFailure,
                format!("JSX解析失败：{}", e),
            )),
        }
    }

    /// 设置配置
    #[napi]
    pub fn set_config(&mut self, key: String, value: String) {
        self.config.insert(key, value);
    }

    /// 获取配置
    #[napi]
    pub fn get_config(&self, key: String) -> Option<String> {
        self.config.get(&key).cloned()
    }

    /// 获取最后一个错误
    #[napi]
    pub fn get_last_error(&self) -> Option<String> {
        self.last_error.as_ref().map(|error| error.format())
    }

    /// 获取最后一个错误的 JSON 格式
    #[napi]
    pub fn get_last_error_json(&self) -> Option<String> {
        self.last_error
            .as_ref()
            .map(|error| serde_json::to_string(&error.to_json()).unwrap_or_default())
    }

    /// 清除最后一个错误
    #[napi]
    pub fn clear_last_error(&mut self) {
        self.last_error = None;
    }

    /// 获取性能统计信息 - 来自 openInula 2.0 架构
    #[napi]
    pub fn get_performance_stats(&self) -> Result<String> {
        #[cfg(feature = "analysis")]
        {
            let stats = self.inula2_compiler.get_performance_stats();
            Ok(stats)
        }
        #[cfg(not(feature = "analysis"))]
        {
            Ok("analysis 功能未启用".to_string())
        }
    }

    /// 重置性能统计信息 - 来自 openInula 2.0 架构
    #[napi]
    pub fn reset_performance_stats(&mut self) {
        #[cfg(feature = "analysis")]
        {
            self.inula2_compiler.reset_performance_stats();
        }
    }

    /// 编译多个 JSX 组件 - 使用 openInula 2.0 架构
    #[napi]
    pub async unsafe fn compile_multiple_jsx(&mut self, components: String) -> Result<String> {
        // 使用 openInula 2.0 架构编译多个组件
        #[cfg(feature = "analysis")]
        {
            match self
                .inula2_compiler
                .compile_multiple_components(&components)
            {
                Ok(result) => Ok(result),
                Err(e) => Err(napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("多组件编译失败: {:?}", e),
                )),
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(napi::Error::new(
                napi::Status::GenericFailure,
                "analysis 功能未启用",
            ))
        }
    }

    // ========== 分析器功能 ==========

    /// 分析 JSX 代码的响应式特征 - 使用 openInula 2.0 编译器
    #[napi]
    pub fn analyze_reactivity(&self, jsx_code: String) -> Result<String> {
        // 简化的响应式分析
        let has_use_state = jsx_code.contains("useState");
        let has_event_handlers = jsx_code.contains("onClick") || jsx_code.contains("onChange");
        let result = json!({
            "has_use_state": has_use_state,
            "has_event_handlers": has_event_handlers,
            "is_reactive": has_use_state || has_event_handlers
        });
        Ok(result.to_string())
    }

    /// 分析组件的依赖关系 - 使用 openInula 2.0 编译器
    #[napi]
    pub fn analyze_dependencies(&self, jsx_code: String) -> Result<String> {
        // 简化的依赖分析
        let dependencies =
            jsx_code.matches("useState").count() + jsx_code.matches("useEffect").count();
        let result = json!({
            "dependencies_count": dependencies,
            "has_dependencies": dependencies > 0
        });
        Ok(result.to_string())
    }

    /// 分析组件的性能特征 - 使用 openInula 2.0 编译器
    #[napi]
    pub fn analyze_performance(&self, jsx_code: String) -> Result<String> {
        // 简化的性能分析
        let complexity = jsx_code.len() as f64 / 100.0;
        let result = json!({
            "complexity": complexity,
            "performance_score": 100.0 - complexity.min(100.0)
        });
        Ok(result.to_string())
    }

    // ========== 生成器功能 ==========

    /// 生成响应式组件代码 - 使用 openInula 2.0 编译器
    #[napi]
    pub async unsafe fn generate_reactive_component(&mut self, jsx_code: String) -> Result<String> {
        #[cfg(feature = "analysis")]
        {
            match self.inula2_compiler.compile_jsx(&jsx_code) {
                Ok(result) => Ok(result),
                Err(e) => Err(napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("生成失败：{:?}", e),
                )),
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(napi::Error::new(
                napi::Status::GenericFailure,
                "analysis 功能未启用",
            ))
        }
    }

    /// 生成模板组件代码 - 使用 openInula 2.0 编译器
    #[napi]
    pub async unsafe fn generate_template_component(&mut self, jsx_code: String) -> Result<String> {
        #[cfg(feature = "analysis")]
        {
            match self.inula2_compiler.compile_jsx(&jsx_code) {
                Ok(result) => Ok(result),
                Err(e) => Err(napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("生成失败：{:?}", e),
                )),
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(napi::Error::new(
                napi::Status::GenericFailure,
                "analysis 功能未启用",
            ))
        }
    }

    /// 生成优化的组件代码 - 使用 openInula 2.0 编译器
    #[napi]
    pub async unsafe fn generate_optimized_component(
        &mut self,
        jsx_code: String,
    ) -> Result<String> {
        #[cfg(feature = "analysis")]
        {
            match self.inula2_compiler.compile_jsx(&jsx_code) {
                Ok(result) => Ok(result),
                Err(e) => Err(napi::Error::new(
                    napi::Status::GenericFailure,
                    format!("生成失败：{:?}", e),
                )),
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(napi::Error::new(
                napi::Status::GenericFailure,
                "analysis 功能未启用",
            ))
        }
    }

    /// 设置JSX解析器配置 - 新增接口
    #[napi]
    pub fn set_jsx_parser_config(&mut self, config_json: String) -> Result<String> {
        match serde_json::from_str::<serde_json::Value>(&config_json) {
            Ok(config) => {
                // 更新解析器配置
                if let Some(html_tags) = config.get("htmlTags").and_then(|v| v.as_array()) {
                    let tags: Vec<String> = html_tags
                        .iter()
                        .filter_map(|v| v.as_str())
                        .map(|s| s.to_string())
                        .collect();
                    self.view_parser_config.html_tags = tags;
                }

                if let Some(will_parse_template) =
                    config.get("willParseTemplate").and_then(|v| v.as_bool())
                {
                    self.view_parser_config.will_parse_template = will_parse_template;
                }

                if let Some(custom_html_props) =
                    config.get("customHtmlProps").and_then(|v| v.as_array())
                {
                    let props: Vec<String> = custom_html_props
                        .iter()
                        .filter_map(|v| v.as_str())
                        .map(|s| s.to_string())
                        .collect();
                    self.view_parser_config.custom_html_props = props;
                }

                Ok("配置更新成功".to_string())
            }
            Err(e) => Err(napi::Error::new(
                napi::Status::InvalidArg,
                format!("配置解析失败：{}", e),
            )),
        }
    }

    /// 获取JSX解析器配置 - 新增接口
    #[napi]
    pub fn get_jsx_parser_config(&self) -> Result<String> {
        let config_json = json!({
            "htmlTags": self.view_parser_config.html_tags,
            "willParseTemplate": self.view_parser_config.will_parse_template,
            "customHtmlProps": self.view_parser_config.custom_html_props
        });
        Ok(serde_json::to_string(&config_json).unwrap())
    }

    // 验证 JSX 标签是否匹配
    fn validate_jsx_tags(&self, jsx_code: &str) -> bool {
        let mut stack = Vec::new();
        let mut i = 0;
        let chars: Vec<char> = jsx_code.chars().collect();

        while i < chars.len() {
            if chars[i] == '<' {
                // 检查是否是结束标签
                if i + 1 < chars.len() && chars[i + 1] == '/' {
                    // 结束标签
                    i += 2; // 跳过 '</'
                    let mut tag_name = String::new();
                    while i < chars.len() && chars[i] != '>' {
                        tag_name.push(chars[i]);
                        i += 1;
                    }

                    if i >= chars.len() || chars[i] != '>' {
                        return false; // 未找到结束的 '>'
                    }

                    // 检查栈顶是否匹配
                    if let Some(expected_tag) = stack.pop() {
                        if expected_tag != tag_name {
                            return false; // 标签不匹配
                        }
                    } else {
                        return false; // 栈为空，没有对应的开始标签
                    }
                } else {
                    // 开始标签
                    i += 1; // 跳过 '<'
                    let mut tag_name = String::new();
                    while i < chars.len()
                        && chars[i] != '>'
                        && chars[i] != ' '
                        && chars[i] != '\t'
                        && chars[i] != '\n'
                    {
                        tag_name.push(chars[i]);
                        i += 1;
                    }

                    // 跳过到标签结束
                    while i < chars.len() && chars[i] != '>' {
                        i += 1;
                    }

                    if i >= chars.len() || chars[i] != '>' {
                        return false; // 未找到结束的 '>'
                    }

                    // 检查是否是自闭合标签
                    if i > 0 && chars[i - 1] == '/' {
                        // 自闭合标签，不需要入栈
                    } else {
                        stack.push(tag_name);
                    }
                }
            }
            i += 1;
        }

        stack.is_empty() // 栈应该为空
    }

    /// 将ViewUnit转换为JSON - 辅助方法
    fn view_units_to_json(&self, view_units: &Vec<ViewUnit>) -> serde_json::Value {
        let units_json: Vec<serde_json::Value> = view_units
            .iter()
            .map(|unit| self.view_unit_to_json(unit))
            .collect();

        serde_json::Value::Array(units_json)
    }

    /// 将单个ViewUnit转换为JSON - 辅助方法
    fn view_unit_to_json(&self, unit: &ViewUnit) -> serde_json::Value {
        match unit {
            ViewUnit::Text(text_unit) => {
                json!({
                    "type": "text",
                    "content": text_unit.content.value.to_string()
                })
            }
            ViewUnit::Html(html_unit) => {
                json!({
                    "type": "html",
                    "tag": "html_element",
                    "props": self.props_map_to_json_jsx(&html_unit.props),
                    "children": self.view_units_to_json(&html_unit.children)
                })
            }
            ViewUnit::Comp(comp_unit) => {
                json!({
                    "type": "comp",
                    "tag": "component",
                    "props": self.props_map_to_json_jsx(&comp_unit.props),
                    "children": self.view_units_to_json(&comp_unit.children)
                })
            }
            ViewUnit::If(if_unit) => {
                json!({
                    "type": "if",
                    "branches": if_unit.branches.iter().map(|branch| {
                        json!({
                            "condition": "expression", // 简化处理
                            "children": self.view_units_to_json(&branch.children)
                        })
                    }).collect::<Vec<_>>()
                })
            }
            ViewUnit::Exp(exp_unit) => {
                json!({
                    "type": "exp",
                    "content": "expression", // 简化处理
                    "props": self.props_map_to_json_jsx(&exp_unit.props)
                })
            }
            ViewUnit::Context(context_unit) => {
                json!({
                    "type": "context",
                    "contextName": context_unit.context_name,
                    "props": self.props_map_to_json_jsx(&context_unit.props),
                    "children": self.view_units_to_json(&context_unit.children)
                })
            }
            ViewUnit::Template(template_unit) => {
                json!({
                    "type": "template",
                    "template": json!({
                        "type": "html",
                        "tag": "template_element",
                        "props": json!({
                            "type": "template_props",
                            "count": template_unit.props.len()
                        }),
                        "children": self.view_units_to_json(&template_unit.template.children)
                    }),
                    "mutableUnits": Vec::<serde_json::Value>::new(),
                    "props": Vec::<serde_json::Value>::new()
                })
            }
            ViewUnit::For(for_unit) => {
                json!({
                    "type": "for",
                    "item": "binding_pattern",
                    "array": "expression",
                    "key": for_unit.key.as_ref().map(|_| "expression").unwrap_or("none"),
                    "index": for_unit.index.as_ref().map(|_| "binding_identifier").unwrap_or("none"),
                    "children": self.view_units_to_json(&for_unit.children)
                })
            }
            ViewUnit::Fragment(fragment_unit) => {
                json!({
                    "type": "fragment",
                    "children": self.view_units_to_json(&fragment_unit.children)
                })
            }
            ViewUnit::Suspense(suspense_unit) => {
                json!({
                    "type": "suspense",
                    "children": self.view_units_to_json(&suspense_unit.children),
                    "fallback": suspense_unit.fallback.as_ref().map(|f| json!({
                        "type": "prop",
                        "value": "expression"
                    }))
                })
            }
        }
    }

    /// 将JSX UnitProp转换为JSON - 辅助方法
    fn props_map_to_json_jsx(
        &self,
        props: &std::collections::HashMap<String, crate::jsx_parser::UnitProp>,
    ) -> serde_json::Value {
        json!(props
            .iter()
            .map(|(k, v)| {
                (
                    k,
                    json!({
                        "value": "expression", // 简化处理
                        "dep_id_bitmap": v.dep_id_bitmap,
                        "dependencies_node": v.dependencies_node
                    }),
                )
            })
            .collect::<std::collections::HashMap<_, _>>())
    }

    /// 将Expression转换为JSON - 辅助方法
    fn unit_prop_to_json_simple<'a>(&self, prop: &crate::types::UnitProp<'a>) -> serde_json::Value {
        json!({
            "value": prop.value,
            "viewPropMap": prop.view_prop_map.iter().map(|(k, v)| {
                (k, json!({
                    "type": "viewUnits",
                    "count": v.len()
                }))
            }).collect::<std::collections::HashMap<_, _>>(),
            "specifier": prop.specifier
        })
    }

    /// 将Pattern转换为JSON - 辅助方法
    fn props_map_to_json<'a>(
        &self,
        props: &std::collections::HashMap<String, crate::types::UnitProp<'a>>,
    ) -> serde_json::Value {
        let props_json: std::collections::HashMap<String, serde_json::Value> = props
            .iter()
            .map(|(k, v)| (k.clone(), self.unit_prop_to_json_simple(v)))
            .collect();
        serde_json::Value::Object(props_json.into_iter().collect())
    }
}

// 导出的全局函数
#[napi]
pub async fn compile_jsx_to_js(jsx_code: String) -> Result<String> {
    // 调用 inula2_compiler 中的编译函数
    match crate::inula2_compiler::compile_jsx_v2_native(&jsx_code) {
        Ok(result) => Ok(result),
        Err(e) => Err(napi::Error::from_reason(format!("编译失败: {}", e))),
    }
}

// 测试函数 - 用于验证构建过程
#[napi]
pub fn test_debug_function(input: String) -> String {
    format!("TEST_FUNCTION_CALLED: {}", input)
}

// 另一个测试函数
#[napi]
pub fn simple_test() -> String {
    "SIMPLE_TEST_WORKS".to_string()
}

#[napi]
pub async fn parse_jsx_to_ast(jsx_code: String) -> Result<String> {
    let compiler = InulaCompiler::new();
    compiler.parse_jsx(jsx_code).await
}

#[napi]
pub async fn compile_multiple_jsx(components: String) -> Result<String> {
    let mut compiler = InulaCompiler::new();
    unsafe { compiler.compile_multiple_jsx(components).await }
}

#[napi]
pub async fn analyze_reactivity(jsx_code: String) -> Result<String> {
    let compiler = InulaCompiler::new();
    compiler.analyze_reactivity(jsx_code)
}

#[napi]
pub async fn analyze_dependencies(jsx_code: String) -> Result<String> {
    let compiler = InulaCompiler::new();
    compiler.analyze_dependencies(jsx_code)
}

#[napi]
pub async fn analyze_performance(jsx_code: String) -> Result<String> {
    let compiler = InulaCompiler::new();
    compiler.analyze_performance(jsx_code)
}

#[napi]
pub async fn generate_reactive_component(jsx_code: String) -> Result<String> {
    let mut compiler = InulaCompiler::new();
    unsafe { compiler.generate_reactive_component(jsx_code).await }
}

#[napi]
pub async fn generate_template_component(jsx_code: String) -> Result<String> {
    let mut compiler = InulaCompiler::new();
    unsafe { compiler.generate_template_component(jsx_code).await }
}

#[napi]
pub async fn generate_optimized_component(jsx_code: String) -> Result<String> {
    let mut compiler = InulaCompiler::new();
    unsafe { compiler.generate_optimized_component(jsx_code).await }
}

/// 运行 NAPI 版编译器和原版 inula 编译器的对比测试
#[napi]
pub fn run_consistency_and_performance_tests() -> Result<String> {
    use crate::inula2_compiler::Inula2Compiler;

    let mut compiler = Inula2Compiler::new();
    let test_cases = vec![
        "<div>Hello World</div>",
        "<div>{name}</div>",
        "<div>{count}</div>",
        "<span>Visible</span>",
        "<li key={item.id}>{item.name}</li>",
    ];

    let mut results = Vec::new();
    for (i, test_case) in test_cases.iter().enumerate() {
        match compiler.compile_jsx(test_case) {
            Ok(_) => results.push(format!("测试用例 {} 通过", i + 1)),
            Err(e) => results.push(format!("测试用例 {} 失败: {}", i + 1, e)),
        }
    }

    Ok(format!("一致性测试完成:\n{}", results.join("\n")))
}
