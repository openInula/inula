//! test_runner.rs - 测试运行器
//!
//! 这个模块提供了一个简单的测试运行器，用于运行所有测试并生成报告。

use std::time::Instant;
use wasm_bindgen::prelude::*;

// 导入测试模块
use crate::comprehensive_tests;
use crate::consistency_tests;

/// 测试运行器
#[wasm_bindgen]
pub struct TestRunner {
    start_time: Instant,
}

#[wasm_bindgen]
impl TestRunner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            start_time: Instant::now(),
        }
    }

    /// 运行所有测试
    #[wasm_bindgen]
    pub fn run_all_tests(&self) -> String {
        let mut report = String::new();

        report.push_str("# 🚀 openInula 2.0 Rust编译器完整测试套件\n\n");
        report.push_str(&format!(
            "开始时间: {}\n\n",
            self.start_time.elapsed().as_secs()
        ));

        // 运行全面测试
        report.push_str("## 📋 运行全面测试...\n\n");
        let comprehensive_start = Instant::now();
        let comprehensive_report = comprehensive_tests::run_comprehensive_tests();
        let comprehensive_time = comprehensive_start.elapsed().as_secs_f64() * 1000.0;
        report.push_str(&comprehensive_report);
        report.push_str(&format!(
            "\n**全面测试完成，耗时: {:.2}ms**\n\n",
            comprehensive_time
        ));

        // 运行一致性测试
        report.push_str("## 🔍 运行一致性测试...\n\n");
        let consistency_start = Instant::now();
        let consistency_report = consistency_tests::run_consistency_tests();
        let consistency_time = consistency_start.elapsed().as_secs_f64() * 1000.0;
        report.push_str(&consistency_report);
        report.push_str(&format!(
            "\n**一致性测试完成，耗时: {:.2}ms**\n\n",
            consistency_time
        ));

        // 总结
        let total_time = self.start_time.elapsed().as_secs_f64() * 1000.0;
        report.push_str("## 📊 测试总结\n\n");
        report.push_str(&format!("- **总运行时间:** {:.2}ms\n", total_time));
        report.push_str(&format!(
            "- **全面测试时间:** {:.2}ms\n",
            comprehensive_time
        ));
        report.push_str(&format!(
            "- **一致性测试时间:** {:.2}ms\n",
            consistency_time
        ));
        report.push_str("\n🎉 **所有测试完成！**\n");

        report
    }

    /// 运行快速测试（只运行基本功能测试）
    #[wasm_bindgen]
    pub fn run_quick_tests(&self) -> String {
        let mut report = String::new();

        report.push_str("# ⚡ openInula 2.0 Rust编译器快速测试\n\n");
        report.push_str(&format!(
            "开始时间: {}\n\n",
            self.start_time.elapsed().as_secs()
        ));

        // 运行基本功能测试
        report.push_str("## 🧪 运行基本功能测试...\n\n");
        let start = Instant::now();

        // 测试基本JSX解析
        let mut compiler = crate::InulaCompiler::new();
        let test_jsx = r#"<div>Hello World</div>"#;

        match compiler.parse_jsx(test_jsx) {
            Ok(result) => {
                report.push_str("✅ 基本JSX解析测试通过\n");
                report.push_str(&format!(
                    "输出: {}\n",
                    result.as_string().unwrap_or_default()
                ));
            }
            Err(error) => {
                report.push_str(&format!(
                    "❌ 基本JSX解析测试失败: {}\n",
                    error.as_string().unwrap_or_default()
                ));
            }
        }

        // 测试JSX编译
        match compiler.compile_jsx(test_jsx) {
            Ok(result) => {
                report.push_str("✅ 基本JSX编译测试通过\n");
                report.push_str(&format!(
                    "输出: {}\n",
                    result.as_string().unwrap_or_default()
                ));
            }
            Err(error) => {
                report.push_str(&format!(
                    "❌ 基本JSX编译测试失败: {}\n",
                    error.as_string().unwrap_or_default()
                ));
            }
        }

        let test_time = start.elapsed().as_secs_f64() * 1000.0;
        report.push_str(&format!("\n**快速测试完成，耗时: {:.2}ms**\n", test_time));

        report
    }

    /// 运行性能测试
    #[wasm_bindgen]
    pub fn run_performance_tests(&self) -> String {
        let mut report = String::new();

        report.push_str("# ⚡ openInula 2.0 Rust编译器性能测试\n\n");
        report.push_str(&format!(
            "开始时间: {}\n\n",
            self.start_time.elapsed().as_secs()
        ));

        let mut compiler = crate::InulaCompiler::new();

        // 测试用例
        let large_case = generate_large_test_case();
        let test_cases = vec![
            ("小文件", r#"<div>Hello</div>"#),
            (
                "中等文件",
                r#"
                function App() {
                    const [count, setCount] = useState(0);
                    return (
                        <div>
                            <h1>Counter: {count}</h1>
                            <button onClick={() => setCount(count + 1)}>Increment</button>
                        </div>
                    );
                }
            "#,
            ),
            ("大文件", &large_case),
        ];

        for (name, jsx_code) in test_cases {
            report.push_str(&format!("## 📊 测试: {}\n\n", name));

            // 测试解析性能
            let parse_start = Instant::now();
            let parse_result = compiler.parse_jsx(jsx_code);
            let parse_time = parse_start.elapsed().as_secs_f64() * 1000.0;

            if parse_result.is_ok() {
                report.push_str(&format!("✅ 解析成功，耗时: {:.2}ms\n", parse_time));
            } else {
                report.push_str(&format!("❌ 解析失败，耗时: {:.2}ms\n", parse_time));
            }

            // 测试编译性能
            let compile_start = Instant::now();
            let compile_result = compiler.compile_jsx(jsx_code);
            let compile_time = compile_start.elapsed().as_secs_f64() * 1000.0;

            if compile_result.is_ok() {
                report.push_str(&format!("✅ 编译成功，耗时: {:.2}ms\n", compile_time));
            } else {
                report.push_str(&format!("❌ 编译失败，耗时: {:.2}ms\n", compile_time));
            }

            report.push_str(&format!(
                "**总耗时: {:.2}ms**\n\n",
                parse_time + compile_time
            ));
        }

        let total_time = self.start_time.elapsed().as_secs_f64() * 1000.0;
        report.push_str(&format!("## 📊 性能测试总结\n\n"));
        report.push_str(&format!("- **总运行时间:** {:.2}ms\n", total_time));
        report.push_str("\n🎉 **性能测试完成！**\n");

        report
    }
}

