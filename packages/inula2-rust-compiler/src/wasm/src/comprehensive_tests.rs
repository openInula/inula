//! comprehensive_tests.rs - 全面的编译器测试套件
//!
//! 这个模块包含了openInula 2.0 Rust编译器的全面测试用例，
//! 涵盖所有主要功能模块和边界情况。

use serde_json::json;
use std::time::Instant;
use wasm_bindgen::prelude::*;

// 导入我们的编译器模块
use crate::error_handler::{CompilerError, CompilerPhase, ErrorSeverity};
#[cfg(feature = "jsx_impl")]
use crate::jsx_parser::{JsxParser, ViewParserConfig};
use crate::InulaCompiler;
#[cfg(not(feature = "jsx_impl"))]
use crate::{JsxParser, ViewParserConfig};

/// 测试结果结构
#[derive(Debug, Clone)]
pub struct ComprehensiveTestResult {
    pub test_name: String,
    pub category: String,
    pub success: bool,
    pub compile_time_ms: f64,
    pub output_size: usize,
    pub error_message: Option<String>,
    pub details: Option<String>,
}

/// 测试套件结构
#[derive(Debug)]
pub struct TestSuite {
    pub name: String,
    pub tests: Vec<ComprehensiveTestResult>,
    pub total_time: f64,
    pub success_count: usize,
    pub failure_count: usize,
}

impl TestSuite {
    pub fn new(name: String) -> Self {
        Self {
            name,
            tests: Vec::new(),
            total_time: 0.0,
            success_count: 0,
            failure_count: 0,
        }
    }

    pub fn add_test(&mut self, result: ComprehensiveTestResult) {
        self.total_time += result.compile_time_ms;
        if result.success {
            self.success_count += 1;
        } else {
            self.failure_count += 1;
        }
        self.tests.push(result);
    }

    pub fn success_rate(&self) -> f64 {
        if self.tests.is_empty() {
            0.0
        } else {
            (self.success_count as f64 / self.tests.len() as f64) * 100.0
        }
    }
}

/// 运行全面的编译器测试
#[wasm_bindgen]
pub fn run_comprehensive_tests() -> String {
    let mut all_suites = Vec::new();

    // 1. JSX解析器测试
    all_suites.push(run_jsx_parser_tests());

    // 2. 编译器核心功能测试
    all_suites.push(run_compiler_core_tests());

    // 3. 错误处理测试
    all_suites.push(run_error_handling_tests());

    // 4. 性能测试
    all_suites.push(run_performance_tests());

    // 5. 边界情况测试
    all_suites.push(run_edge_case_tests());

    // 6. 集成测试
    all_suites.push(run_integration_tests());

    // 生成测试报告
    generate_test_report(&all_suites)
}

