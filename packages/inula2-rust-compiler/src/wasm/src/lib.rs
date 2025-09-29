use serde_json::json;
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
// removed oxc_sourcemap usage during SWC migration

#[cfg(feature = "frontend_swc")]
mod swc_frontend;
// removed legacy oxc_frontend module

// 导入核心模块

mod cli;
mod error_handler;
pub mod native_compiler;
mod performance_optimizer;

// 导入 openInula 2.0 架构模块
#[cfg(feature = "analysis")]
mod analyzer;
mod bit_manager;
#[cfg(feature = "codegen")]
mod generator;
#[cfg(feature = "codegen")]
mod generator_main;
#[cfg(feature = "analysis")]
pub mod inula2_compiler;
#[cfg(feature = "analysis")]
mod ir_builder;
#[cfg(feature = "codegen")]
mod transform_node;
mod types;
#[cfg(feature = "analysis")]
mod visitor;
// 在 WASM 启动时安装 panic hook，便于在 Node 控制台看到具体堆栈
#[wasm_bindgen(start)]
pub fn wasm_start() {
    // 安装 panic hook（如果可用）
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}
#[cfg(feature = "jsx_impl")]
mod jsx_parser;
mod openinula_apis;
#[cfg(feature = "analysis")]
mod reactivity_parser;

#[cfg(test)]
mod comprehensive_tests;
#[cfg(test)]
mod consistency_tests;
#[cfg(test)]
mod test_runner;

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

// 使用完整的 openInula 2.0 架构的 WASM 接口
#[wasm_bindgen]
pub struct InulaCompiler {
    // 集成完整的 openInula 2.0 架构
    #[cfg(feature = "analysis")]
    inula2_compiler: crate::inula2_compiler::Inula2Compiler,
    // JSX解析器
    jsx_parser: JsxParser,
    view_parser_config: ViewParserConfig,
    config: HashMap<String, String>,
    // source map support removed with OXC
    last_error: Option<CompilerError>,
    performance_optimizer: PerformanceOptimizer,
}

#[wasm_bindgen]
impl InulaCompiler {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
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

    /// 基于架构图的完整编译流程接口（供架构测试使用）
    /// 返回包含 ast/inula_ir/view_code/final_code/metadata 的 JSON 字符串
    #[wasm_bindgen]
    pub fn compile(&mut self, _user_code: &str) -> Result<JsValue, JsValue> {
        // 架构测试接口已移除，使用实际的编译器
        Err(JsValue::from_str(
            "架构测试接口已移除，请使用 compile_jsx 方法",
        ))
    }

    /// 解析 JSX 代码为 JSON AST - 使用JSX解析器
    #[wasm_bindgen]
    pub fn parse_jsx(&self, jsx_code: &str) -> Result<JsValue, JsValue> {
        // 基本验证
        if jsx_code.trim().is_empty() {
            return Err(JsValue::from_str("输入不能为空"));
        }

        if !jsx_code.contains('<') || !jsx_code.contains('>') {
            return Err(JsValue::from_str("输入不是有效的JSX代码"));
        }

        // 使用JSX解析器解析（支持配置透传，如 reactive_map）
        #[cfg(feature = "jsx_impl")]
        let parsed = self
            .jsx_parser
            .parse_with_config(jsx_code, self.view_parser_config.clone());
        #[cfg(not(feature = "jsx_impl"))]
        let parsed = self.jsx_parser.parse(jsx_code);

        match parsed {
            Ok(view_units) => {
                // 将ViewUnit转换为JSON，并添加更详细的结果
                let result_json = json!({
                    "type": "template",
                    "content": jsx_code,
                    "command": "parseView",
                    "version": "2.0.0",
                    "result": self.view_units_to_json(&view_units.iter().collect::<Vec<_>>()),
                    "inputLength": jsx_code.len() as u32
                });

                // 返回 JSON 字符串
                Ok(JsValue::from_str(
                    &serde_json::to_string(&result_json).unwrap(),
                ))
            }
            Err(e) => Err(JsValue::from_str(&format!("JSX解析失败：{}", e))),
        }
    }

    /// 编译 JSX 为 JavaScript 代码 - 使用完整的 openInula 2.0 架构
    #[wasm_bindgen]
    pub fn compile_jsx(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
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
            return Err(JsValue::from_str(&error.format()));
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
            return Err(JsValue::from_str(&error.format()));
        }