/// 生成大型测试用例
fn generate_large_test_case() -> String {
    let mut jsx = String::new();
    jsx.push_str("function LargeApp() {\n");
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
    jsx.push_str("        <div className=\"large-app\">\n");

    for i in 0..100 {
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
        jsx.push_str(&format!("                </div>\n"));
        jsx.push_str("            </div>\n");
    }

    jsx.push_str("        </div>\n");
    jsx.push_str("    );\n");
    jsx.push_str("}\n");

    jsx
}

/// 全局测试函数
#[wasm_bindgen]
pub fn create_test_runner() -> TestRunner {
    TestRunner::new()
}

#[wasm_bindgen]
pub fn run_all_tests() -> String {
    let runner = TestRunner::new();
    runner.run_all_tests()
}

#[wasm_bindgen]
pub fn run_quick_tests() -> String {
    let runner = TestRunner::new();
    runner.run_quick_tests()
}

#[wasm_bindgen]
pub fn run_performance_tests() -> String {
    let runner = TestRunner::new();
    runner.run_performance_tests()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_test_runner() {
        let runner = TestRunner::new();
        let report = runner.run_quick_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器快速测试"));
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_run_all_tests() {
        let report = run_all_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器完整测试套件"));
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_run_quick_tests() {
        let report = run_quick_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器快速测试"));
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_run_performance_tests() {
        let report = run_performance_tests();
        assert!(!report.is_empty());
        assert!(report.contains("openInula 2.0 Rust编译器性能测试"));
    }
}
