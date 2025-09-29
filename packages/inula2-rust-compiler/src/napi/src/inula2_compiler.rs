// inula2_compiler.rs - 集成器，参考 WASM 版本实现完整的编译器
use crate::analyzer::{AnalyzeOptions, CompOrHook};
use crate::bit_manager::BitManager;
use crate::error_handler::{CompilerError, CompilerPhase, CompilerResult, ErrorSeverity};
use crate::jsx_parser::{JsxParser, ViewUnit};
use crate::performance_optimizer::PerformanceOptimizer;
use crate::types::{ComponentNode, UnitProp};
use serde_json::{json, Value};
use swc_ecma_ast::*;

// 编译器配置选项
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TransformOptions {
    pub hoist: bool,
    pub platform_targets: Vec<String>,
    pub optimization_level: String,
}

impl Default for TransformOptions {
    fn default() -> Self {
        Self {
            hoist: true,
            platform_targets: vec!["web".to_string()],
            optimization_level: "advanced".to_string(),
        }
    }
}

// 性能统计
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PerformanceStats {
    pub components_processed: usize,
    pub total_processing_time: f64,
    pub memory_usage: usize,
    pub optimization_applied: Vec<String>,
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

// 集成器结构 - 参考 WASM 版本实现
pub struct Inula2Compiler {
    config: TransformOptions,
    performance_stats: PerformanceStats,
    jsx_parser: JsxParser,
    bit_manager: BitManager,
    performance_optimizer: PerformanceOptimizer,
}

impl Inula2Compiler {
    pub fn new() -> Self {
        Self {
            config: TransformOptions::default(),
            performance_stats: PerformanceStats::default(),
            jsx_parser: JsxParser::new(),
            bit_manager: BitManager::new(),
            performance_optimizer: PerformanceOptimizer::new(),
        }
    }

    /// 编译 JSX 代码 - 直接使用 jsx_parser 生成代码
    pub fn compile_jsx(&mut self, jsx_code: &str) -> Result<String, String> {
        // 使用完整的编译流程
        self.compile_with_full_pipeline(jsx_code)
    }

    /// 完整的编译流程 - 参考 WASM 版本实现
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

    /// 解析 JSX 为 AST - 参考 WASM 版本
    fn parse_jsx_to_ast(&self, jsx_code: &str) -> CompilerResult<Program> {
        // 使用 SWC 解析器解析 JSX
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
            Err(err) => Err(CompilerError::new(
                CompilerPhase::Parsing,
                ErrorSeverity::Error,
                format!("解析失败: {:?}", err),
            )),
        }
    }

    /// 使用访问者模式分析 - 参考 WASM 版本
    fn analyze_with_visitors<'a>(
        &self,
        ast: &'a Program,
    ) -> CompilerResult<(ComponentNode<'a>, BitManager)> {
        // 1) 优先查找函数组件
        if let Ok(function_decl) = self.find_function_component(ast) {
            let component_type = self.determine_component_type(function_decl);
            let (ir_data, bit_manager) =
                self.build_ir_data(function_decl, component_type, "component")?;
            return Ok((ir_data, bit_manager));
        }

        // 2) 若没有函数组件，兼容顶层 JSX：合成一个最小函数
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

        Err(CompilerError::new(
            CompilerPhase::Analysis,
            ErrorSeverity::Error,
            "未找到可用的函数组件或顶层 JSX".to_string(),
        ))
    }

    /// 生成优化代码 - 参考 WASM 版本
    fn generate_optimized_code(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> CompilerResult<String> {
        // 使用完整的生成器
        let fn_ast = self.assemble_optimized_ast(ir, bit_manager)?;
        let generated_code = self.ast_to_code(&fn_ast)?;
        Ok(generated_code)
    }

    /// 从AST树搜索函数组件的AST - 参考 WASM 版本
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
                Err(CompilerError::new(
                    CompilerPhase::Analysis,
                    ErrorSeverity::Error,
                    "未找到函数组件".to_string(),
                ))
            }
            Program::Script(_) => Err(CompilerError::new(
                CompilerPhase::Analysis,
                ErrorSeverity::Error,
                "不支持Script模式".to_string(),
            )),
        }
    }

    /// 判断是否是组件函数 - 参考 WASM 版本
    fn is_component_function(&self, function: &Function) -> bool {
        // 检查函数体是否包含JSX元素
        if let Some(body) = &function.body {
            self.contains_jsx_in_body(body)
        } else {
            false
        }
    }

    /// 检查函数体是否包含JSX - 参考 WASM 版本
    fn contains_jsx_in_body(&self, body: &BlockStmt) -> bool {
        for stmt in &body.stmts {
            if self.statement_contains_jsx(stmt) {
                return true;
            }
        }
        false
    }

    /// 检查语句是否包含JSX - 参考 WASM 版本
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

    /// 检查表达式是否包含JSX - 参考 WASM 版本
    fn expression_contains_jsx(&self, expr: &Box<Expr>) -> bool {
        match &**expr {
            Expr::JSXElement(_) | Expr::JSXFragment(_) => true,
            Expr::Paren(p) => self.expression_contains_jsx(&p.expr),
            _ => false,
        }
    }

    /// 确定组件类型 - 参考 WASM 版本
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

    /// 构建IR数据 - 参考 WASM 版本
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
            Err(e) => Err(CompilerError::new(
                CompilerPhase::Analysis,
                ErrorSeverity::Error,
                format!("IR构建失败: {}", e),
            )),
        }
    }

    /// 组装优化后的AST - 参考 WASM 版本
    fn assemble_optimized_ast(
        &self,
        ir: &ComponentNode,
        bit_manager: &mut BitManager,
    ) -> CompilerResult<swc_ecma_ast::Function> {
        use crate::generator::generate;

        // 创建 hoist 函数
        let hoist_fn = Box::new(|stmt: swc_ecma_ast::Stmt| {
            // 在这里可以处理提升的语句
            // 目前简化处理
        });

        // 调用完整的生成器
        let fn_ast = generate(ir, bit_manager, hoist_fn, None).map_err(|e| {
            CompilerError::new(
                CompilerPhase::CodeGeneration,
                ErrorSeverity::Error,
                format!("生成器失败: {:?}", e),
            )
        })?;

        // 直接返回函数体内容，不包装在函数声明中
        Ok(fn_ast)
    }

    /// 将AST转换为代码 - 参考 WASM 版本
    fn ast_to_code(&self, fn_ast: &swc_ecma_ast::Function) -> CompilerResult<String> {
        use swc_common::{sync::Lrc, SourceMap, DUMMY_SP};
        use swc_ecma_ast::{Decl as D, FnDecl, Ident, Module, ModuleItem, Stmt as S};
        use swc_ecma_codegen::{text_writer::JsWriter, Config as CodegenConfig, Emitter};

        let cm: Lrc<SourceMap> = Default::default();
        let mut buf: Vec<u8> = Vec::new();

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
                CompilerError::new(
                    CompilerPhase::CodeGeneration,
                    ErrorSeverity::Error,
                    format!("codegen failed: {:?}", e),
                )
            })?;
        }

        let mut out = String::from_utf8(buf).unwrap_or_default();

        // 代码风格优化 - 参考 WASM 版本
        out = out.replace("()=>", "() =>");
        out = out.replace(")=>{", ") => {");
        out = out.replace("($$node)=>", "$$node =>");
        out = out.replace("($$node) =>", "$$node =>");
        out = out.replace("($$node)=>{", "$$node => {");
        out = out.replace("[ ", "[");

        Ok(out)
    }

    // 将 ViewUnit 直接生成为代码字符串 - 与 TypeScript 版本对齐
    fn view_units_to_code(&self, view_units: &[ViewUnit]) -> Result<String, String> {
        if view_units.is_empty() {
            return Ok("null".to_string());
        }

        if view_units.len() == 1 {
            return self.view_unit_to_code(&view_units[0]);
        }

        // 多个 ViewUnit 需要包装在 Fragment 中
        let mut fragment_children = Vec::new();
        for unit in view_units {
            let child_code = self.view_unit_to_code(unit)?;
            fragment_children.push(child_code);
        }

        Ok(format!(
            "createFragmentNode({})",
            fragment_children.join(", ")
        ))
    }

    // 将单个 ViewUnit 转换为代码字符串
    fn view_unit_to_code(&self, unit: &ViewUnit) -> Result<String, String> {
        match unit {
            ViewUnit::Text(text_unit) => {
                Ok(format!("createTextNode(\"{}\")", text_unit.content.value))
            }
            ViewUnit::Html(html_unit) => {
                // 提取标签名
                let tag_name = self.extract_tag_name(&html_unit.tag)?;

                // 处理属性
                let mut attributes = Vec::new();
                let mut has_expression = false;
                for (key, prop) in &html_unit.props {
                    match &prop.value {
                        Expr::Lit(Lit::Str(str_lit)) => {
                            println!("DEBUG: Processing Lit::Str attribute {}: value='{}', contains ${{}}={}", key, str_lit.value, str_lit.value.contains("${"));
                            // 检查是否是模板字符串（包含${}语法）
                            if str_lit.value.contains("${") {
                                // 这是一个模板字符串，需要转换为模板字符串格式
                                println!(
                                    "DEBUG: Found template string in attribute {}: {}",
                                    key, str_lit.value
                                );
                                attributes.push(format!(
                                    "  $$node.setAttribute(\"{}\", `{}`);",
                                    key, str_lit.value
                                ));
                            } else {
                                // 普通字符串字面量
                                attributes.push(format!(
                                    "  $$node.setAttribute(\"{}\", \"{}\");",
                                    key, str_lit.value
                                ));
                            }
                        }
                        Expr::Lit(Lit::Bool(bool_lit)) => {
                            attributes.push(format!(
                                "  $$node.setAttribute(\"{}\", {});",
                                key, bool_lit.value
                            ));
                        }
                        Expr::Lit(Lit::Num(num_lit)) => {
                            attributes.push(format!(
                                "  $$node.setAttribute(\"{}\", {});",
                                key, num_lit.value
                            ));
                        }
                        Expr::Tpl(tpl) => {
                            // 处理模板字符串属性
                            let tpl_str = self.expr_to_string(&prop.value)?;
                            attributes
                                .push(format!("  $$node.setAttribute(\"{}\", {});", key, tpl_str));
                        }
                        _ => {
                            // 对于其他表达式，我们需要生成 createExpNode
                            has_expression = true;
                            break;
                        }
                    }
                }

                if has_expression {
                    // 如果有表达式，生成 createExpNode 格式
                    return Ok(format!(
                        "createHTMLNode(\"{}\", null, createExpNode(() => {}, () => [], 0))",
                        tag_name, "/* expression */"
                    ));
                }

                // 处理子元素
                let mut children_code = String::new();
                if !html_unit.children.is_empty() {
                    for child in &html_unit.children {
                        let child_code = self.view_unit_to_code(child)?;
                        children_code.push_str(&format!(
                            "  $$node.setAttribute(\"textContent\", {});\n",
                            child_code
                        ));
                    }
                }

                if attributes.is_empty() && children_code.is_empty() {
                    Ok(format!("createHTMLNode(\"{}\")", tag_name))
                } else {
                    let mut code = format!("createHTMLNode(\"{}\", $$node => {{\n", tag_name);
                    code.push_str(&attributes.join("\n"));
                    if !children_code.is_empty() {
                        code.push_str(&children_code);
                    }
                    code.push_str("\n})");
                    Ok(code)
                }
            }
            ViewUnit::Fragment(fragment_unit) => {
                let mut children = Vec::new();
                for child in &fragment_unit.children {
                    let child_code = self.view_unit_to_code(child)?;
                    children.push(child_code);
                }
                Ok(format!("createFragmentNode({})", children.join(", ")))
            }
            ViewUnit::Exp(exp_unit) => Ok(format!(
                "createExpNode(() => {}, () => [], 0)",
                self.expr_to_string(&exp_unit.content.value)?
            )),
            _ => {
                // 其他类型的 ViewUnit，暂时返回 null
                Ok("null".to_string())
            }
        }
    }

    // 提取标签名
    fn extract_tag_name(&self, tag: &swc_ecma_ast::Expr) -> Result<String, String> {
        match tag {
            Expr::Ident(ident) => Ok(ident.sym.to_string()),
            Expr::Lit(Lit::Str(str_lit)) => Ok(str_lit.value.to_string()),
            _ => Ok("div".to_string()), // 默认标签
        }
    }

    // 将表达式转换为字符串
    fn expr_to_string(&self, expr: &swc_ecma_ast::Expr) -> Result<String, String> {
        match expr {
            Expr::Ident(ident) => Ok(ident.sym.to_string()),
            Expr::Lit(Lit::Str(str_lit)) => Ok(format!("\"{}\"", str_lit.value)),
            Expr::Lit(Lit::Num(num_lit)) => Ok(num_lit.value.to_string()),
            Expr::Lit(Lit::Bool(bool_lit)) => Ok(bool_lit.value.to_string()),
            Expr::Tpl(tpl) => {
                // 处理模板字符串
                println!(
                    "DEBUG: Found template literal with {} quasis and {} exprs",
                    tpl.quasis.len(),
                    tpl.exprs.len()
                );
                let mut result = String::from("`");
                for (i, quasi) in tpl.quasis.iter().enumerate() {
                    result.push_str(&quasi.raw);
                    if i < tpl.exprs.len() {
                        let expr_str = self.expr_to_string(&tpl.exprs[i])?;
                        result.push_str(&format!("${{{}}}", expr_str));
                    }
                }
                result.push('`');
                println!("DEBUG: Generated template string: {}", result);
                Ok(result)
            }
            _ => {
                println!("DEBUG: Unknown expression type: {:?}", expr);
                Ok("/* expression */".to_string())
            }
        }
    }

    // 创建函数声明 (用于分析器)
    fn create_function_decl(&self, _component_node: &ComponentNode) -> swc_ecma_ast::Decl {
        // 简化实现：创建一个基本的函数声明
        use swc_common::DUMMY_SP;
        use swc_ecma_ast::*;

        Decl::Fn(FnDecl {
            ident: Ident::new(
                "Component".into(),
                DUMMY_SP,
                swc_common::SyntaxContext::empty(),
            ),
            function: Box::new(Function {
                span: DUMMY_SP,
                ctxt: swc_common::SyntaxContext::empty(),
                decorators: vec![],
                params: vec![],
                body: Some(BlockStmt {
                    span: DUMMY_SP,
                    ctxt: swc_common::SyntaxContext::empty(),
                    stmts: vec![],
                }),
                is_generator: false,
                is_async: false,
                type_params: None,
                return_type: None,
            }),
            declare: false,
        })
    }

    // 将 AST 转换为 JavaScript 代码字符串
    fn ast_to_js_string(&self, ast: &swc_ecma_ast::Function) -> String {
        // 简化实现，直接返回基本的函数结构
        // 在实际项目中，这里应该使用 SWC 的代码生成器
        match &ast.body {
            Some(body) => {
                if body.stmts.is_empty() {
                    "function() { return null; }".to_string()
                } else {
                    "function() { /* generated code */ }".to_string()
                }
            }
            None => "function() { return null; }".to_string(),
        }
    }

    /// 获取性能统计 - 参考 WASM 版本
    pub fn get_performance_stats(&self) -> String {
        serde_json::to_string(&self.performance_stats).unwrap_or_default()
    }

    /// 重置性能统计 - 参考 WASM 版本
    pub fn reset_performance_stats(&mut self) {
        self.performance_stats = PerformanceStats::default();
    }

    /// 设置优化级别 - 参考 WASM 版本
    pub fn set_optimization_level(&mut self, level: &str) {
        self.config.optimization_level = match level {
            "none" => "none".to_string(),
            "basic" => "basic".to_string(),
            "advanced" => "advanced".to_string(),
            "maximum" => "maximum".to_string(),
            _ => "advanced".to_string(),
        };
    }

    /// 启用静态骨架提升 - 参考 WASM 版本
    pub fn enable_static_hoisting(&mut self) {
        self.config.hoist = true;
    }

    /// 禁用静态骨架提升 - 参考 WASM 版本
    pub fn disable_static_hoisting(&mut self) {
        self.config.hoist = false;
    }

    /// 批量编译多个组件 - 参考 WASM 版本
    pub fn compile_multiple_components(&mut self, components: &str) -> Result<String, String> {
        let components_json: Value =
            serde_json::from_str(components).map_err(|e| format!("JSON解析失败: {}", e))?;

        let mut results = Vec::new();

        if let Some(components_array) = components_json.as_array() {
            for component in components_array {
                if let Some(jsx_code) = component.as_str() {
                    match self.compile_jsx(jsx_code) {
                        Ok(result) => {
                            results.push(json!({
                                "success": true,
                                "result": result
                            }));
                        }
                        Err(e) => {
                            results.push(json!({
                                "error": e,
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
            "timestamp": std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
        });

        Ok(serde_json::to_string(&batch_result).unwrap())
    }

    /// 获取编译器配置 - 参考 WASM 版本
    pub fn get_config(&self) -> String {
        serde_json::to_string(&self.config).unwrap_or_default()
    }

    /// 设置编译器配置 - 参考 WASM 版本
    pub fn set_config(&mut self, config_json: &str) -> Result<(), String> {
        let config: TransformOptions =
            serde_json::from_str(config_json).map_err(|e| format!("配置解析失败: {}", e))?;
        self.config = config;
        Ok(())
    }
}

/// 全局编译函数 - 使用 openInula 2.0 架构，参考 WASM 版本
pub fn compile_jsx_v2_native(jsx_code: &str) -> Result<String, String> {
    // 创建编译器实例
    let mut compiler = Inula2Compiler::new();

    // 编译 JSX 代码
    match compiler.compile_jsx(jsx_code) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("编译失败: {}", e)),
    }
}
