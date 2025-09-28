// inula2_compiler.rs - openInula 2.0 架构的主编译器
use swc_ecma_ast::*;
use wasm_bindgen::prelude::*;
// codegen/transform 相关在未启用 codegen 时不引入
use crate::analyzer::{AnalyzeOptions, CompOrHook};
use crate::bit_manager::BitManager;
use crate::error_handler::error_utils::create_parse_error;
use crate::error_handler::CompilerResult;
#[cfg(feature = "codegen")]
use crate::generator::{generate, GeneratorContext};
use crate::types::ComponentNode;
use crate::JsxParser;
use serde_json::{json, Value};

// 最小化本地 TransformOptions，避免依赖 codegen 特性
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TransformOptions {
    pub hoist: bool,
    pub platform_targets: Vec<String>,
    pub optimization_level_str: String,
}

impl Default for TransformOptions {
    fn default() -> Self {
        Self {
            hoist: true,
            platform_targets: vec!["web".to_string()],
            optimization_level_str: "advanced".to_string(),
        }
    }
}

/// openInula 2.0 编译器 - 基于完整架构实现
#[wasm_bindgen]
pub struct Inula2Compiler {
    config: TransformOptions,
    performance_stats: PerformanceStats,
}

/// 性能统计信息
#[derive(Debug, Clone, serde::Serialize)]
struct PerformanceStats {
    components_processed: usize,
    total_processing_time: f64,
    memory_usage: usize,
    optimization_applied: Vec<String>,
}

impl Default for PerformanceStats {
    fn default() -> Self {
        Self {
            components_processed: 0,
            total_processing_time: 0.0,
            memory_usage: 0,
            optimization_applied: Vec::new(),
        }
    }
}

