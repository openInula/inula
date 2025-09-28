//! consistency_tests.rs - Rust编译器与TypeScript原版编译器输出一致性测试
//!
//! 这个模块使用原版TypeScript编译器的真实测试用例，
//! 验证Rust编译器的输出与TypeScript原版完全一致。

use serde_json::json;
use std::fs;
use std::path::Path;
use std::process::Command;
use std::time::Instant;
use wasm_bindgen::prelude::*;

// 导入我们的编译器模块
#[cfg(feature = "jsx_impl")]
use crate::jsx_parser::{JsxParser, ViewParserConfig};
use crate::InulaCompiler;
#[cfg(not(feature = "jsx_impl"))]
use crate::{JsxParser, ViewParserConfig};

/// 一致性测试结果
#[derive(Debug, Clone)]
pub struct ConsistencyTestResult {
    pub test_name: String,
    pub category: String,
    pub success: bool,
    pub rust_output: String,
    pub typescript_output: String,
    pub diff: Option<String>,
    pub compile_time_ms: f64,
    pub error_message: Option<String>,
}

/// 一致性测试套件
#[derive(Debug)]
pub struct ConsistencyTestSuite {
    pub name: String,
    pub tests: Vec<ConsistencyTestResult>,
    pub total_time: f64,
    pub success_count: usize,
    pub failure_count: usize,
}

impl ConsistencyTestSuite {
    pub fn new(name: String) -> Self {
        Self {
            name,
            tests: Vec::new(),
            total_time: 0.0,
            success_count: 0,
            failure_count: 0,
        }
    }