        // 检查标签是否匹配
        if !self.validate_jsx_tags(jsx_code) {
            let error = CompilerError::new(
                crate::error_handler::CompilerPhase::Parsing,
                crate::error_handler::ErrorSeverity::Error,
                "JSX标签不匹配".to_string(),
            )
            .with_suggestion("请确保所有标签都正确闭合".to_string());

            self.last_error = Some(error.clone());
            return Err(JsValue::from_str(&error.format()));
        }

        // 使用完整的 openInula 2.0 架构进行编译
        #[cfg(feature = "analysis")]
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => {
                // 解析结果并添加额外的元数据
                if let Some(result_str) = result.as_string() {
                    if let Ok(mut result_json) =
                        serde_json::from_str::<serde_json::Value>(&result_str)
                    {
                        // 添加性能优化信息
                        // 性能统计暂未提供，保留占位标记
                        result_json["performance_optimization"] = serde_json::Value::Null;

                        // 添加 Source Map 信息
                        // source map 已移除，保持占位注释

                        Ok(JsValue::from_str(
                            &serde_json::to_string(&result_json).unwrap(),
                        ))
                    } else {
                        Ok(result)
                    }
                } else {
                    Ok(result)
                }
            }
            Err(error) => {
                // 处理错误
                let error_msg = error.as_string().unwrap_or_else(|| "编译失败".to_string());
                let compiler_error = CompilerError::new(
                    crate::error_handler::CompilerPhase::CodeGeneration,
                    crate::error_handler::ErrorSeverity::Error,
                    error_msg,
                );

                self.last_error = Some(compiler_error.clone());
                Err(JsValue::from_str(&compiler_error.format()))
            }
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    /// 解析 JSX 为组件 AST - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn parse_components(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => {
                let result_json = json!({
                    "type": "success",
                    "command": "parseComponents",
                    "version": "2.0.0",
                    "result": [result.as_string().unwrap_or_default()],
                    "inputLength": jsx_code.len() as u32
                });