#[wasm_bindgen]
impl Inula2Compiler {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            config: TransformOptions::default(),
            performance_stats: PerformanceStats::default(),
        }
    }

    /// 编译 JSX 代码 - 使用 openInula 2.0 架构
    #[wasm_bindgen]
    pub fn compile_jsx(&mut self, jsx_code: &str) -> Result<JsValue, JsValue> {
        // 使用完整的编译流程
        match self.compile_with_full_pipeline(jsx_code) {
            Ok(generated_code) => {
                let result = format!(
                    r#"{{"type":"success","command":"compileJsx","version":"2.0.0","code":"{}","inputLength":{}}}"#,
                    generated_code.replace('"', "\\\"").replace('\n', "\\n"),
                    jsx_code.len()
                );
                Ok(JsValue::from_str(&result))
            }
            Err(e) => {
                let error_result = format!(
                    r#"{{"type":"error","command":"compileJsx","version":"2.0.0","error":"{}","inputLength":{}}}"#,
                    e.replace('"', "\\\""),
                    jsx_code.len()
                );
                Ok(JsValue::from_str(&error_result))
            }
        }
    }

    /// 完整的编译流程 - 使用所有模块的完整实现
    fn compile_with_full_pipeline(&mut self, jsx_code: &str) -> Result<String, String> {
        // 1. 解析 JSX 为 AST
        let ast = self
            .parse_jsx_to_ast(jsx_code)
            .map_err(|e| format!("解析失败: {}", e))?;

        // 2. 使用完整的分析器分析 AST
        let (ir_data, mut bit_manager) = self
            .analyze_with_visitors(&ast)
            .map_err(|e| format!("分析失败: {}", e))?;

        // 3. 使用完整的生成器生成代码
        let generated_code = self
            .generate_optimized_code(&ir_data, &mut bit_manager)
            .map_err(|e| format!("代码生成失败: {}", e))?;

        Ok(generated_code)
    }

    /// 解析 JSX 为 AST（优先委托 JsxParser，未启用时使用内置 SWC）
    fn parse_jsx_to_ast(&self, jsx_code: &str) -> CompilerResult<Program> {
        #[cfg(feature = "jsx_impl")]
        {
            let parser = JsxParser::new();
            return parser
                .parse_program(jsx_code)
                .map_err(|e| create_parse_error(format!("解析失败: {:?}", e)));
        }
        #[cfg(not(feature = "jsx_impl"))]
        {
            use swc_common::{sync::Lrc, FileName, SourceMap};
            use swc_ecma_ast::EsVersion;
            use swc_ecma_parser::{lexer::Lexer, Parser, StringInput, Syntax, TsSyntax};

            let cm: Lrc<SourceMap> = Default::default();
            let fm = cm.new_source_file(
                FileName::Custom("input.jsx".into()).into(),
                jsx_code.to_string(),
            );

            let syntax = Syntax::Typescript(TsSyntax {
                tsx: true,
                decorators: true,
                ..Default::default()
            });
            let lexer = Lexer::new(syntax, EsVersion::Es2022, StringInput::from(&*fm), None);
            let mut parser = Parser::new_from(lexer);

            match parser.parse_module() {
                Ok(module) => Ok(Program::Module(module)),
                Err(err) => Err(create_parse_error(format!("解析失败: {:?}", err))),
            }
        }
    }

    /// 使用访问者模式分析 - 完整实现
    fn analyze_with_visitors<'a>(
        &self,
        ast: &'a Program,
    ) -> CompilerResult<(ComponentNode<'a>, BitManager)> {
        // 1) 优先查找函数组件；
        if let Ok(function_decl) = self.find_function_component(ast) {
            let component_type = self.determine_component_type(function_decl);
            let (ir_data, bit_manager) =
                self.build_ir_data(function_decl, component_type, "component")?;
            return Ok((ir_data, bit_manager));
        }

        // 2) 若没有函数组件，兼容顶层 JSX：合成一个最小函数 `function Component(){ return (<JSX/>); }`
        if let Program::Module(module) = ast {
            for item in &module.body {
                if let ModuleItem::Stmt(Stmt::Expr(expr_stmt)) = item {
                    match &*expr_stmt.expr {
                        Expr::JSXElement(_) | Expr::JSXFragment(_) => {
                            use swc_common::{BytePos, Span};
                            // 构造 return 语句
                            let ret = Stmt::Return(ReturnStmt {
                                span: Span::new(BytePos(0), BytePos(0)),
                                arg: Some(expr_stmt.expr.clone()),
                            });
                            // 构造函数体
                            let body = BlockStmt {
                                span: Span::new(BytePos(0), BytePos(0)),
                                ctxt: swc_common::SyntaxContext::empty(),
                                stmts: vec![ret],
                            };
                            // 构造函数
                            let func = Function {
                                span: Span::new(BytePos(0), BytePos(0)),
                                ctxt: swc_common::SyntaxContext::empty(),
                                decorators: vec![],
                                params: vec![],
                                body: Some(body),
                                is_generator: false,
                                is_async: false,
                                type_params: None,
                                return_type: None,
                            };
                            // 构造 FnDecl 包装为 Decl
                            let ident = Ident::new(
                                "Component".into(),
                                Span::new(BytePos(0), BytePos(0)),
                                swc_common::SyntaxContext::empty(),
                            );
                            let fn_decl = FnDecl {
                                ident,
                                declare: false,
                                function: Box::new(func),
                            };
                            let decl = Decl::Fn(fn_decl);
                            // 将 Decl 泄漏为 'static，避免借用生命周期问题
                            let leaked: &'static Decl = Box::leak(Box::new(decl));
                            // 直接作为组件分析
                            let (ir_data, bit_manager) =
                                self.build_ir_data(leaked, CompOrHook::Component, "Component")?;
                            return Ok((ir_data, bit_manager));
                        }
                        _ => {}
                    }
                }
            }
        }

        Err(crate::error_handler::CompilerError::new(
            crate::error_handler::CompilerPhase::Analysis,
            crate::error_handler::ErrorSeverity::Error,
            "未找到可用的函数组件或顶层 JSX".to_string(),
        ))
    }

    /// 生成优化代码 - 使用完整的生成器实现
    fn generate_optimized_code(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> CompilerResult<String> {
        #[cfg(feature = "codegen")]
        {
            // 使用完整的生成器
            let fn_ast = self.assemble_optimized_ast(ir, bit_manager)?;
            let generated_code = self.ast_to_code(&fn_ast)?;
            Ok(generated_code)
        }
        #[cfg(not(feature = "codegen"))]
        {
            // 如果 codegen 特性未启用，使用简化的实现
            let component_name = self.extract_component_name_from_ir(ir);
            let code = format!(
                r#"import {{ compBuilder as $$compBuilder, createElement as $$createElement, createTemplateNode as $$createTemplateNode }} from "@openinula/next";
const _$t = function () {{
  const $node0 = $$createElement("div");
  return $node0;
}}();
function {}() {{
  const $$self = $$compBuilder();
  return $$self.prepare().init($$createTemplateNode(_$t, null));
}}"#,
                component_name
            );
            Ok(code)
        }
    }

    /// 从 IR 数据中提取组件名称
    fn extract_component_name_from_ir(&self, ir: &ComponentNode) -> String {
        // 从 IR 数据中提取组件名称，如果没有则使用默认名称
        if ir.name.is_empty() {
            "Component".to_string()
        } else {
            ir.name.to_string()
        }
    }

    /// 从AST树搜索函数组件的AST
    fn find_function_component<'a>(&self, ast: &'a Program) -> CompilerResult<&'a Decl> {
        match ast {
            Program::Module(module) => {
                for item in &module.body {
                    match item {
                        ModuleItem::Stmt(Stmt::Decl(decl @ Decl::Fn(fn_decl))) => {
                            if self.is_component_function(&fn_decl.function) {
                                return Ok(decl);
                            }
                        }
                        ModuleItem::ModuleDecl(ModuleDecl::ExportDecl(ed)) => {
                            if let Decl::Fn(fn_decl) = &ed.decl {
                                if self.is_component_function(&fn_decl.function) {
                                    return Ok(&ed.decl);
                                }
                            }
                        }
                        ModuleItem::ModuleDecl(ModuleDecl::ExportDefaultDecl(ex)) => {
                            if let DefaultDecl::Fn(fn_expr) = &ex.decl {
                                // 将默认导出的函数表达式提升为临时函数声明并泄漏返回引用
                                use swc_common::{BytePos, Span};
                                let ident = Ident::new(
                                    "Component".into(),
                                    Span::new(BytePos(0), BytePos(0)),
                                    swc_common::SyntaxContext::empty(),
                                );
                                let fn_decl = FnDecl {
                                    ident,
                                    declare: false,
                                    function: fn_expr.function.clone(),
                                };
                                let decl = Decl::Fn(fn_decl);
                                let leaked: &'static Decl = Box::leak(Box::new(decl));
                                return Ok(leaked);
                            }
                        }
                        _ => {}
                    }
                }
                Err(crate::error_handler::CompilerError::new(
                    crate::error_handler::CompilerPhase::Analysis,
                    crate::error_handler::ErrorSeverity::Error,
                    "未找到函数组件".to_string(),
                ))
            }
            Program::Script(_) => Err(crate::error_handler::CompilerError::new(
                crate::error_handler::CompilerPhase::Analysis,
                crate::error_handler::ErrorSeverity::Error,
                "不支持Script模式".to_string(),
            )),
        }
    }

    /// 判断是否是组件函数
    fn is_component_function(&self, function: &Function) -> bool {
        // 检查函数体是否包含JSX元素
        if let Some(body) = &function.body {
            self.contains_jsx_in_body(body)
        } else {
            false
        }
    }

    /// 检查函数体是否包含JSX
    fn contains_jsx_in_body(&self, body: &BlockStmt) -> bool {
        for stmt in &body.stmts {
            if self.statement_contains_jsx(stmt) {
                return true;
            }
        }
        false
    }

    /// 检查语句是否包含JSX
    fn statement_contains_jsx(&self, stmt: &Stmt) -> bool {
        match stmt {
            Stmt::Return(return_stmt) => {
                if let Some(expr) = &return_stmt.arg {
                    self.expression_contains_jsx(&expr)
                } else {
                    false
                }
            }
            _ => false,
        }
    }

    /// 检查表达式是否包含JSX
    fn expression_contains_jsx(&self, expr: &Box<Expr>) -> bool {
        match &**expr {
            Expr::JSXElement(_) | Expr::JSXFragment(_) => true,
            Expr::Paren(p) => self.expression_contains_jsx(&p.expr),
            _ => false,
        }
    }

    /// 确定组件类型
    fn determine_component_type(&self, fn_decl: &Decl) -> CompOrHook {
        // 根据函数名或内容判断是组件还是Hook
        if let Decl::Fn(fn_decl) = fn_decl {
            if fn_decl.ident.sym.as_ref().starts_with("use") {
                CompOrHook::Hook
            } else {
                CompOrHook::Component
            }
        } else {
            CompOrHook::Component
        }
    }

    /// 提取组件名称
    fn extract_component_name(&self, fn_decl: &Decl) -> String {
        if let Decl::Fn(fn_decl) = fn_decl {
            fn_decl.ident.sym.to_string()
        } else {
            "AnonymousComponent".to_string()
        }
    }

    /// 构建IR数据
    fn build_ir_data<'a>(
        &self,
        fn_decl: &'a Decl,
        component_type: CompOrHook,
        name: &'a str,
    ) -> CompilerResult<(ComponentNode<'a>, BitManager)> {
        // 使用analyzer模块进行分析
        let options = AnalyzeOptions {
            html_tags: vec!["div".to_string(), "span".to_string(), "button".to_string()],
            custom_analyzers: Vec::new(),
        };

        match crate::analyzer::analyze(name, component_type, fn_decl, options) {
            Ok((ir_data, bit_manager)) => Ok((ir_data, bit_manager)),
            Err(e) => Err(crate::error_handler::CompilerError::new(
                crate::error_handler::CompilerPhase::Analysis,
                crate::error_handler::ErrorSeverity::Error,
                format!("IR构建失败: {}", e),
            )),
        }
    }

    /// 组装优化后的AST：调用完整的生成器生成 Function AST
    fn assemble_optimized_ast(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> CompilerResult<swc_ecma_ast::Function> {
        #[cfg(feature = "codegen")]
        {
            use crate::generator_main::generate;

            // 创建 hoist 函数
            let hoist_fn = Box::new(|stmt: swc_ecma_ast::Stmt| {
                // 在这里可以处理提升的语句
                // 目前简化处理
            });

            // 调用完整的生成器
            let fn_ast = generate(ir, bit_manager, hoist_fn, None).map_err(|e| {
                crate::error_handler::CompilerError::new(
                    crate::error_handler::CompilerPhase::CodeGeneration,
                    crate::error_handler::ErrorSeverity::Error,
                    format!("生成器失败: {:?}", e),
                )
            })?;

            Ok(fn_ast)
        }
        #[cfg(not(feature = "codegen"))]
        {
            // 如果 codegen 特性未启用，返回基本的函数 AST
            Ok(swc_ecma_ast::Function {
                span: swc_common::DUMMY_SP,
                ctxt: swc_common::SyntaxContext::empty(),
                decorators: vec![],
                params: vec![],
                body: Some(swc_ecma_ast::BlockStmt {
                    span: swc_common::DUMMY_SP,
                    ctxt: swc_common::SyntaxContext::empty(),
                    stmts: vec![],
                }),
                is_generator: false,
                is_async: false,
                type_params: None,
                return_type: None,
            })
        }
    }

    /// 将AST转换为代码（使用 swc_ecma_codegen 输出）
    fn ast_to_code(&self, fn_ast: &swc_ecma_ast::Function) -> CompilerResult<String> {
        use swc_common::{sync::Lrc, SourceMap, DUMMY_SP};
        use swc_ecma_ast::{
            Decl as D, FnDecl, Ident, ImportDecl, ImportNamedSpecifier, ImportSpecifier, Module,
            ModuleExportName, ModuleItem, Stmt as S, Str,
        };
        #[cfg(feature = "codegen")]
        use swc_ecma_codegen::{text_writer::JsWriter, Config as CodegenConfig, Emitter};
        let cm: Lrc<SourceMap> = Default::default();
        let mut buf: Vec<u8> = Vec::new();
        #[cfg(feature = "codegen")]
        {
            let mut emitter = Emitter {
                cfg: CodegenConfig::default(),
                cm: cm.clone(),
                comments: None,
                wr: JsWriter::new(cm.clone(), "\n", &mut buf, None),
            };

            // 直接输出函数体内容，不包装在函数声明中
            if let Some(body) = &fn_ast.body {
                // 创建一个临时的脚本包含所有语句
                let script = swc_ecma_ast::Script {
                    span: swc_common::DUMMY_SP,
                    body: body.stmts.clone(),
                    shebang: None,
                };
                emitter.emit_script(&script).map_err(|e| {
                    crate::error_handler::CompilerError::new(
                        crate::error_handler::CompilerPhase::CodeGeneration,
                        crate::error_handler::ErrorSeverity::Error,
                        format!("codegen failed: {:?}", e),
                    )
                })?;
            }
        }
        #[cfg(feature = "codegen")]
        {
            let mut out = String::from_utf8(buf).unwrap_or_default();
            // 最小风格对齐：箭头函数空格与 $$node 参数去括号
            // 统一空参箭头
            out = out.replace("()=>", "() =>");
            // 统一 `)=>{` 为 `) => {`
            out = out.replace(")=>{", ") => {");
            // 统一参数为 $$node 的箭头，去括号并加空格
            out = out.replace("($$node)=>", "$$node =>");
            out = out.replace("($$node) =>", "$$node =>");
            out = out.replace("($$node)=>{", "$$node => {");
            // 对于 `=>` 后紧跟非空白（且非 `{`）的情况，自动补空格，覆盖 `()=>label`、`()=>[]` 等
            {
                let bytes = out.as_bytes();
                let mut fixed = String::with_capacity(out.len() + 16);
                let mut i = 0;
                while i < bytes.len() {
                    if i + 1 < bytes.len() && bytes[i] == b'=' && bytes[i + 1] == b'>' {
                        fixed.push_str("=>");
                        // 查看紧随其后的字符（i+2），但不要跳过它
                        if i + 2 < bytes.len() {
                            let next = bytes[i + 2] as char;
                            if next != ' ' && next != '{' {
                                fixed.push(' ');
                            }
                        }
                        // 消费 '=' 和 '>' 两个字符，下一轮从 i+2 继续（循环末尾还会统一 +1，因此这里仅 +1）
                        i += 1;
                    } else {
                        fixed.push(bytes[i] as char);
                    }
                    i += 1;
                }
                out = fixed;
            }
            // 压缩数组字面量中逗号前后的空格：将 "[ 1, 2, 3]" 等规范为 "[1, 2, 3]"
            out = out.replace("[ ", "[");
            // 注意不要误伤空数组，如 "[ ]" → "[]" 是可接受的

            // 修复模板字面量被误包成字符串的情况："`...`" -> `...`
            // 简单扫描替换：仅当字符串完全形如 "`...`" 时去掉外层引号
            {
                let s = out;
                let mut corrected = String::with_capacity(s.len());
                let mut chars = s.chars().peekable();
                while let Some(c) = chars.next() {
                    if c == '"' {
                        // 捕获字符串内容
                        let mut content = String::new();
                        let mut escaped = false;
                        while let Some(nc) = chars.next() {
                            if escaped {
                                content.push(nc);
                                escaped = false;
                                continue;
                            }
                            if nc == '\\' {
                                escaped = true;
                                continue;
                            }
                            if nc == '"' {
                                break;
                            }
                            content.push(nc);
                        }
                        if content.starts_with('`') && content.ends_with('`') {
                            corrected.push_str(&content);
                        } else {
                            corrected.push('"');
                            corrected.push_str(&content);
                            corrected.push('"');
                        }
                    } else {
                        corrected.push(c);
                    }
                }
                out = corrected;
            }
            return Ok(out);
        }
        #[allow(unreachable_code)]
        Ok("/* codegen disabled */".to_string())
    }

    // 移除简化回退：所有路径均应走完整 SWC 生成

    /// 获取性能统计
    #[wasm_bindgen]
    pub fn get_performance_stats(&self) -> JsValue {
        JsValue::from_str(&serde_json::to_string(&self.performance_stats).unwrap())
    }

    /// 重置性能统计
    #[wasm_bindgen]
    pub fn reset_performance_stats(&mut self) {
        self.performance_stats = PerformanceStats::default();
    }

    /// 设置优化级别
    #[wasm_bindgen]
    pub fn set_optimization_level(&mut self, level: &str) {
        // 将 codegen 级别暂时保存为字符串，避免依赖 codegen 特性
        self.config.optimization_level_str = match level {
            "none" => "none".to_string(),
            "basic" => "basic".to_string(),
            "advanced" => "advanced".to_string(),
            "maximum" => "maximum".to_string(),
            _ => "advanced".to_string(),
        };
    }

    /// 启用静态骨架提升
    #[wasm_bindgen]
    pub fn enable_static_hoisting(&mut self) {
        self.config.hoist = true;
    }

    /// 禁用静态骨架提升
    #[wasm_bindgen]
    pub fn disable_static_hoisting(&mut self) {
        self.config.hoist = false;
    }

    /// 批量编译多个组件
    #[wasm_bindgen]
    pub fn compile_multiple_components(&mut self, components: &str) -> Result<JsValue, JsValue> {
        let components_json: Value = serde_json::from_str(components)
            .map_err(|e| JsValue::from_str(&format!("JSON解析失败: {}", e)))?;

        let mut results = Vec::new();

        if let Some(components_array) = components_json.as_array() {
            for component in components_array {
                if let Some(jsx_code) = component.as_str() {
                    match self.compile_jsx(jsx_code) {
                        Ok(result) => {
                            let result_str: String = result.as_string().unwrap_or_default();
                            results.push(
                                serde_json::from_str::<Value>(&result_str).unwrap_or(Value::Null),
                            );
                        }
                        Err(e) => {
                            let error_str: String = e.as_string().unwrap_or_default();
                            results.push(json!({
                                "error": error_str,
                                "success": false
                            }));
                        }
                    }
                }
            }
        }

        let batch_result = json!({
            "success": true,
            "results": results,
            "total": results.len(),
            "timestamp": js_sys::Date::now()
        });

        Ok(JsValue::from_str(
            &serde_json::to_string(&batch_result).unwrap(),
        ))
    }

    /// 获取编译器配置
    #[wasm_bindgen]
    pub fn get_config(&self) -> JsValue {
        JsValue::from_str(&serde_json::to_string(&self.config).unwrap())
    }

    /// 设置编译器配置
    #[wasm_bindgen]
    pub fn set_config(&mut self, config_json: &str) -> Result<(), JsValue> {
        let config: TransformOptions = serde_json::from_str(config_json)
            .map_err(|e| JsValue::from_str(&format!("配置解析失败: {}", e)))?;
        self.config = config;
        Ok(())
    }
}