/// JSX解析器测试
fn run_jsx_parser_tests() -> TestSuite {
    let mut suite = TestSuite::new("JSX解析器测试".to_string());

    let test_cases = vec![
        // 基本JSX元素
        ("简单HTML元素", "basic_html", r#"<div>Hello World</div>"#),
        (
            "带属性的HTML元素",
            "html_with_attrs",
            r#"<div className="container" id="main">Content</div>"#,
        ),
        (
            "自闭合标签",
            "self_closing",
            r#"<img src="image.jpg" alt="Image" />"#,
        ),
        (
            "嵌套元素",
            "nested_elements",
            r#"<div><h1>Title</h1><p>Paragraph</p></div>"#,
        ),
        // JSX表达式
        ("简单表达式", "simple_expression", r#"<div>{name}</div>"#),
        (
            "复杂表达式",
            "complex_expression",
            r#"<div>{user.name + ' ' + user.surname}</div>"#,
        ),
        (
            "条件表达式",
            "conditional_expression",
            r#"<div>{isVisible ? 'Visible' : 'Hidden'}</div>"#,
        ),
        (
            "数组表达式",
            "array_expression",
            r#"<div>{items.map(item => <span key={item.id}>{item.name}</span>)}</div>"#,
        ),
        // JSX片段
        ("JSX片段", "jsx_fragment", r#"<>Hello World</>"#),
        (
            "带key的片段",
            "fragment_with_key",
            r#"<React.Fragment key="fragment">Content</React.Fragment>"#,
        ),
        // 组件
        (
            "函数组件",
            "function_component",
            r#"<MyComponent prop1="value1" prop2={value2} />"#,
        ),
        ("类组件", "class_component", r#"<MyClassComponent />"#),
        (
            "嵌套组件",
            "nested_components",
            r#"<Parent><Child prop="value" /></Parent>"#,
        ),
        // 事件处理
        (
            "点击事件",
            "click_event",
            r#"<button onClick={handleClick}>Click me</button>"#,
        ),
        (
            "表单事件",
            "form_event",
            r#"<input onChange={handleChange} onFocus={handleFocus} />"#,
        ),
        // 条件渲染
        (
            "条件渲染",
            "conditional_rendering",
            r#"<div>{isLoggedIn ? <UserProfile /> : <LoginForm />}</div>"#,
        ),
        (
            "逻辑与渲染",
            "logical_and",
            r#"<div>{isVisible && <Modal />}</div>"#,
        ),
        // 列表渲染
        (
            "列表渲染",
            "list_rendering",
            r#"<ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>"#,
        ),
        (
            "带索引的列表",
            "indexed_list",
            r#"<ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>"#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_jsx_parser(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 编译器核心功能测试
fn run_compiler_core_tests() -> TestSuite {
    let mut suite = TestSuite::new("编译器核心功能测试".to_string());

    let test_cases = vec![
        // 基本编译
        (
            "简单组件编译",
            "basic_compilation",
            r#"function App() { return <div>Hello</div>; }"#,
        ),
        (
            "带状态的组件",
            "stateful_component",
            r#"function Counter() { const [count, setCount] = useState(0); return <div>{count}</div>; }"#,
        ),
        (
            "带效果的组件",
            "effectful_component",
            r#"function DataLoader() { useEffect(() => {}, []); return <div>Loading...</div>; }"#,
        ),
        // 复杂组件
        (
            "复杂嵌套组件",
            "complex_nested",
            r#"
            function UserDashboard({ user }) {
                return (
                    <div className="dashboard">
                        <header>
                            <h1>Welcome, {user.name}</h1>
                        </header>
                        <main>
                            <UserProfile user={user} />
                            <UserSettings />
                        </main>
                    </div>
                );
            }
        "#,
        ),
        // 模板和优化
        (
            "模板组件",
            "template_component",
            r#"
            function ProductCard({ product }) {
                return (
                    <div className="product-card">
                        <img src={product.image} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <button onClick={() => addToCart(product.id)}>
                            Add to Cart
                        </button>
                    </div>
                );
            }
        "#,
        ),
        // 响应式组件
        (
            "响应式组件",
            "reactive_component",
            r#"
            function ShoppingCart() {
                const [items, setItems] = useState([]);
                const [total, setTotal] = useState(0);
                
                useEffect(() => {
                    setTotal(items.reduce((sum, item) => sum + item.price, 0));
                }, [items]);
                
                return (
                    <div>
                        <h2>Shopping Cart</h2>
                        <p>Total: ${total}</p>
                        {items.map(item => <CartItem key={item.id} item={item} />)}
                    </div>
                );
            }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_compiler_core(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 错误处理测试
fn run_error_handling_tests() -> TestSuite {
    let mut suite = TestSuite::new("错误处理测试".to_string());

    let very_long_input = "<div>".repeat(10000) + "</div>";
    let deep_nesting = format!(
        "{}{}{}",
        "<div>".repeat(1000),
        "Content",
        "</div>".repeat(1000)
    );

    let test_cases = vec![
        // 语法错误
        ("未闭合的标签", "unclosed_tag", r#"<div>Hello World"#),
        (
            "不匹配的标签",
            "mismatched_tags",
            r#"<div><span>Hello</div></span>"#,
        ),
        (
            "无效的JSX语法",
            "invalid_jsx",
            r#"<div>{unclosed expression"#,
        ),
        // 语义错误
        (
            "未定义的变量",
            "undefined_variable",
            r#"<div>{undefinedVariable}</div>"#,
        ),
        (
            "类型错误",
            "type_error",
            r#"<div>{user.name.toUpperCase()}</div>"#,
        ),
        // 边界情况
        ("空输入", "empty_input", ""),
        ("只有空白", "whitespace_only", "   \n\t   "),
        (
            "无效字符",
            "invalid_characters",
            "<div>Hello\x00World</div>",
        ),
        // 大型输入
        ("超长输入", "very_long_input", &very_long_input),
        ("深度嵌套", "deep_nesting", &deep_nesting),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_error_handling(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 性能测试
fn run_performance_tests() -> TestSuite {
    let mut suite = TestSuite::new("性能测试".to_string());

    let medium = generate_medium_jsx();
    let large = generate_large_jsx();
    let batch = generate_batch_jsx();
    let test_cases = vec![
        ("小文件编译", "small_file", r#"<div>Hello</div>"#),
        ("中等文件编译", "medium_file", &medium),
        ("大文件编译", "large_file", &large),
        ("批量编译", "batch_compilation", &batch),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_performance(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 边界情况测试
fn run_edge_case_tests() -> TestSuite {
    let mut suite = TestSuite::new("边界情况测试".to_string());

    let test_cases = vec![
        ("最小JSX", "minimal_jsx", r#"<a/>"#),
        ("只有文本", "text_only", r#"Hello World"#),
        ("只有注释", "comment_only", r#"/* Comment */"#),
        (
            "特殊字符",
            "special_characters",
            r#"<div>Hello &lt;World&gt;</div>"#,
        ),
        ("Unicode字符", "unicode_chars", r#"<div>你好世界 🌍</div>"#),
        (
            "零宽字符",
            "zero_width_chars",
            r#"<div>Hello\u200BWorld</div>"#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_edge_cases(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 集成测试
fn run_integration_tests() -> TestSuite {
    let mut suite = TestSuite::new("集成测试".to_string());

    let full = generate_full_app();
    let multi = generate_multi_component_app();
    let state = generate_state_management_app();
    let test_cases = vec![
        ("完整应用", "full_app", &full),
        ("多组件应用", "multi_component_app", &multi),
        ("状态管理应用", "state_management_app", &state),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_integration(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 测试JSX解析器
fn test_jsx_parser(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let parser = JsxParser::new();
    let result = parser.parse(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    match result {
        Ok(view_units) => ComprehensiveTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: true,
            compile_time_ms: compile_time,
            output_size: view_units.len(),
            error_message: None,
            details: Some(format!("解析了 {} 个视图单元", view_units.len())),
        },
        Err(error) => ComprehensiveTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            compile_time_ms: compile_time,
            output_size: 0,
            error_message: Some(error.to_string()),
            details: None,
        },
    }
}

/// 测试编译器核心功能
fn test_compiler_core(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let mut compiler = InulaCompiler::new();
    let result = compiler.compile_jsx(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    match result {
        Ok(output) => {
            let output_str = output.as_string().unwrap_or_default();
            ComprehensiveTestResult {
                test_name: name.to_string(),
                category: category.to_string(),
                success: true,
                compile_time_ms: compile_time,
                output_size: output_str.len(),
                error_message: None,
                details: Some(format!("生成了 {} 字节的代码", output_str.len())),
            }
        }
        Err(error) => ComprehensiveTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            compile_time_ms: compile_time,
            output_size: 0,
            error_message: Some(error.as_string().unwrap_or_default()),
            details: None,
        },
    }
}

/// 测试错误处理
fn test_error_handling(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let mut compiler = InulaCompiler::new();
    let result = compiler.compile_jsx(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    // 对于错误处理测试，我们期望某些输入会失败
    let should_fail = matches!(
        category,
        "unclosed_tag"
            | "mismatched_tags"
            | "invalid_jsx"
            | "undefined_variable"
            | "type_error"
            | "empty_input"
            | "whitespace_only"
            | "invalid_characters"
    );

    match result {
        Ok(_) => {
            if should_fail {
                ComprehensiveTestResult {
                    test_name: name.to_string(),
                    category: category.to_string(),
                    success: false,
                    compile_time_ms: compile_time,
                    output_size: 0,
                    error_message: Some("期望失败但成功了".to_string()),
                    details: None,
                }
            } else {
                ComprehensiveTestResult {
                    test_name: name.to_string(),
                    category: category.to_string(),
                    success: true,
                    compile_time_ms: compile_time,
                    output_size: 0,
                    error_message: None,
                    details: Some("意外成功".to_string()),
                }
            }
        }
        Err(error) => {
            if should_fail {
                ComprehensiveTestResult {
                    test_name: name.to_string(),
                    category: category.to_string(),
                    success: true,
                    compile_time_ms: compile_time,
                    output_size: 0,
                    error_message: None,
                    details: Some("正确捕获了错误".to_string()),
                }
            } else {
                ComprehensiveTestResult {
                    test_name: name.to_string(),
                    category: category.to_string(),
                    success: false,
                    compile_time_ms: compile_time,
                    output_size: 0,
                    error_message: Some(error.as_string().unwrap_or_default()),
                    details: Some("意外失败".to_string()),
                }
            }
        }
    }
}

/// 测试性能
fn test_performance(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let mut compiler = InulaCompiler::new();
    let result = compiler.compile_jsx(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    // 性能基准
    let max_time = match category {
        "small_file" => 10.0,         // 10ms
        "medium_file" => 100.0,       // 100ms
        "large_file" => 1000.0,       // 1000ms
        "batch_compilation" => 500.0, // 500ms
        _ => 1000.0,
    };

    match result {
        Ok(output) => {
            let output_str = output.as_string().unwrap_or_default();
            let success = compile_time <= max_time;

            ComprehensiveTestResult {
                test_name: name.to_string(),
                category: category.to_string(),
                success,
                compile_time_ms: compile_time,
                output_size: output_str.len(),
                error_message: if success {
                    None
                } else {
                    Some(format!(
                        "编译时间超过基准: {:.2}ms > {:.2}ms",
                        compile_time, max_time
                    ))
                },
                details: Some(format!(
                    "编译时间: {:.2}ms, 基准: {:.2}ms",
                    compile_time, max_time
                )),
            }
        }
        Err(error) => ComprehensiveTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            compile_time_ms: compile_time,
            output_size: 0,
            error_message: Some(error.as_string().unwrap_or_default()),
            details: None,
        },
    }
}

/// 测试边界情况
fn test_edge_cases(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let mut compiler = InulaCompiler::new();
    let result = compiler.compile_jsx(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    match result {
        Ok(output) => {
            let output_str = output.as_string().unwrap_or_default();
            ComprehensiveTestResult {
                test_name: name.to_string(),
                category: category.to_string(),
                success: true,
                compile_time_ms: compile_time,
                output_size: output_str.len(),
                error_message: None,
                details: Some(format!("成功处理边界情况，输出 {} 字节", output_str.len())),
            }
        }
        Err(error) => ComprehensiveTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            compile_time_ms: compile_time,
            output_size: 0,
            error_message: Some(error.as_string().unwrap_or_default()),
            details: Some("边界情况处理失败".to_string()),
        },
    }
}

/// 测试集成功能
fn test_integration(name: &str, category: &str, jsx_code: &str) -> ComprehensiveTestResult {
    let start_time = Instant::now();

    let mut compiler = InulaCompiler::new();

    // 测试多个功能
    let parse_result = compiler.parse_jsx(jsx_code);
    let compile_result = compiler.compile_jsx(jsx_code);
    let analyze_result = compiler.analyze_reactivity(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    let all_success = parse_result.is_ok() && compile_result.is_ok() && analyze_result.is_ok();

    ComprehensiveTestResult {
        test_name: name.to_string(),
        category: category.to_string(),
        success: all_success,
        compile_time_ms: compile_time,
        output_size: if let Ok(output) = &compile_result {
            output.as_string().unwrap_or_default().len()
        } else {
            0
        },
        error_message: if all_success {
            None
        } else {
            Some("集成测试失败".to_string())
        },
        details: Some(format!(
            "解析: {}, 编译: {}, 分析: {}",
            if parse_result.is_ok() {
                "成功"
            } else {
                "失败"
            },
            if compile_result.is_ok() {
                "成功"
            } else {
                "失败"
            },
            if analyze_result.is_ok() {
                "成功"
            } else {
                "失败"
            }
        )),
    }
}

/// 生成测试报告
fn generate_test_report(suites: &[TestSuite]) -> String {
    let mut report = String::new();

    report.push_str("# 🧪 openInula 2.0 Rust编译器全面测试报告\n\n");
    report.push_str(&format!(
        "测试时间: {}\n\n",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs()
    ));

    let mut total_tests = 0;
    let mut total_success = 0;
    let mut total_time = 0.0;

    for suite in suites {
        report.push_str(&format!("## 📋 {}\n\n", suite.name));

        for test in &suite.tests {
            let status = if test.success { "✅" } else { "❌" };
            report.push_str(&format!(
                "- {} **{}** ({})\n",
                status, test.test_name, test.category
            ));

            if let Some(details) = &test.details {
                report.push_str(&format!("  - 详情: {}\n", details));
            }

            if let Some(error) = &test.error_message {
                report.push_str(&format!("  - 错误: {}\n", error));
            }

            report.push_str(&format!("  - 编译时间: {:.2}ms\n", test.compile_time_ms));
            report.push_str(&format!("  - 输出大小: {} bytes\n\n", test.output_size));
        }

        report.push_str(&format!("**测试套件统计:**\n"));
        report.push_str(&format!("- 总测试数: {}\n", suite.tests.len()));
        report.push_str(&format!("- 成功数: {}\n", suite.success_count));
        report.push_str(&format!("- 失败数: {}\n", suite.failure_count));
        report.push_str(&format!("- 成功率: {:.1}%\n", suite.success_rate()));
        report.push_str(&format!("- 总时间: {:.2}ms\n\n", suite.total_time));

        total_tests += suite.tests.len();
        total_success += suite.success_count;
        total_time += suite.total_time;
    }

    report.push_str("## 📊 总体统计\n\n");
    report.push_str(&format!("- **总测试数:** {}\n", total_tests));
    report.push_str(&format!("- **成功数:** {}\n", total_success));
    report.push_str(&format!("- **失败数:** {}\n", total_tests - total_success));
    report.push_str(&format!(
        "- **总成功率:** {:.1}%\n",
        (total_success as f64 / total_tests as f64) * 100.0
    ));
    report.push_str(&format!("- **总编译时间:** {:.2}ms\n", total_time));
    report.push_str(&format!(
        "- **平均编译时间:** {:.2}ms\n",
        total_time / total_tests as f64
    ));

    report
}

/// 生成中等大小的JSX代码
fn generate_medium_jsx() -> String {
    let mut jsx = String::new();
    jsx.push_str("function MediumComponent() {\n");
    jsx.push_str("    const [state, setState] = useState(0);\n");
    jsx.push_str("    \n");
    jsx.push_str("    useEffect(() => {\n");
    jsx.push_str("        console.log('Component mounted');\n");
    jsx.push_str("    }, []);\n");
    jsx.push_str("    \n");
    jsx.push_str("    return (\n");
    jsx.push_str("        <div className=\"medium-component\">\n");

    for i in 0..50 {
        jsx.push_str(&format!("            <div key={}>\n", i));
        jsx.push_str(&format!("                <h3>Section {}</h3>\n", i));
        jsx.push_str(&format!(
            "                <p>Content for section {}</p>\n",
            i
        ));
        jsx.push_str(&format!(
            "                <button onClick={{() => setState({})}}>Button {}</button>\n",
            i, i
        ));
        jsx.push_str("            </div>\n");
    }

    jsx.push_str("        </div>\n");
    jsx.push_str("    );\n");
    jsx.push_str("}\n");

    jsx
}

/// 生成大型JSX代码
fn generate_large_jsx() -> String {
    let mut jsx = String::new();
    jsx.push_str("function LargeComponent() {\n");
    jsx.push_str("    const [data, setData] = useState([]);\n");
    jsx.push_str("    const [loading, setLoading] = useState(false);\n");
    jsx.push_str("    \n");
    jsx.push_str("    useEffect(() => {\n");
    jsx.push_str("        setLoading(true);\n");
    jsx.push_str("        fetchData().then(result => {\n");
    jsx.push_str("            setData(result);\n");
    jsx.push_str("            setLoading(false);\n");
    jsx.push_str("        });\n");
    jsx.push_str("    }, []);\n");
    jsx.push_str("    \n");
    jsx.push_str("    return (\n");
    jsx.push_str("        <div className=\"large-component\">\n");

    for i in 0..200 {
        jsx.push_str(&format!("            <div key={} className=\"item\">\n", i));
        jsx.push_str(&format!("                <h2>Item {}</h2>\n", i));
        jsx.push_str(&format!(
            "                <p>Description for item {}</p>\n",
            i
        ));
        jsx.push_str(&format!("                <div className=\"actions\">\n"));
        jsx.push_str(&format!(
            "                    <button onClick={{() => handleEdit({})}}>Edit</button>\n",
            i
        ));
        jsx.push_str(&format!(
            "                    <button onClick={{() => handleDelete({})}}>Delete</button>\n",
            i
        ));
        jsx.push_str(&format!(
            "                    <button onClick={{() => handleView({})}}>View</button>\n",
            i
        ));
        jsx.push_str(&format!("                </div>\n"));
        jsx.push_str("            </div>\n");
    }

    jsx.push_str("        </div>\n");
    jsx.push_str("    );\n");
    jsx.push_str("}\n");

    jsx
}

/// 生成批量编译的JSX代码
fn generate_batch_jsx() -> String {
    let mut jsx = String::new();

    for i in 0..20 {
        jsx.push_str(&format!("function Component{}() {{\n", i));
        jsx.push_str(&format!("    return <div>Component {}</div>;\n", i));
        jsx.push_str("}\n\n");
    }

    jsx
}

/// 生成完整应用
fn generate_full_app() -> String {
    r#"
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchUser().then(userData => {
            setUser(userData);
            setLoading(false);
        });
    }, []);
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="app">
            <Header user={user} />
            <main>
                <Sidebar />
                <Content user={user} />
            </main>
            <Footer />
        </div>
    );
}

function Header({ user }) {
    return (
        <header className="header">
            <h1>My App</h1>
            {user ? <UserMenu user={user} /> : <LoginButton />}
        </header>
    );
}

function UserMenu({ user }) {
    return (
        <div className="user-menu">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

function LoginButton() {
    return <button onClick={handleLogin}>Login</button>;
}

function Sidebar() {
    return (
        <aside className="sidebar">
            <nav>
                <a href="/dashboard">Dashboard</a>
                <a href="/profile">Profile</a>
                <a href="/settings">Settings</a>
            </nav>
        </aside>
    );
}

function Content({ user }) {
    return (
        <div className="content">
            <h2>Dashboard</h2>
            <p>Welcome back, {user.name}!</p>
            <DashboardWidgets />
        </div>
    );
}

function DashboardWidgets() {
    return (
        <div className="widgets">
            <Widget title="Recent Activity" />
            <Widget title="Statistics" />
            <Widget title="Notifications" />
        </div>
    );
}

function Widget({ title }) {
    return (
        <div className="widget">
            <h3>{title}</h3>
            <p>Widget content</p>
        </div>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <p>&copy; 2024 My App. All rights reserved.</p>
        </footer>
    );
}
"#
    .to_string()
}

/// 生成多组件应用
fn generate_multi_component_app() -> String {
    r#"
function MultiComponentApp() {
    return (
        <div className="multi-component-app">
            <Navigation />
            <HeroSection />
            <FeatureGrid />
            <Testimonials />
            <ContactForm />
        </div>
    );
}

function Navigation() {
    return (
        <nav className="navigation">
            <Logo />
            <MenuItems />
            <UserActions />
        </nav>
    );
}

function Logo() {
    return <div className="logo">MyBrand</div>;
}

function MenuItems() {
    const items = ['Home', 'About', 'Services', 'Contact'];
    return (
        <ul className="menu-items">
            {items.map(item => <MenuItem key={item} name={item} />)}
        </ul>
    );
}

function MenuItem({ name }) {
    return <li><a href={`/${name.toLowerCase()}`}>{name}</a></li>;
}

function UserActions() {
    return (
        <div className="user-actions">
            <button>Sign In</button>
            <button>Sign Up</button>
        </div>
    );
}

function HeroSection() {
    return (
        <section className="hero">
            <h1>Welcome to Our Platform</h1>
            <p>Build amazing applications with our tools</p>
            <CallToAction />
        </section>
    );
}

function CallToAction() {
    return (
        <div className="cta">
            <button className="primary">Get Started</button>
            <button className="secondary">Learn More</button>
        </div>
    );
}

function FeatureGrid() {
    const features = [
        { title: 'Fast', description: 'Lightning fast performance' },
        { title: 'Secure', description: 'Enterprise-grade security' },
        { title: 'Scalable', description: 'Grows with your business' }
    ];
    
    return (
        <section className="features">
            <h2>Why Choose Us?</h2>
            <div className="feature-grid">
                {features.map(feature => <FeatureCard key={feature.title} feature={feature} />)}
            </div>
        </section>
    );
}

function FeatureCard({ feature }) {
    return (
        <div className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
        </div>
    );
}

function Testimonials() {
    const testimonials = [
        { name: 'John Doe', quote: 'Amazing product!' },
        { name: 'Jane Smith', quote: 'Changed our workflow completely.' }
    ];
    
    return (
        <section className="testimonials">
            <h2>What Our Customers Say</h2>
            {testimonials.map(testimonial => <Testimonial key={testimonial.name} testimonial={testimonial} />)}
        </section>
    );
}

function Testimonial({ testimonial }) {
    return (
        <div className="testimonial">
            <p>"{testimonial.quote}"</p>
            <cite>- {testimonial.name}</cite>
        </div>
    );
}

function ContactForm() {
    return (
        <section className="contact">
            <h2>Get in Touch</h2>
            <form>
                <input type="text" placeholder="Name" />
                <input type="email" placeholder="Email" />
                <textarea placeholder="Message"></textarea>
                <button type="submit">Send Message</button>
            </form>
        </section>
    );
}
"#.to_string()
}

/// 生成状态管理应用
fn generate_state_management_app() -> String {
    r#"
function StateManagementApp() {
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState('all');
    const [newTodo, setNewTodo] = useState('');
    
    const addTodo = (text) => {
        const todo = {
            id: Date.now(),
            text,
            completed: false,
            createdAt: new Date()
        };
        setTodos(prev => [...prev, todo]);
    };
    
    const toggleTodo = (id) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    const deleteTodo = (id) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };
    
    const filteredTodos = todos.filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
    });
    
    return (
        <div className="todo-app">
            <TodoHeader />
            <TodoInput 
                value={newTodo}
                onChange={setNewTodo}
                onSubmit={() => {
                    if (newTodo.trim()) {
                        addTodo(newTodo.trim());
                        setNewTodo('');
                    }
                }}
            />
            <TodoFilters filter={filter} onFilterChange={setFilter} />
            <TodoList 
                todos={filteredTodos}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
            />
            <TodoStats todos={todos} />
        </div>
    );
}

function TodoHeader() {
    return (
        <header className="todo-header">
            <h1>Todo App</h1>
            <p>Manage your tasks efficiently</p>
        </header>
    );
}

function TodoInput({ value, onChange, onSubmit }) {
    return (
        <form className="todo-input" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Add a new todo..."
            />
            <button type="submit">Add</button>
        </form>
    );
}

function TodoFilters({ filter, onFilterChange }) {
    const filters = [
        { key: 'all', label: 'All' },
        { key: 'active', label: 'Active' },
        { key: 'completed', label: 'Completed' }
    ];
    
    return (
        <div className="todo-filters">
            {filters.map(f => (
                <button
                    key={f.key}
                    className={filter === f.key ? 'active' : ''}
                    onClick={() => onFilterChange(f.key)}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}

function TodoList({ todos, onToggle, onDelete }) {
    if (todos.length === 0) {
        return <div className="empty-state">No todos found</div>;
    }
    
    return (
        <ul className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}

function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
            <button
                className="delete-btn"
                onClick={() => onDelete(todo.id)}
            >
                Delete
            </button>
        </li>
    );
}

function TodoStats({ todos }) {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    
    return (
        <div className="todo-stats">
            <div className="stat">
                <span className="stat-label">Total:</span>
                <span className="stat-value">{total}</span>
            </div>
            <div className="stat">
                <span className="stat-label">Active:</span>
                <span className="stat-value">{active}</span>
            </div>
            <div className="stat">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">{completed}</span>
            </div>
        </div>
    );
}
"#
    .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_comprehensive_tests() {
        let report = run_comprehensive_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器全面测试报告"));
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_jsx_parser_tests() {
        let suite = run_jsx_parser_tests();
        assert!(!suite.tests.is_empty());
        assert!(suite.success_rate() > 0.0);
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_compiler_core_tests() {
        let suite = run_compiler_core_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_error_handling_tests() {
        let suite = run_error_handling_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_performance_tests() {
        let suite = run_performance_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_edge_case_tests() {
        let suite = run_edge_case_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_integration_tests() {
        let suite = run_integration_tests();
        assert!(!suite.tests.is_empty());
    }
}