                Ok(JsValue::from_str(&result_json.to_string()))
            }
            Err(e) => Err(JsValue::from_str(&format!("组件解析失败: {:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(JsValue::from_str("analysis 功能未启用"))
        }
    }

    /// 设置配置
    #[wasm_bindgen]
    pub fn set_config(&mut self, key: &str, value: &str) {
        self.config.insert(key.to_string(), value.to_string());
    }

    /// 获取配置
    #[wasm_bindgen]
    pub fn get_config(&self, key: &str) -> Option<String> {
        self.config.get(key).cloned()
    }

    /// 启用 Source Map 生成
    #[wasm_bindgen]
    pub fn enable_source_map(&mut self) {
        // no-op; source map disabled
    }

    /// 禁用 Source Map 生成
    #[wasm_bindgen]
    pub fn disable_source_map(&mut self) {
        // no-op
    }

    /// 获取 Source Map
    #[wasm_bindgen]
    pub fn get_source_map(&mut self) -> Option<String> {
        None
    }

    /// 获取最后一个错误
    #[wasm_bindgen]
    pub fn get_last_error(&self) -> Option<String> {
        self.last_error.as_ref().map(|error| error.format())
    }

    /// 获取最后一个错误的 JSON 格式
    #[wasm_bindgen]
    pub fn get_last_error_json(&self) -> Option<String> {
        self.last_error
            .as_ref()
            .map(|error| serde_json::to_string(&error.to_json()).unwrap_or_default())
    }

    /// 清除最后一个错误
    #[wasm_bindgen]
    pub fn clear_last_error(&mut self) {
        self.last_error = None;
    }

    /// 获取性能统计信息 - 来自 openInula 2.0 架构
    #[wasm_bindgen]
    pub fn get_performance_stats(&self) -> JsValue {
        #[cfg(feature = "analysis")]
        {
            return self.inula2_compiler.get_performance_stats();
        }
        #[cfg(not(feature = "analysis"))]
        {
            return JsValue::from_str("analysis 功能未启用");
        }
    }

    /// 重置性能统计信息 - 来自 openInula 2.0 架构
    #[wasm_bindgen]
    pub fn reset_performance_stats(&mut self) {
        #[cfg(feature = "analysis")]
        {
            self.inula2_compiler.reset_performance_stats();
        }
    }

    /// 编译多个 JSX 组件 - 使用 openInula 2.0 架构
    #[wasm_bindgen]
    pub fn compile_multiple_jsx(&mut self, components: &str) -> Result<JsValue, JsValue> {
        // 使用 openInula 2.0 架构编译多个组件
        #[cfg(feature = "analysis")]
        {
            return crate::inula2_compiler::compile_multiple_jsx_v2(components);
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    // ========== 分析器功能 ==========

    /// 分析 JSX 代码的响应式特征 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn analyze_reactivity(&self, jsx_code: &str) -> Result<JsValue, JsValue> {
        // 简化的响应式分析
        let has_use_state = jsx_code.contains("useState");
        let has_event_handlers = jsx_code.contains("onClick") || jsx_code.contains("onChange");
        let result = json!({
            "has_use_state": has_use_state,
            "has_event_handlers": has_event_handlers,
            "is_reactive": has_use_state || has_event_handlers
        });
        Ok(JsValue::from_str(&result.to_string()))
    }

    /// 分析组件的依赖关系 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn analyze_dependencies(&self, jsx_code: &str) -> Result<JsValue, JsValue> {
        // 简化的依赖分析
        let dependencies =
            jsx_code.matches("useState").count() + jsx_code.matches("useEffect").count();
        let result = json!({
            "dependencies_count": dependencies,
            "has_dependencies": dependencies > 0
        });
        Ok(JsValue::from_str(&result.to_string()))
    }

    /// 分析组件的性能特征 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn analyze_performance(&self, jsx_code: &str) -> Result<JsValue, JsValue> {
        // 简化的性能分析
        let complexity = jsx_code.len() as f64 / 100.0;
        let result = json!({
            "complexity": complexity,
            "performance_score": 100.0 - complexity.min(100.0)
        });
        Ok(JsValue::from_str(&result.to_string()))
    }

    // ========== 生成器功能 ==========

    /// 生成响应式组件代码 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_reactive_component(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => Ok(result),
            Err(e) => Err(JsValue::from_str(&format!("生成失败：{:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            Err(JsValue::from_str("analysis 功能未启用"))
        }
    }

    /// 生成模板组件代码 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_template_component(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => Ok(result),
            Err(e) => Err(JsValue::from_str(&format!("生成失败：{:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    /// 生成优化的组件代码 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_optimized_component(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => Ok(result),
            Err(e) => Err(JsValue::from_str(&format!("生成失败：{:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    /// 生成多个组件的代码 - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_multiple_components(&self, components_json: &str) -> Result<JsValue, JsValue> {
        // 简化的多组件生成
        let result = json!({
            "message": "多组件生成功能正在开发中",
            "input": components_json
        });
        Ok(JsValue::from_str(&result.to_string()))
    }

    /// 设置生成器优化级别 - 暂不支持
    #[wasm_bindgen]
    pub fn set_generator_optimization_level(&mut self, _level: &str) {
        // 暂不支持
    }

    /// 设置生成器目标平台 - 暂不支持
    #[wasm_bindgen]
    pub fn set_generator_target_platform(&mut self, _platform: &str) {
        // 暂不支持
    }

    /// 获取 AST 从 JSX - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_ast_from_jsx(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => {
                let ast_value = json!({
                    "type": "Program",
                    "body": [result.as_string().unwrap_or_default()],
                    "sourceType": "module"
                });
                Ok(JsValue::from_str(
                    &serde_json::to_string(&ast_value).unwrap(),
                ))
            }
            Err(e) => Err(JsValue::from_str(&format!("AST生成失败: {:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    /// 获取组件 AST 从 JSX - 使用 openInula 2.0 编译器
    #[wasm_bindgen]
    pub fn generate_component_ast_from_jsx(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        #[cfg(feature = "analysis")]
        match self.inula2_compiler.compile_jsx(jsx_code) {
            Ok(result) => {
                let components = json!([result.as_string().unwrap_or_default()]);
                Ok(JsValue::from_str(&components.to_string()))
            }
            Err(e) => Err(JsValue::from_str(&format!("组件AST生成失败: {:?}", e))),
        }
        #[cfg(not(feature = "analysis"))]
        {
            return Err(JsValue::from_str("analysis 功能未启用"));
        }
    }

    /// 使用JSX解析器解析JSX代码 - 新增接口
    #[wasm_bindgen]
    pub fn parse_jsx_with_parser(&self, jsx_code: &str) -> Result<JsValue, JsValue> {
        let parsed = self.jsx_parser.parse(jsx_code);
        match parsed {
            Ok(view_units) => {
                let result_json = json!({
                    "type": "success",
                    "command": "parseJSXWithParser",
                    "version": "2.0.0",
                    "result": self.view_units_to_json(&view_units.iter().collect::<Vec<_>>()),
                    "inputLength": jsx_code.len() as u32
                });
                Ok(JsValue::from_str(
                    &serde_json::to_string(&result_json).unwrap(),
                ))
            }
            Err(e) => Err(JsValue::from_str(&format!("JSX解析失败：{}", e))),
        }
    }

    /// 设置JSX解析器配置 - 新增接口
    #[wasm_bindgen]
    pub fn set_jsx_parser_config(&mut self, config_json: &str) -> Result<JsValue, JsValue> {
        match serde_json::from_str::<serde_json::Value>(config_json) {
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
                // 支持注入 reactive_map: { "stateName": bitIdNumber, ... }
                if let Some(rm) = config.get("reactiveMap").and_then(|v| v.as_object()) {
                    let mut map = std::collections::HashMap::new();
                    for (k, v) in rm.iter() {
                        if let Some(id) = v.as_u64() {
                            map.insert(k.clone(), id as usize);
                        }
                    }
                    // 仅在 jsx_impl 构建下有效；其余情况下字段会被忽略
                    #[cfg(feature = "jsx_impl")]
                    {
                        self.view_parser_config.reactive_map = Some(map);
                    }
                }

                Ok(JsValue::from_str("配置更新成功"))
            }
            Err(e) => Err(JsValue::from_str(&format!("配置解析失败：{}", e))),
        }
    }

    /// 获取JSX解析器配置 - 新增接口
    #[wasm_bindgen]
    pub fn get_jsx_parser_config(&self) -> JsValue {
        let config_json = json!({
            "htmlTags": self.view_parser_config.html_tags,
            "willParseTemplate": self.view_parser_config.will_parse_template,
            "customHtmlProps": self.view_parser_config.custom_html_props
        });
        JsValue::from_str(&serde_json::to_string(&config_json).unwrap())
    }

    /// 运行全面测试 - 新增接口
    #[wasm_bindgen]
    pub fn run_comprehensive_tests(&self) -> JsValue {
        #[cfg(test)]
        {
            let report = comprehensive_tests::run_comprehensive_tests();
            JsValue::from_str(&report)
        }
        #[cfg(not(test))]
        {
            JsValue::from_str("测试功能仅在测试模式下可用")
        }
    }

    /// 运行一致性测试 - 新增接口
    #[wasm_bindgen]
    pub fn run_consistency_tests(&self) -> JsValue {
        #[cfg(test)]
        {
            let report = consistency_tests::run_consistency_tests();
            JsValue::from_str(&report)
        }
        #[cfg(not(test))]
        {
            JsValue::from_str("测试功能仅在测试模式下可用")
        }
    }

    /// 运行所有测试 - 新增接口
    #[wasm_bindgen]
    pub fn run_all_tests(&self) -> JsValue {
        #[cfg(test)]
        {
            let report = test_runner::run_all_tests();
            JsValue::from_str(&report)
        }
        #[cfg(not(test))]
        {
            JsValue::from_str("测试功能仅在测试模式下可用")
        }
    }

    /// 运行快速测试 - 新增接口
    #[wasm_bindgen]
    pub fn run_quick_tests(&self) -> JsValue {
        #[cfg(test)]
        {
            let report = test_runner::run_quick_tests();
            JsValue::from_str(&report)
        }
        #[cfg(not(test))]
        {
            JsValue::from_str("测试功能仅在测试模式下可用")
        }
    }

    /// 运行性能测试 - 新增接口
    #[wasm_bindgen]
    pub fn run_performance_tests(&self) -> JsValue {
        #[cfg(test)]
        {
            let report = test_runner::run_performance_tests();
            JsValue::from_str(&report)
        }
        #[cfg(not(test))]
        {
            JsValue::from_str("测试功能仅在测试模式下可用")
        }
    }

    // 注意：复杂的代码生成逻辑已移至 wasm_generator 模块

    // 注意：简单的代码生成逻辑已移至 wasm_generator 模块

    // 注意：TypeScript 兼容的代码生成逻辑已移至 wasm_generator 模块

    // 注意：响应式组件检测逻辑已移至 wasm_analyzer 模块

    // 注意：响应式组件代码生成逻辑已移至 wasm_generator 模块

    // 注意：响应式模板内容生成逻辑已移至 wasm_generator 模块

    // 注意：模板代码生成逻辑已移至 wasm_generator 模块

    // 注意：模板内容生成逻辑已移至 wasm_generator 模块

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

    // 注意：Source Map 映射逻辑已移至专门的模块

    // 注意：HTML 代码生成逻辑已移至 wasm_generator 模块

    // 注意：旧的 JavaScript 代码生成逻辑已移至 wasm_generator 模块

    /// 将ViewUnit转换为JSON - 辅助方法
    fn view_units_to_json(&self, view_units: &[&ViewUnit]) -> serde_json::Value {
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
                    "content": text_unit.content
                })
            }
            ViewUnit::Html(html_unit) => {
                json!({
                    "type": "html",
                    "tag": html_unit.tag,
                    "props": self.props_map_to_json(&html_unit.props),
                    "children": self.view_units_to_json(&html_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::Comp(comp_unit) => {
                json!({
                    "type": "comp",
                    "tag": comp_unit.tag,
                    "props": self.props_map_to_json(&comp_unit.props),
                    "children": self.view_units_to_json(&comp_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::If(if_unit) => {
                json!({
                    "type": "if",
                    "branches": if_unit.branches.iter().map(|branch| {
                        json!({
                            "condition": branch.condition,
                            "children": self.view_units_to_json(&branch.children.iter().map(|b| &**b).collect::<Vec<_>>())
                        })
                    }).collect::<Vec<_>>()
                })
            }
            ViewUnit::Exp(exp_unit) => {
                json!({
                    "type": "exp",
                    "content": self.unit_prop_to_json_simple(&exp_unit.content),
                    "props": self.props_map_to_json(&exp_unit.props)
                })
            }
            ViewUnit::Context(context_unit) => {
                json!({
                    "type": "context",
                    "contextName": context_unit.context_name,
                    "props": self.props_map_to_json(&context_unit.props),
                    "children": self.view_units_to_json(&context_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::Template(template_unit) => {
                json!({
                    "type": "template",
                    "template": json!({
                        "type": "html",
                        "tag": template_unit.tag,
                        "props": self.props_map_to_json(&template_unit.props),
                        "children": self.view_units_to_json(&template_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                    }),
                    "mutableUnits": Vec::<serde_json::Value>::new(),
                    "props": Vec::<serde_json::Value>::new()
                })
            }
            ViewUnit::For(for_unit) => {
                json!({
                    "type": "for",
                    "item": for_unit.item,
                    "array": self.unit_prop_to_json_simple(&for_unit.array),
                    "key": for_unit.key,
                    "index": for_unit.index,
                    "children": self.view_units_to_json(&for_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::Fragment(fragment_unit) => {
                json!({
                    "type": "fragment",
                    "children": self.view_units_to_json(&fragment_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::Suspense(suspense_unit) => {
                json!({
                    "type": "suspense",
                    "children": self.view_units_to_json(&suspense_unit.children.iter().map(|b| &**b).collect::<Vec<_>>()),
                    "fallback": suspense_unit.fallback.as_ref().map(|f| self.view_unit_to_json(f))
                })
            }
            ViewUnit::Comment(comment_unit) => {
                json!({
                    "type": "comment",
                    "content": comment_unit.content
                })
            }
            ViewUnit::RawHtml(raw_html_unit) => {
                json!({
                    "type": "rawHtml",
                    "content": raw_html_unit.content.value
                })
            }
            ViewUnit::Teleport(teleport_unit) => {
                json!({
                    "type": "teleport",
                    "to": teleport_unit.to.value,
                    "children": self.view_units_to_json(&teleport_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::Slot(slot_unit) => {
                json!({
                    "type": "slot",
                    "name": slot_unit.name,
                    "children": self.view_units_to_json(&slot_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
            ViewUnit::State(state_unit) => {
                json!({
                    "type": "state",
                    "name": state_unit.name,
                    "value": state_unit.initial_value
                })
            }
            ViewUnit::Computed(computed_unit) => {
                json!({
                    "type": "computed",
                    "name": computed_unit.name,
                    "getter": computed_unit.getter
                })
            }
            ViewUnit::SubComp(sub_comp_unit) => {
                json!({
                    "type": "subComp",
                    "name": sub_comp_unit.name,
                    "children": self.view_units_to_json(&sub_comp_unit.children.iter().map(|b| &**b).collect::<Vec<_>>())
                })
            }
        }
    }

    /// 将Expression转换为JSON - 辅助方法
    fn unit_prop_to_json_simple<'a>(&self, prop: &crate::types::UnitProp<'a>) -> serde_json::Value {
        json!({
            "value": prop.value,
            "viewPropMap": prop.view_prop_map.iter().map(|(k, v)| {
                (k, self.view_units_to_json(&v.iter().collect::<Vec<_>>()))
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

    /// 将UnitProp转换为JSON - 辅助方法
    #[cfg(feature = "jsx_impl")]
    fn unit_prop_to_json(&self, prop: &jsx_parser::UnitProp) -> serde_json::Value {
        json!({
            "value": self.expression_to_json(&prop.value),
            "viewPropMap": prop.view_prop_map.iter().map(|(k, v)| {
                (k, self.view_units_to_json(v))
            }).collect::<std::collections::HashMap<_, _>>(),
            "specifier": prop.specifier
        })
    }

    /// 将Props转换为JSON - 辅助方法
    #[cfg(feature = "jsx_impl")]
    fn props_to_json(
        &self,
        props: &std::collections::HashMap<String, jsx_parser::UnitProp>,
    ) -> serde_json::Value {
        let props_json: std::collections::HashMap<String, serde_json::Value> = props
            .iter()
            .map(|(k, v)| (k.clone(), self.unit_prop_to_json(v)))
            .collect();

        serde_json::Value::Object(props_json.into_iter().collect())
    }

    pub fn frontend_scan(&self, code: &str, is_ts: bool, is_jsx: bool) -> Result<JsValue, JsValue> {
        #[cfg(feature = "frontend_swc")]
        {
            let f = crate::swc_frontend::SwcFrontend::new();
            match f.scan_summary(code, is_ts, is_jsx) {
                Ok(v) => return Ok(crate::frontend::parse_summary_to_jsvalue(&v)),
                Err(e) => return Err(JsValue::from_str(&e)),
            }
        }
        // legacy oxc frontend removed
        Err(JsValue::from_str("frontend_swc feature not enabled"))
    }
}

// 导出的全局函数
#[wasm_bindgen]
pub fn parse_jsx_to_ast(jsx_code: &str) -> Result<JsValue, JsValue> {
    let compiler = InulaCompiler::new();
    compiler.parse_jsx(jsx_code)
}

#[wasm_bindgen]
pub fn compile_jsx_to_js(jsx_code: &str) -> Result<JsValue, JsValue> {
    #[cfg(feature = "analysis")]
    {
        use std::panic::{catch_unwind, AssertUnwindSafe};
        let result = catch_unwind(AssertUnwindSafe(|| {
            crate::inula2_compiler::compile_jsx_v2(jsx_code)
        }));

        match result {
            Ok(inner) => inner,
            Err(panic_info) => {
                // 将 panic 信息映射为 JsValue 错误，避免 wasm 层 "unreachable"
                let msg = if let Some(s) = panic_info.downcast_ref::<&str>() {
                    format!("panic: {}", s)
                } else if let Some(s) = panic_info.downcast_ref::<String>() {
                    format!("panic: {}", s)
                } else {
                    "panic occurred in compile_jsx_to_js".to_string()
                };
                Err(JsValue::from_str(&msg))
            }
        }
    }
    #[cfg(not(feature = "analysis"))]
    {
        return Err(JsValue::from_str("analysis 功能未启用"));
    }
}

#[wasm_bindgen]
pub fn parse_jsx_to_components(jsx_code: &str) -> Result<JsValue, JsValue> {
    let mut compiler = InulaCompiler::new();
    compiler.parse_components(jsx_code)
}

#[wasm_bindgen]
pub fn generate_ast_from_jsx(jsx_code: &str) -> Result<JsValue, JsValue> {
    let mut compiler = InulaCompiler::new();
    compiler.generate_ast_from_jsx(jsx_code)
}

#[wasm_bindgen]
pub fn generate_component_ast_from_jsx(jsx_code: &str) -> Result<JsValue, JsValue> {
    let mut compiler = InulaCompiler::new();
    compiler.generate_component_ast_from_jsx(jsx_code)
}

// openInula 2.0 架构的全局函数 - 重命名为避免重复定义
#[wasm_bindgen]
pub fn compile_jsx_v2_wrapper(jsx_code: &str) -> Result<JsValue, JsValue> {
    #[cfg(feature = "analysis")]
    {
        use std::panic::{catch_unwind, AssertUnwindSafe};
        let result = catch_unwind(AssertUnwindSafe(|| {
            crate::inula2_compiler::compile_jsx_v2(jsx_code)
        }));

        match result {
            Ok(inner) => inner,
            Err(panic_info) => {
                let msg = if let Some(s) = panic_info.downcast_ref::<&str>() {
                    format!("panic: {}", s)
                } else if let Some(s) = panic_info.downcast_ref::<String>() {
                    format!("panic: {}", s)
                } else {
                    "panic occurred in compile_jsx_v2_wrapper".to_string()
                };
                Err(JsValue::from_str(&msg))
            }
        }
    }
    #[cfg(not(feature = "analysis"))]
    {
        return Err(JsValue::from_str("analysis 功能未启用"));
    }
}

#[wasm_bindgen]
pub fn compile_multiple_jsx_v2_wrapper(components: &str) -> Result<JsValue, JsValue> {
    #[cfg(feature = "analysis")]
    {
        return crate::inula2_compiler::compile_multiple_jsx_v2(components);
    }
    #[cfg(not(feature = "analysis"))]
    {
        return Err(JsValue::from_str("analysis 功能未启用"));
    }
}

// JSX解析器相关的全局函数
#[wasm_bindgen]
pub fn parse_jsx_with_parser(jsx_code: &str) -> Result<JsValue, JsValue> {
    let parser = JsxParser::new();
    let parsed = parser.parse(jsx_code);
    match parsed {
        Ok(view_units) => {
            let mut compiler = InulaCompiler::new();
            let result_json = json!({
                "type": "success",
                "command": "parseJSXWithParser",
                "version": "2.0.0",
                "result": compiler.view_units_to_json(&view_units.iter().collect::<Vec<_>>()),
                "inputLength": jsx_code.len() as u32
            });
            Ok(JsValue::from_str(
                &serde_json::to_string(&result_json).unwrap(),
            ))
        }
        Err(e) => Err(JsValue::from_str(&format!("JSX解析失败：{}", e))),
    }
}

#[wasm_bindgen]
pub fn create_jsx_parser() -> JsValue {
    let parser = JsxParser::new();
    // 由于JsxParser没有实现Serialize，我们返回一个简单的标识
    JsValue::from_str("JSXParser created")
}

#[wasm_bindgen]
pub fn get_default_jsx_parser_config() -> JsValue {
    let config = ViewParserConfig::default();
    let config_json = json!({
        "htmlTags": config.html_tags,
        "willParseTemplate": config.will_parse_template,
        "customHtmlProps": config.custom_html_props
    });
    JsValue::from_str(&serde_json::to_string(&config_json).unwrap())
}

// 测试相关的全局函数
#[wasm_bindgen]
pub fn run_comprehensive_tests() -> JsValue {
    #[cfg(test)]
    {
        let report = comprehensive_tests::run_comprehensive_tests();
        JsValue::from_str(&report)
    }
    #[cfg(not(test))]
    {
        JsValue::from_str("测试功能仅在测试模式下可用")
    }
}

#[wasm_bindgen]
pub fn run_consistency_tests() -> JsValue {
    #[cfg(test)]
    {
        let report = consistency_tests::run_consistency_tests();
        JsValue::from_str(&report)
    }
    #[cfg(not(test))]
    {
        JsValue::from_str("测试功能仅在测试模式下可用")
    }
}

#[wasm_bindgen]
pub fn run_all_tests() -> JsValue {
    #[cfg(test)]
    {
        let report = test_runner::run_all_tests();
        JsValue::from_str(&report)
    }
    #[cfg(not(test))]
    {
        JsValue::from_str("测试功能仅在测试模式下可用")
    }
}

#[wasm_bindgen]
pub fn run_quick_tests() -> JsValue {
    #[cfg(test)]
    {
        let report = test_runner::run_quick_tests();
        JsValue::from_str(&report)
    }
    #[cfg(not(test))]
    {
        JsValue::from_str("测试功能仅在测试模式下可用")
    }
}

#[wasm_bindgen]
pub fn run_performance_tests() -> JsValue {
    #[cfg(test)]
    {
        let report = test_runner::run_performance_tests();
        JsValue::from_str(&report)
    }
    #[cfg(not(test))]
    {
        JsValue::from_str("测试功能仅在测试模式下可用")
    }
}
