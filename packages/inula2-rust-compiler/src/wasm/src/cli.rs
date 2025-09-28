use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// CLI 配置结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CliConfig {
    /// 输入文件或目录
    pub input: String,
    /// 输出目录
    pub output: Option<String>,
    /// 是否压缩输出
    pub minify: Option<bool>,
    /// 是否生成 Source Map
    pub source_map: Option<bool>,
    /// 是否监听文件变化
    pub watch: Option<bool>,
    /// 线程数
    pub threads: Option<usize>,
    /// 日志级别
    pub log_level: Option<String>,
    /// 插件配置
    pub plugins: Option<Vec<String>>,
    /// 其他选项
    pub options: Option<HashMap<String, String>>,
}

impl Default for CliConfig {
    fn default() -> Self {
        Self {
            input: ".".to_string(),
            output: None,
            minify: Some(false),
            source_map: Some(true),
            watch: Some(false),
            threads: None,
            log_level: Some("info".to_string()),
            plugins: None,
            options: None,
        }
    }
}

/// CLI 参数解析器
pub struct CliParser {
    config: CliConfig,
}

impl CliParser {
    /// 创建新的 CLI 解析器
    pub fn new() -> Self {
        Self {
            config: CliConfig::default(),
        }
    }

    /// 解析命令行参数
    pub fn parse_args(&mut self, args: Vec<String>) -> Result<CliConfig, String> {
        let mut i = 0;
        let mut config = CliConfig::default();

        while i < args.len() {
            let arg = &args[i];

            match arg.as_str() {
                "-i" | "--input" => {
                    if i + 1 < args.len() {
                        config.input = args[i + 1].clone();
                        i += 2;
                    } else {
                        return Err("--input 需要指定输入路径".to_string());
                    }
                }
                "-o" | "--output" => {
                    if i + 1 < args.len() {
                        config.output = Some(args[i + 1].clone());
                        i += 2;
                    } else {
                        return Err("--output 需要指定输出路径".to_string());
                    }
                }
                "--minify" => {
                    config.minify = Some(true);
                    i += 1;
                }
                "--no-minify" => {
                    config.minify = Some(false);
                    i += 1;
                }
                "--source-map" => {
                    config.source_map = Some(true);
                    i += 1;
                }
                "--no-source-map" => {
                    config.source_map = Some(false);
                    i += 1;
                }
                "-w" | "--watch" => {
                    config.watch = Some(true);
                    i += 1;
                }
                "-t" | "--threads" => {
                    if i + 1 < args.len() {
                        match args[i + 1].parse::<usize>() {
                            Ok(threads) => {
                                config.threads = Some(threads);
                                i += 2;
                            }
                            Err(_) => return Err("--threads 需要指定有效的数字".to_string()),
                        }
                    } else {
                        return Err("--threads 需要指定线程数".to_string());
                    }
                }
                "-l" | "--log-level" => {
                    if i + 1 < args.len() {
                        config.log_level = Some(args[i + 1].clone());
                        i += 2;
                    } else {
                        return Err("--log-level 需要指定日志级别".to_string());
                    }
                }
                "--plugin" => {
                    if i + 1 < args.len() {
                        let mut plugins = config.plugins.unwrap_or_default();
                        plugins.push(args[i + 1].clone());
                        config.plugins = Some(plugins);
                        i += 2;
                    } else {
                        return Err("--plugin 需要指定插件名称".to_string());
                    }
                }
                "-h" | "--help" => {
                    return Err(self.get_help_text());
                }
                "-v" | "--version" => {
                    return Err("inula-compiler-rust v2.0.0".to_string());
                }
                _ => {
                    // 未知参数
                    return Err(format!("未知参数: {}", arg));
                }
            }
        }

        self.config = config.clone();
        Ok(config)
    }

    /// 从配置文件加载配置
    pub fn load_config_file(&mut self, config_path: &str) -> Result<CliConfig, String> {
        // 这里应该读取 JSON 或 TOML 配置文件
        // 为了演示，我们返回默认配置
        let config = CliConfig::default();
        self.config = config.clone();
        Ok(config)
    }

    /// 获取帮助文本
    pub fn get_help_text(&self) -> String {
        r#"
Inula Rust 编译器 v2.0.0

用法:
  inula-compiler-rust [选项] [输入路径]

选项:
  -i, --input <路径>        指定输入文件或目录 (默认: .)
  -o, --output <路径>       指定输出目录
      --minify              压缩输出代码
      --no-minify           不压缩输出代码 (默认)
      --source-map          生成 Source Map (默认)
      --no-source-map       不生成 Source Map
  -w, --watch               监听文件变化
  -t, --threads <数量>      指定编译线程数
  -l, --log-level <级别>    设置日志级别 (debug|info|warn|error)
      --plugin <名称>       加载插件
  -h, --help                显示帮助信息
  -v, --version             显示版本信息

示例:
  inula-compiler-rust src/
  inula-compiler-rust -i src/ -o dist/ --minify
  inula-compiler-rust -w -t 4 --log-level debug
        "#
        .to_string()
    }

    /// 验证配置
    pub fn validate_config(&self, config: &CliConfig) -> Result<(), String> {
        // 验证输入路径
        if config.input.is_empty() {
            return Err("输入路径不能为空".to_string());
        }

        // 验证线程数
        if let Some(threads) = config.threads {
            if threads == 0 || threads > 32 {
                return Err("线程数必须在 1-32 之间".to_string());
            }
        }

        // 验证日志级别
        if let Some(level) = &config.log_level {
            let valid_levels = ["debug", "info", "warn", "error"];
            if !valid_levels.contains(&level.as_str()) {
                return Err(format!(
                    "无效的日志级别: {}，有效值: {:?}",
                    level, valid_levels
                ));
            }
        }

        Ok(())
    }
}

/// 日志级别
#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
}

impl LogLevel {
    pub fn from_str(level: &str) -> Option<Self> {
        match level.to_lowercase().as_str() {
            "debug" => Some(LogLevel::Debug),
            "info" => Some(LogLevel::Info),
            "warn" => Some(LogLevel::Warn),
            "error" => Some(LogLevel::Error),
            _ => None,
        }
    }
}

/// 日志记录器
pub struct Logger {
    level: LogLevel,
}

impl Logger {
    pub fn new(level: LogLevel) -> Self {
        Self { level }
    }

    pub fn debug(&self, message: &str) {
        if self.level == LogLevel::Debug {
            web_sys::console::log_1(&JsValue::from_str(&format!("[DEBUG] {}", message)));
        }
    }

    pub fn info(&self, message: &str) {
        if self.level <= LogLevel::Info {
            web_sys::console::log_1(&JsValue::from_str(&format!("[INFO] {}", message)));
        }
    }

    pub fn warn(&self, message: &str) {
        if self.level <= LogLevel::Warn {
            web_sys::console::warn_1(&JsValue::from_str(&format!("[WARN] {}", message)));
        }
    }

    pub fn error(&self, message: &str) {
        if self.level <= LogLevel::Error {
            web_sys::console::error_1(&JsValue::from_str(&format!("[ERROR] {}", message)));
        }
    }
}