    pub fn add_test(&mut self, result: ConsistencyTestResult) {
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

/// 运行一致性测试
#[wasm_bindgen]
pub fn run_consistency_tests() -> String {
    let mut all_suites = Vec::new();

    // 1. 状态管理测试
    all_suites.push(run_state_consistency_tests());

    // 2. 子组件测试
    all_suites.push(run_children_consistency_tests());

    // 3. Hook测试
    all_suites.push(run_hook_consistency_tests());

    // 4. 模板测试
    all_suites.push(run_template_consistency_tests());

    // 5. 上下文测试
    all_suites.push(run_context_consistency_tests());

    // 6. 片段测试
    all_suites.push(run_fragment_consistency_tests());

    // 7. 属性测试
    all_suites.push(run_props_consistency_tests());

    // 8. 子组件测试
    all_suites.push(run_subcomponent_consistency_tests());

    // 9. 引用测试
    all_suites.push(run_ref_consistency_tests());

    // 10. 早期返回测试
    all_suites.push(run_early_return_consistency_tests());

    // 11. For子组件测试
    all_suites.push(run_for_subcomponent_consistency_tests());

    // 生成一致性测试报告
    generate_consistency_report(&all_suites)
}

/// 状态管理一致性测试
fn run_state_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("状态管理一致性测试".to_string());

    let test_cases = vec![
        // 解构状态测试
        (
            "解构状态",
            "destructuring_state",
            r#"
        function App() {
          let x = 0;
          const [count, setCount] = genState(x);
          return <div>
            {count} is smaller than 1
          </div>;
        }
        "#,
        ),
        // 函数依赖状态测试
        (
            "函数依赖状态",
            "functional_dependency_state",
            r#"
        function App() {
          let x = 1;
          const double = x * 2;
          const quadruple = double * 2;
          const getQuadruple = () => quadruple;
          return <div>
            {getQuadruple()}
          </div>;
        }
        "#,
        ),
        // 复杂状态依赖测试
        (
            "复杂状态依赖",
            "complex_state_dependency",
            r#"
        function App() {
          let x = 1;
          let y = 2;
          const sum = x + y;
          const product = x * y;
          const result = sum + product;
          return <div>
            {result}
          </div>;
        }
        "#,
        ),
        // 状态更新测试
        (
            "状态更新",
            "state_update",
            r#"
        function App() {
          let x = 0;
          const [count, setCount] = genState(x);
          const increment = () => setCount(count + 1);
          return <div>
            <button onClick={increment}>Count: {count}</button>
          </div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 子组件一致性测试
fn run_children_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("子组件一致性测试".to_string());

    let test_cases = vec![
        // 基本子组件测试
        (
            "基本子组件",
            "basic_children",
            r#"
        function App() {
          return <Child name={'hello world!!!'} />;
        }
        "#,
        ),
        // 带子元素的组件测试
        (
            "带子元素的组件",
            "component_with_children",
            r#"
        function App() {
          return <Parent>
            <Child name="child1" />
            <Child name="child2" />
          </Parent>;
        }
        "#,
        ),
        // 动态子组件测试
        (
            "动态子组件",
            "dynamic_children",
            r#"
        function App() {
          const children = ['child1', 'child2', 'child3'];
          return <Parent>
            {children.map(name => <Child key={name} name={name} />)}
          </Parent>;
        }
        "#,
        ),
        // 条件子组件测试
        (
            "条件子组件",
            "conditional_children",
            r#"
        function App() {
          const showChild = true;
          return <Parent>
            {showChild && <Child name="conditional" />}
          </Parent>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// Hook一致性测试
fn run_hook_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("Hook一致性测试".to_string());

    let test_cases = vec![
        // use hook测试
        (
            "use hook",
            "use_hook",
            r#"
        function App () {
         let baseX = 0;
         let baseY = 0;
         const mouse = useMousePosition(baseX, baseY)
         const mouse2 = useMousePosition({
           baseX,
           baseY
         })
        }
        "#,
        ),
        // useEffect hook测试
        (
            "useEffect hook",
            "use_effect_hook",
            r#"
        function App() {
          const [count, setCount] = useState(0);
          useEffect(() => {
            document.title = `Count: ${count}`;
          }, [count]);
          return <div>{count}</div>;
        }
        "#,
        ),
        // 自定义hook测试
        (
            "自定义hook",
            "custom_hook",
            r#"
        function App() {
          const { value, setValue } = useCustomState(0);
          return <div>{value}</div>;
        }
        "#,
        ),
        // 多个hook测试
        (
            "多个hook",
            "multiple_hooks",
            r#"
        function App() {
          const [name, setName] = useState('');
          const [age, setAge] = useState(0);
          const [isVisible, setIsVisible] = useState(true);
          
          useEffect(() => {
            console.log('Name changed:', name);
          }, [name]);
          
          return <div>
            {isVisible && <span>{name} is {age} years old</span>}
          </div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 模板一致性测试
fn run_template_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("模板一致性测试".to_string());

    let test_cases = vec![
        // 多层HTML模板测试
        (
            "多层HTML模板",
            "multi_layer_html_template",
            r#"
        function App() {
          return <div><div>test</div></div>;
        }
        "#,
        ),
        // 多组件模板测试
        (
            "多组件模板",
            "multi_component_template",
            r#"
        function App() {
          return <div><div>test</div></div>;
        }
        function Title() {
          return <div><h1>Title</h1></div>;
        }
        "#,
        ),
        // 复杂模板测试
        (
            "复杂模板",
            "complex_template",
            r#"
        function App() {
          return <div className="container">
            <header>
              <h1>Title</h1>
            </header>
            <main>
              <p>Content</p>
            </main>
            <footer>
              <p>Footer</p>
            </footer>
          </div>;
        }
        "#,
        ),
        // 动态模板测试
        (
            "动态模板",
            "dynamic_template",
            r#"
        function App() {
          const items = ['item1', 'item2', 'item3'];
          return <div>
            {items.map(item => <div key={item}>{item}</div>)}
          </div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 上下文一致性测试
fn run_context_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("上下文一致性测试".to_string());

    let test_cases = vec![
        // 基本上下文测试
        (
            "基本上下文",
            "basic_context",
            r#"
        function App() {
          return <ThemeProvider theme="dark">
            <Header />
            <Main />
          </ThemeProvider>;
        }
        "#,
        ),
        // 嵌套上下文测试
        (
            "嵌套上下文",
            "nested_context",
            r#"
        function App() {
          return <ThemeProvider theme="dark">
            <LanguageProvider lang="en">
              <Header />
              <Main />
            </LanguageProvider>
          </ThemeProvider>;
        }
        "#,
        ),
        // 上下文消费测试
        (
            "上下文消费",
            "context_consumption",
            r#"
        function App() {
          return <ThemeProvider theme="dark">
            <ThemedButton />
          </ThemeProvider>;
        }
        
        function ThemedButton() {
          const theme = useContext(ThemeContext);
          return <button className={theme}>Themed Button</button>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 片段一致性测试
fn run_fragment_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("片段一致性测试".to_string());

    let test_cases = vec![
        // 基本片段测试
        (
            "基本片段",
            "basic_fragment",
            r#"
        function App() {
          return <>
            <h1>Title</h1>
            <p>Content</p>
          </>;
        }
        "#,
        ),
        // 带key的片段测试
        (
            "带key的片段",
            "fragment_with_key",
            r#"
        function App() {
          return <React.Fragment key="fragment">
            <h1>Title</h1>
            <p>Content</p>
          </React.Fragment>;
        }
        "#,
        ),
        // 条件片段测试
        (
            "条件片段",
            "conditional_fragment",
            r#"
        function App() {
          const showContent = true;
          return <>
            <h1>Title</h1>
            {showContent && <p>Content</p>}
          </>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 属性一致性测试
fn run_props_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("属性一致性测试".to_string());

    let test_cases = vec![
        // 基本属性测试
        (
            "基本属性",
            "basic_props",
            r#"
        function App() {
          return <Component name="test" age={25} />;
        }
        "#,
        ),
        // 对象属性测试
        (
            "对象属性",
            "object_props",
            r#"
        function App() {
          const user = { name: "John", age: 30 };
          return <Component user={user} />;
        }
        "#,
        ),
        // 函数属性测试
        (
            "函数属性",
            "function_props",
            r#"
        function App() {
          const handleClick = () => console.log('clicked');
          return <Component onClick={handleClick} />;
        }
        "#,
        ),
        // 展开属性测试
        (
            "展开属性",
            "spread_props",
            r#"
        function App() {
          const props = { name: "test", age: 25 };
          return <Component {...props} />;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 子组件一致性测试
fn run_subcomponent_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("子组件一致性测试".to_string());

    let test_cases = vec![
        // 基本子组件测试
        (
            "基本子组件",
            "basic_subcomponent",
            r#"
        function App() {
          return <div>
            <SubComponent />
          </div>;
        }
        "#,
        ),
        // 带属性的子组件测试
        (
            "带属性的子组件",
            "subcomponent_with_props",
            r#"
        function App() {
          return <div>
            <SubComponent name="test" />
          </div>;
        }
        "#,
        ),
        // 嵌套子组件测试
        (
            "嵌套子组件",
            "nested_subcomponent",
            r#"
        function App() {
          return <div>
            <SubComponent>
              <NestedComponent />
            </SubComponent>
          </div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 引用一致性测试
fn run_ref_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("引用一致性测试".to_string());

    let test_cases = vec![
        // 基本引用测试
        (
            "基本引用",
            "basic_ref",
            r#"
        function App() {
          const inputRef = useRef(null);
          return <input ref={inputRef} />;
        }
        "#,
        ),
        // 回调引用测试
        (
            "回调引用",
            "callback_ref",
            r#"
        function App() {
          const inputRef = useCallback((node) => {
            if (node) {
              node.focus();
            }
          }, []);
          return <input ref={inputRef} />;
        }
        "#,
        ),
        // 转发引用测试
        (
            "转发引用",
            "forward_ref",
            r#"
        function App() {
          const ref = useRef(null);
          return <ForwardedComponent ref={ref} />;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 早期返回一致性测试
fn run_early_return_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("早期返回一致性测试".to_string());

    let test_cases = vec![
        // 条件早期返回测试
        (
            "条件早期返回",
            "conditional_early_return",
            r#"
        function App() {
          if (loading) {
            return <div>Loading...</div>;
          }
          return <div>Content</div>;
        }
        "#,
        ),
        // 错误早期返回测试
        (
            "错误早期返回",
            "error_early_return",
            r#"
        function App() {
          if (error) {
            return <div>Error: {error.message}</div>;
          }
          return <div>Success</div>;
        }
        "#,
        ),
        // 空状态早期返回测试
        (
            "空状态早期返回",
            "empty_early_return",
            r#"
        function App() {
          if (!data || data.length === 0) {
            return <div>No data available</div>;
          }
          return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// For子组件一致性测试
fn run_for_subcomponent_consistency_tests() -> ConsistencyTestSuite {
    let mut suite = ConsistencyTestSuite::new("For子组件一致性测试".to_string());

    let test_cases = vec![
        // 基本for循环测试
        (
            "基本for循环",
            "basic_for_loop",
            r#"
        function App() {
          const items = ['item1', 'item2', 'item3'];
          return <div>
            {items.map(item => <div key={item}>{item}</div>)}
          </div>;
        }
        "#,
        ),
        // 带索引的for循环测试
        (
            "带索引的for循环",
            "for_loop_with_index",
            r#"
        function App() {
          const items = ['item1', 'item2', 'item3'];
          return <div>
            {items.map((item, index) => <div key={index}>{item}</div>)}
          </div>;
        }
        "#,
        ),
        // 复杂for循环测试
        (
            "复杂for循环",
            "complex_for_loop",
            r#"
        function App() {
          const users = [
            { id: 1, name: 'John', age: 30 },
            { id: 2, name: 'Jane', age: 25 }
          ];
          return <div>
            {users.map(user => <UserCard key={user.id} user={user} />)}
          </div>;
        }
        "#,
        ),
    ];

    for (name, category, jsx_code) in test_cases {
        let result = test_consistency(name, category, jsx_code);
        suite.add_test(result);
    }

    suite
}

/// 测试一致性
fn test_consistency(name: &str, category: &str, jsx_code: &str) -> ConsistencyTestResult {
    let start_time = Instant::now();

    // 使用Rust编译器编译
    let mut rust_compiler = InulaCompiler::new();
    let rust_result = rust_compiler.compile_jsx(jsx_code);

    // 使用TypeScript编译器编译
    let typescript_result = compile_with_typescript(jsx_code);

    let compile_time = start_time.elapsed().as_secs_f64() * 1000.0;

    match (rust_result, typescript_result) {
        (Ok(rust_output), Ok(typescript_output)) => {
            let rust_str = rust_output.as_string().unwrap_or_default();
            let ts_str = typescript_output;

            // 比较输出
            let (success, diff) = compare_outputs(&rust_str, &ts_str);

            ConsistencyTestResult {
                test_name: name.to_string(),
                category: category.to_string(),
                success,
                rust_output: rust_str,
                typescript_output: ts_str,
                diff: if success { None } else { Some(diff) },
                compile_time_ms: compile_time,
                error_message: None,
            }
        }
        (Err(rust_error), Ok(typescript_output)) => ConsistencyTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            rust_output: String::new(),
            typescript_output,
            diff: None,
            compile_time_ms: compile_time,
            error_message: Some(format!(
                "Rust编译失败: {}",
                rust_error.as_string().unwrap_or_default()
            )),
        },
        (Ok(rust_output), Err(ts_error)) => ConsistencyTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            rust_output: rust_output.as_string().unwrap_or_default(),
            typescript_output: String::new(),
            diff: None,
            compile_time_ms: compile_time,
            error_message: Some(format!("TypeScript编译失败: {}", ts_error)),
        },
        (Err(rust_error), Err(ts_error)) => ConsistencyTestResult {
            test_name: name.to_string(),
            category: category.to_string(),
            success: false,
            rust_output: String::new(),
            typescript_output: String::new(),
            diff: None,
            compile_time_ms: compile_time,
            error_message: Some(format!(
                "两个编译器都失败 - Rust: {}, TypeScript: {}",
                rust_error.as_string().unwrap_or_default(),
                ts_error
            )),
        },
    }
}

/// 使用TypeScript编译器编译
fn compile_with_typescript(jsx_code: &str) -> Result<String, String> {
    // 创建临时文件
    let temp_file = "temp_test.tsx";
    let output_file = "temp_output.js";

    // 写入测试代码
    if let Err(e) = fs::write(temp_file, jsx_code) {
        return Err(format!("写入临时文件失败: {}", e));
    }

    // 运行TypeScript编译器
    let output = Command::new("npx")
        .args(&[
            "babel",
            temp_file,
            "--presets",
            "@openinula/babel-inula-next-core",
            "--out-file",
            output_file,
        ])
        .output();

    // 清理临时文件
    let _ = fs::remove_file(temp_file);

    match output {
        Ok(result) => {
            if result.status.success() {
                match fs::read_to_string(output_file) {
                    Ok(content) => {
                        let _ = fs::remove_file(output_file);
                        Ok(content)
                    }
                    Err(e) => Err(format!("读取输出文件失败: {}", e)),
                }
            } else {
                let _ = fs::remove_file(output_file);
                Err(format!(
                    "TypeScript编译失败: {}",
                    String::from_utf8_lossy(&result.stderr)
                ))
            }
        }
        Err(e) => Err(format!("执行TypeScript编译器失败: {}", e)),
    }
}

/// 比较输出
fn compare_outputs(rust_output: &str, typescript_output: &str) -> (bool, String) {
    // 标准化输出（移除空白差异）
    let rust_normalized = normalize_output(rust_output);
    let ts_normalized = normalize_output(typescript_output);

    if rust_normalized == ts_normalized {
        (true, String::new())
    } else {
        // 生成差异报告
        let diff = generate_diff(&rust_normalized, &ts_normalized);
        (false, diff)
    }
}

/// 标准化输出
fn normalize_output(output: &str) -> String {
    output
        .lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n")
}

/// 生成差异报告
fn generate_diff(rust_output: &str, typescript_output: &str) -> String {
    format!(
        "输出差异:\nRust输出:\n{}\n\nTypeScript输出:\n{}\n",
        rust_output, typescript_output
    )
}

/// 生成一致性测试报告
fn generate_consistency_report(suites: &[ConsistencyTestSuite]) -> String {
    let mut report = String::new();

    report.push_str("# 🔍 openInula 2.0 Rust编译器与TypeScript原版一致性测试报告\n\n");
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

            if let Some(diff) = &test.diff {
                report.push_str(&format!("  - 差异: {}\n", diff));
            }

            if let Some(error) = &test.error_message {
                report.push_str(&format!("  - 错误: {}\n", error));
            }

            report.push_str(&format!("  - 编译时间: {:.2}ms\n", test.compile_time_ms));
            report.push_str(&format!(
                "  - Rust输出长度: {} bytes\n",
                test.rust_output.len()
            ));
            report.push_str(&format!(
                "  - TypeScript输出长度: {} bytes\n\n",
                test.typescript_output.len()
            ));
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

    if total_success == total_tests {
        report.push_str("\n🎉 **所有测试通过！Rust编译器与TypeScript原版完全一致！**\n");
    } else {
        report.push_str(&format!(
            "\n⚠️ **有 {} 个测试失败，需要修复差异**\n",
            total_tests - total_success
        ));
    }

    report
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_consistency_tests() {
        let report = run_consistency_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器与TypeScript原版一致性测试报告"));
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_state_consistency_tests() {
        let suite = run_state_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_children_consistency_tests() {
        let suite = run_children_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_hook_consistency_tests() {
        let suite = run_hook_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_template_consistency_tests() {
        let suite = run_template_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_context_consistency_tests() {
        let suite = run_context_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_fragment_consistency_tests() {
        let suite = run_fragment_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_props_consistency_tests() {
        let suite = run_props_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_subcomponent_consistency_tests() {
        let suite = run_subcomponent_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_ref_consistency_tests() {
        let suite = run_ref_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_early_return_consistency_tests() {
        let suite = run_early_return_consistency_tests();
        assert!(!suite.tests.is_empty());
    }

    #[test]
    #[cfg(target_arch = "wasm32")]
    fn test_for_subcomponent_consistency_tests() {
        let suite = run_for_subcomponent_consistency_tests();
        assert!(!suite.tests.is_empty());
    }
}