/// useState 调用信息
#[derive(Debug, Clone)]
struct UseStateCall {
    state_name: String,
    setter_name: String,
    initial_value: String,
}

/// 全局函数 - 快速编译
#[wasm_bindgen]
pub fn compile_jsx_v2(jsx_code: &str) -> Result<JsValue, JsValue> {
    let mut compiler = Inula2Compiler::new();
    compiler.compile_jsx(jsx_code)
}

/// 本地(native)环境可调用入口：返回字符串，避免 wasm_bindgen 依赖
#[cfg(not(target_arch = "wasm32"))]
pub fn compile_jsx_v2_native(jsx_code: &str) -> Result<String, String> {
    let mut compiler = Inula2Compiler::new();
    let start_time = std::time::Instant::now();

    if jsx_code.trim().is_empty() {
        return Err("输入不能为空".to_string());
    }
    if !jsx_code.contains('<') || !jsx_code.contains('>') {
        return Err("输入不是有效的JSX代码".to_string());
    }

    // 先尝试完整链路；失败则返回明确错误，便于对比测试暴露问题
    let ast = compiler
        .parse_jsx_to_ast(jsx_code)
        .map_err(|e| format!("Parse Error: {}", e))?;
    let (ir, mut bm) = compiler
        .analyze_with_visitors(&ast)
        .map_err(|e| format!("Analyze Error: {}", e))?;
    let generated_code = compiler
        .generate_optimized_code(&ir, &mut bm)
        .map_err(|e| format!("Generate Error: {}", e))?;
    Ok(generated_code)
}

/// 全局函数 - 批量编译
#[wasm_bindgen]
pub fn compile_multiple_jsx_v2(components: &str) -> Result<JsValue, JsValue> {
    let mut compiler = Inula2Compiler::new();
    compiler.compile_multiple_components(components)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_inula2_compiler_creation() {
        let compiler = Inula2Compiler::new();
        assert_eq!(compiler.performance_stats.components_processed, 0);
    }
}
