use serde_json::{json, Value};

/// 编译器结果类型
pub type CompilerResult<T> = Result<T, CompilerError>;

/// 编译器阶段枚举 - 与TypeScript原版完全对齐
#[derive(Debug, Clone, PartialEq)]
pub enum CompilerPhase {
    Parsing,
    Analysis,
    Transformation,
    CodeGeneration,
    Optimization,
    Validation,
    TypeChecking,
    SemanticAnalysis,
    IRBuilding,
    ASTTransformation,
    JSXParsing,
    ReactivityAnalysis,
    DependencyAnalysis,
    ViewGeneration,
    ComponentAnalysis,
    HookAnalysis,
    StateAnalysis,
    EffectAnalysis,
    LifecycleAnalysis,
    PropsAnalysis,
    ContextAnalysis,
    SuspenseAnalysis,
    FragmentAnalysis,
    TemplateAnalysis,
    MutableAnalysis,
    ForAnalysis,
    IfAnalysis,
    ElseAnalysis,
    ElseIfAnalysis,
    CustomAnalysis,
    HTMLAnalysis,
    TextAnalysis,
    ExpressionAnalysis,
    SpreadAnalysis,
    KeyAnalysis,
    RefAnalysis,
    ChildrenAnalysis,
    AttributesAnalysis,
    ValueAnalysis,
    ConditionAnalysis,
    LoopAnalysis,
    AsyncAnalysis,
    SyncAnalysis,
    StaticAnalysis,
    DynamicAnalysis,
    ReactiveAnalysis,
    ComputedAnalysis,
    DerivedAnalysis,
    WatchAnalysis,
    FunctionAnalysis,
    ArrowAnalysis,
    ClassAnalysis,
    InterfaceAnalysis,
    TypeAnalysis,
    EnumAnalysis,
    ConstAnalysis,
    LetAnalysis,
    VarAnalysis,
    DefaultAnalysis,
    NamedAnalysis,
    NamespaceAnalysis,
    ModuleAnalysis,
    ScriptAnalysis,
    StyleAnalysis,
    TemplateLiteralAnalysis,
    StringLiteralAnalysis,
    NumericLiteralAnalysis,
    BooleanLiteralAnalysis,
    NullLiteralAnalysis,
    UndefinedLiteralAnalysis,
    IdentifierAnalysis,
    MemberExpressionAnalysis,
    CallExpressionAnalysis,
    NewExpressionAnalysis,
    ArrayExpressionAnalysis,
    ObjectExpressionAnalysis,
    FunctionExpressionAnalysis,
    ArrowFunctionExpressionAnalysis,
    ClassExpressionAnalysis,
    ConditionalExpressionAnalysis,
    BinaryExpressionAnalysis,
    UnaryExpressionAnalysis,
    UpdateExpressionAnalysis,
    LogicalExpressionAnalysis,
    SequenceExpressionAnalysis,
    ThisExpressionAnalysis,
    SuperAnalysis,
    JSXElementAnalysis,
    JSXFragmentAnalysis,
    JSXTextAnalysis,
    JSXExpressionContainerAnalysis,
    JSXSpreadChildAnalysis,
    JSXIdentifierAnalysis,
    JSXMemberExpressionAnalysis,
    JSXNamespacedNameAnalysis,
    JSXEmptyExpressionAnalysis,
    JSXAttributeAnalysis,
    JSXSpreadAttributeAnalysis,
    JSXOpeningElementAnalysis,
    JSXClosingElementAnalysis,
    JSXSelfClosingElementAnalysis,
}

/// 错误严重程度枚举
#[derive(Debug, Clone, PartialEq)]
pub enum ErrorSeverity {
    Error,
    Warning,
    Info,
}

/// 错误类型枚举
#[derive(Debug, Clone)]
pub enum CompilerErrorType {
    ParseError,
    SyntaxError,
    ValidationError,
    CodeGenerationError,
    TypeError,
    SemanticError,
    DependencyError,
    ReactivityError,
    JSXError,
    HookError,
    StateError,
    PropsError,
    ContextError,
    LifecycleError,
    PerformanceError,
    OptimizationError,
    MemoryError,
    ConcurrencyError,
    SecurityError,
    CompatibilityError,
    ConfigurationError,
    ResourceError,
    NetworkError,
    FileSystemError,
    PermissionError,
    FormatError,
    EncodingError,
    SerializationError,
    DeserializationError,
    ConstraintError,
    LogicError,
    ArithmeticError,
    RangeError,
    ReferenceError,
    RuntimeError,
    SystemError,
    UserError,
    InternalError,
    ExternalError,
    ThirdPartyError,
    PluginError,
    ExtensionError,
    CustomError,
}

/// 编译器错误结构体
#[derive(Debug, Clone)]
pub struct CompilerError {
    pub phase: CompilerPhase,
    pub severity: ErrorSeverity,
    pub error_type: CompilerErrorType,
    pub message: String,
    pub suggestion: Option<String>,
    pub line: Option<u32>,
    pub column: Option<u32>,
    pub context: Option<String>,
    pub code: Option<String>,
    pub help_url: Option<String>,
}

impl CompilerError {
    pub fn new(phase: CompilerPhase, severity: ErrorSeverity, message: String) -> Self {
        Self {
            phase,
            severity,
            error_type: CompilerErrorType::CustomError,
            message,
            suggestion: None,
            line: None,
            column: None,
            context: None,
            code: None,
            help_url: None,
        }
    }

    pub fn new_with_type(
        phase: CompilerPhase,
        severity: ErrorSeverity,
        error_type: CompilerErrorType,
        message: String,
    ) -> Self {
        Self {
            phase,
            severity,
            error_type,
            message,
            suggestion: None,
            line: None,
            column: None,
            context: None,
            code: None,
            help_url: None,
        }
    }

    /// 创建解析错误
    pub fn parse_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Parsing,
            ErrorSeverity::Error,
            CompilerErrorType::ParseError,
            message,
        )
    }

    /// 创建语法错误
    pub fn syntax_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Parsing,
            ErrorSeverity::Error,
            CompilerErrorType::SyntaxError,
            message,
        )
    }

    /// 创建类型错误
    pub fn type_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::TypeChecking,
            ErrorSeverity::Error,
            CompilerErrorType::TypeError,
            message,
        )
    }

    /// 创建语义错误
    pub fn semantic_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::SemanticAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::SemanticError,
            message,
        )
    }

    /// 创建分析错误
    pub fn analysis_error(phase: CompilerPhase, message: String) -> Self {
        Self::new_with_type(
            phase,
            ErrorSeverity::Error,
            CompilerErrorType::SemanticError,
            message,
        )
    }

    /// 创建代码生成错误
    pub fn generation_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::CodeGeneration,
            ErrorSeverity::Error,
            CompilerErrorType::CodeGenerationError,
            message,
        )
    }

    /// 创建依赖错误
    pub fn dependency_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::DependencyAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::DependencyError,
            message,
        )
    }

    /// 创建响应式错误
    pub fn reactivity_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::ReactivityAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::ReactivityError,
            message,
        )
    }

    /// 创建JSX错误
    pub fn jsx_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::JSXParsing,
            ErrorSeverity::Error,
            CompilerErrorType::JSXError,
            message,
        )
    }

    /// 创建Hook错误
    pub fn hook_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::HookAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::HookError,
            message,
        )
    }

    /// 创建状态错误
    pub fn state_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::StateAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::StateError,
            message,
        )
    }

    /// 创建属性错误
    pub fn props_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::PropsAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::PropsError,
            message,
        )
    }

    /// 创建上下文错误
    pub fn context_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::ContextAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::ContextError,
            message,
        )
    }

    /// 创建生命周期错误
    pub fn lifecycle_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::LifecycleAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::LifecycleError,
            message,
        )
    }

    /// 创建性能错误
    pub fn performance_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Optimization,
            ErrorSeverity::Warning,
            CompilerErrorType::PerformanceError,
            message,
        )
    }

    /// 创建内存错误
    pub fn memory_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Optimization,
            ErrorSeverity::Error,
            CompilerErrorType::MemoryError,
            message,
        )
    }

    /// 创建并发错误
    pub fn concurrency_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Analysis,
            ErrorSeverity::Error,
            CompilerErrorType::ConcurrencyError,
            message,
        )
    }

    /// 创建安全错误
    pub fn security_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Validation,
            ErrorSeverity::Error,
            CompilerErrorType::SecurityError,
            message,
        )
    }

    /// 创建兼容性错误
    pub fn compatibility_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Validation,
            ErrorSeverity::Warning,
            CompilerErrorType::CompatibilityError,
            message,
        )
    }

    /// 创建配置错误
    pub fn configuration_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::Validation,
            ErrorSeverity::Error,
            CompilerErrorType::ConfigurationError,
            message,
        )
    }

    /// 创建警告
    pub fn warning(phase: CompilerPhase, message: String) -> Self {
        Self::new_with_type(
            phase,
            ErrorSeverity::Warning,
            CompilerErrorType::CustomError,
            message,
        )
    }

    /// 创建信息
    pub fn info(phase: CompilerPhase, message: String) -> Self {
        Self::new_with_type(
            phase,
            ErrorSeverity::Info,
            CompilerErrorType::CustomError,
            message,
        )
    }

    /// 创建 JSX 解析错误
    pub fn jsx_parse_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::JSXParsing,
            ErrorSeverity::Error,
            CompilerErrorType::JSXError,
            message,
        )
    }

    /// 创建依赖分析错误
    pub fn dependency_analysis_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::DependencyAnalysis,
            ErrorSeverity::Error,
            CompilerErrorType::DependencyError,
            message,
        )
    }

    /// 创建视图生成错误
    pub fn view_generation_error(message: String) -> Self {
        Self::new_with_type(
            CompilerPhase::ViewGeneration,
            ErrorSeverity::Error,
            CompilerErrorType::CodeGenerationError,
            message,
        )
    }
}

impl std::fmt::Display for CompilerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "[{:?}] {:?}: {}",
            self.phase, self.severity, self.message
        )
    }
}

impl CompilerError {
    pub fn with_suggestion(mut self, suggestion: String) -> Self {
        self.suggestion = Some(suggestion);
        self
    }

    pub fn with_location(mut self, line: u32, column: u32) -> Self {
        self.line = Some(line);
        self.column = Some(column);
        self
    }

    pub fn with_context(mut self, context: String) -> Self {
        self.context = Some(context);
        self
    }

    pub fn with_code(mut self, code: String) -> Self {
        self.code = Some(code);
        self
    }

    pub fn with_help_url(mut self, help_url: String) -> Self {
        self.help_url = Some(help_url);
        self
    }

    pub fn with_error_type(mut self, error_type: CompilerErrorType) -> Self {
        self.error_type = error_type;
        self
    }

    pub fn to_json(&self) -> Value {
        let mut error_obj = serde_json::Map::new();

        error_obj.insert("type".to_string(), json!("error"));
        error_obj.insert("phase".to_string(), json!(format!("{:?}", self.phase)));
        error_obj.insert(
            "severity".to_string(),
            json!(format!("{:?}", self.severity)),
        );
        error_obj.insert(
            "error_type".to_string(),
            json!(format!("{:?}", self.error_type)),
        );
        error_obj.insert("message".to_string(), json!(self.message));

        if let Some(suggestion) = &self.suggestion {
            error_obj.insert("suggestion".to_string(), json!(suggestion));
        }

        if let Some(line) = self.line {
            error_obj.insert("line".to_string(), json!(line));
        }

        if let Some(column) = self.column {
            error_obj.insert("column".to_string(), json!(column));
        }

        if let Some(context) = &self.context {
            error_obj.insert("context".to_string(), json!(context));
        }

        if let Some(code) = &self.code {
            error_obj.insert("code".to_string(), json!(code));
        }

        if let Some(help_url) = &self.help_url {
            error_obj.insert("help_url".to_string(), json!(help_url));
        }

        json!(error_obj)
    }

    pub fn format(&self) -> String {
        let mut formatted = String::new();

        // 根据严重程度选择图标
        let icon = match self.severity {
            ErrorSeverity::Error => "❌",
            ErrorSeverity::Warning => "⚠️",
            ErrorSeverity::Info => "ℹ️",
        };

        // 格式化阶段名称
        let phase_name = match self.phase {
            CompilerPhase::Parsing => "解析",
            CompilerPhase::Analysis => "分析",
            CompilerPhase::CodeGeneration => "代码生成",
            CompilerPhase::JSXParsing => "JSX解析",
            CompilerPhase::DependencyAnalysis => "依赖分析",
            CompilerPhase::ViewGeneration => "视图生成",
            CompilerPhase::ComponentAnalysis => "组件分析",
            CompilerPhase::HookAnalysis => "Hook分析",
            CompilerPhase::StateAnalysis => "状态分析",
            CompilerPhase::PropsAnalysis => "属性分析",
            _ => "编译",
        };

        // 格式化错误类型名称
        let error_type_name = match self.error_type {
            CompilerErrorType::ParseError => "解析错误",
            CompilerErrorType::SyntaxError => "语法错误",
            CompilerErrorType::TypeError => "类型错误",
            CompilerErrorType::SemanticError => "语义错误",
            CompilerErrorType::DependencyError => "依赖错误",
            CompilerErrorType::ReactivityError => "响应式错误",
            CompilerErrorType::JSXError => "JSX错误",
            CompilerErrorType::HookError => "Hook错误",
            CompilerErrorType::StateError => "状态错误",
            CompilerErrorType::PropsError => "属性错误",
            CompilerErrorType::ContextError => "上下文错误",
            CompilerErrorType::LifecycleError => "生命周期错误",
            CompilerErrorType::PerformanceError => "性能问题",
            CompilerErrorType::MemoryError => "内存错误",
            CompilerErrorType::ConcurrencyError => "并发错误",
            CompilerErrorType::SecurityError => "安全错误",
            CompilerErrorType::CompatibilityError => "兼容性问题",
            CompilerErrorType::ConfigurationError => "配置错误",
            _ => "编译错误",
        };

        formatted.push_str(&format!(
            "{} [{}] {}: {}\n",
            icon, phase_name, error_type_name, self.message
        ));

        if let Some(suggestion) = &self.suggestion {
            formatted.push_str(&format!("💡 建议: {}\n", suggestion));
        }

        if let Some(context) = &self.context {
            formatted.push_str(&format!("📝 上下文: {}\n", context));
        }

        if let Some(code) = &self.code {
            formatted.push_str(&format!("🔍 代码: {}\n", code));
        }

        if let Some(help_url) = &self.help_url {
            formatted.push_str(&format!("🔗 帮助: {}\n", help_url));
        }

        if let Some(line) = self.line {
            formatted.push_str(&format!("📍 位置: 第 {} 行", line));
            if let Some(column) = self.column {
                formatted.push_str(&format!(", 第 {} 列", column));
            }
            formatted.push('\n');
        }

        formatted
    }

    /// 格式化错误为简洁版本
    pub fn format_short(&self) -> String {
        let icon = match self.severity {
            ErrorSeverity::Error => "❌",
            ErrorSeverity::Warning => "⚠️",
            ErrorSeverity::Info => "ℹ️",
        };

        if let Some(line) = self.line {
            format!("{} {} (行 {})", icon, self.message, line)
        } else {
            format!("{} {}", icon, self.message)
        }
    }
}

impl std::fmt::Display for CompilerErrorType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CompilerErrorType::ParseError => write!(f, "解析错误"),
            CompilerErrorType::SyntaxError => write!(f, "语法错误"),
            CompilerErrorType::ValidationError => write!(f, "验证错误"),
            CompilerErrorType::CodeGenerationError => write!(f, "代码生成错误"),
            CompilerErrorType::TypeError => write!(f, "类型错误"),
            CompilerErrorType::SemanticError => write!(f, "语义错误"),
            CompilerErrorType::DependencyError => write!(f, "依赖错误"),
            CompilerErrorType::ReactivityError => write!(f, "响应式错误"),
            CompilerErrorType::JSXError => write!(f, "JSX错误"),
            CompilerErrorType::HookError => write!(f, "Hook错误"),
            CompilerErrorType::StateError => write!(f, "状态错误"),
            CompilerErrorType::PropsError => write!(f, "属性错误"),
            CompilerErrorType::ContextError => write!(f, "上下文错误"),
            CompilerErrorType::LifecycleError => write!(f, "生命周期错误"),
            CompilerErrorType::PerformanceError => write!(f, "性能问题"),
            CompilerErrorType::OptimizationError => write!(f, "优化错误"),
            CompilerErrorType::MemoryError => write!(f, "内存错误"),
            CompilerErrorType::ConcurrencyError => write!(f, "并发错误"),
            CompilerErrorType::SecurityError => write!(f, "安全错误"),
            CompilerErrorType::CompatibilityError => write!(f, "兼容性问题"),
            CompilerErrorType::ConfigurationError => write!(f, "配置错误"),
            CompilerErrorType::ResourceError => write!(f, "资源错误"),
            CompilerErrorType::NetworkError => write!(f, "网络错误"),
            CompilerErrorType::FileSystemError => write!(f, "文件系统错误"),
            CompilerErrorType::PermissionError => write!(f, "权限错误"),
            CompilerErrorType::FormatError => write!(f, "格式错误"),
            CompilerErrorType::EncodingError => write!(f, "编码错误"),
            CompilerErrorType::SerializationError => write!(f, "序列化错误"),
            CompilerErrorType::DeserializationError => write!(f, "反序列化错误"),
            CompilerErrorType::ConstraintError => write!(f, "约束错误"),
            CompilerErrorType::LogicError => write!(f, "逻辑错误"),
            CompilerErrorType::ArithmeticError => write!(f, "算术错误"),
            CompilerErrorType::RangeError => write!(f, "范围错误"),
            CompilerErrorType::ReferenceError => write!(f, "引用错误"),
            CompilerErrorType::RuntimeError => write!(f, "运行时错误"),
            CompilerErrorType::SystemError => write!(f, "系统错误"),
            CompilerErrorType::UserError => write!(f, "用户错误"),
            CompilerErrorType::InternalError => write!(f, "内部错误"),
            CompilerErrorType::ExternalError => write!(f, "外部错误"),
            CompilerErrorType::ThirdPartyError => write!(f, "第三方错误"),
            CompilerErrorType::PluginError => write!(f, "插件错误"),
            CompilerErrorType::ExtensionError => write!(f, "扩展错误"),
            CompilerErrorType::CustomError => write!(f, "自定义错误"),
        }
    }
}

impl From<String> for CompilerError {
    fn from(message: String) -> Self {
        CompilerError::new(CompilerPhase::CustomAnalysis, ErrorSeverity::Error, message)
    }
}

/// 错误收集器 - 用于收集和管理多个编译错误
#[derive(Debug, Clone)]
pub struct ErrorCollector {
    errors: Vec<CompilerError>,
    warnings: Vec<CompilerError>,
    infos: Vec<CompilerError>,
}

impl ErrorCollector {
    pub fn new() -> Self {
        Self {
            errors: Vec::new(),
            warnings: Vec::new(),
            infos: Vec::new(),
        }
    }

    /// 添加错误
    pub fn add_error(&mut self, error: CompilerError) {
        self.errors.push(error);
    }

    /// 添加警告
    pub fn add_warning(&mut self, warning: CompilerError) {
        self.warnings.push(warning);
    }

    /// 添加信息
    pub fn add_info(&mut self, info: CompilerError) {
        self.infos.push(info);
    }

    /// 检查是否有错误
    pub fn has_errors(&self) -> bool {
        !self.errors.is_empty()
    }

    /// 检查是否有警告
    pub fn has_warnings(&self) -> bool {
        !self.warnings.is_empty()
    }

    /// 获取所有错误
    pub fn get_errors(&self) -> &[CompilerError] {
        &self.errors
    }

    /// 获取所有警告
    pub fn get_warnings(&self) -> &[CompilerError] {
        &self.warnings
    }

    /// 获取所有信息
    pub fn get_infos(&self) -> &[CompilerError] {
        &self.infos
    }

    /// 格式化所有错误和警告
    pub fn format_all(&self) -> String {
        let mut formatted = String::new();

        for error in &self.errors {
            formatted.push_str(&error.format());
            formatted.push('\n');
        }

        for warning in &self.warnings {
            formatted.push_str(&warning.format());
            formatted.push('\n');
        }

        for info in &self.infos {
            formatted.push_str(&info.format());
            formatted.push('\n');
        }

        formatted
    }

    /// 获取错误统计
    pub fn get_stats(&self) -> (usize, usize, usize) {
        (self.errors.len(), self.warnings.len(), self.infos.len())
    }

    /// 清空所有错误
    pub fn clear(&mut self) {
        self.errors.clear();
        self.warnings.clear();
        self.infos.clear();
    }
}

impl Default for ErrorCollector {
    fn default() -> Self {
        Self::new()
    }
}

/// 错误工具函数 - 与TypeScript原版完全对齐
pub mod error_utils {
    use super::*;

    /// 创建解析错误
    pub fn create_parse_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::Parsing, ErrorSeverity::Error, message)
    }

    /// 创建分析错误
    pub fn create_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::Analysis, ErrorSeverity::Error, message)
    }

    /// 创建转换错误
    pub fn create_transformation_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::Transformation, ErrorSeverity::Error, message)
    }

    /// 创建代码生成错误
    pub fn create_generation_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::CodeGeneration, ErrorSeverity::Error, message)
    }

    /// 创建优化错误
    pub fn create_optimization_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::Optimization, ErrorSeverity::Error, message)
    }

    /// 创建验证错误
    pub fn create_validation_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::Validation, ErrorSeverity::Error, message)
    }

    /// 创建类型检查错误
    pub fn create_type_checking_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::TypeChecking, ErrorSeverity::Error, message)
    }

    /// 创建语义分析错误
    pub fn create_semantic_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::SemanticAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建IR构建错误
    pub fn create_ir_building_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::IRBuilding, ErrorSeverity::Error, message)
    }

    /// 创建AST转换错误
    pub fn create_ast_transformation_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ASTTransformation,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建JSX解析错误
    pub fn create_jsx_parsing_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::JSXParsing, ErrorSeverity::Error, message)
    }

    /// 创建响应式分析错误
    pub fn create_reactivity_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ReactivityAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建依赖分析错误
    pub fn create_dependency_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::DependencyAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建视图生成错误
    pub fn create_view_generation_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::ViewGeneration, ErrorSeverity::Error, message)
    }

    /// 创建组件分析错误
    pub fn create_component_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ComponentAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建Hook分析错误
    pub fn create_hook_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::HookAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建状态分析错误
    pub fn create_state_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::StateAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建效果分析错误
    pub fn create_effect_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::EffectAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建生命周期分析错误
    pub fn create_lifecycle_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::LifecycleAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建属性分析错误
    pub fn create_props_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::PropsAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建上下文分析错误
    pub fn create_context_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ContextAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建Suspense分析错误
    pub fn create_suspense_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::SuspenseAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建片段分析错误
    pub fn create_fragment_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::FragmentAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建模板分析错误
    pub fn create_template_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::TemplateAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建可变分析错误
    pub fn create_mutable_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::MutableAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建for分析错误
    pub fn create_for_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::ForAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建if分析错误
    pub fn create_if_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::IfAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建else分析错误
    pub fn create_else_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::ElseAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建else-if分析错误
    pub fn create_else_if_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::ElseIfAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建自定义分析错误
    pub fn create_custom_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::CustomAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建HTML分析错误
    pub fn create_html_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::HTMLAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建文本分析错误
    pub fn create_text_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::TextAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建表达式分析错误
    pub fn create_expression_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ExpressionAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建展开分析错误
    pub fn create_spread_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::SpreadAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建键分析错误
    pub fn create_key_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::KeyAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建引用分析错误
    pub fn create_ref_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::RefAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建子元素分析错误
    pub fn create_children_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ChildrenAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建属性分析错误
    pub fn create_attributes_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::AttributesAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建值分析错误
    pub fn create_value_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::ValueAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建条件分析错误
    pub fn create_condition_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ConditionAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建循环分析错误
    pub fn create_loop_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::LoopAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建异步分析错误
    pub fn create_async_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::AsyncAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建同步分析错误
    pub fn create_sync_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::SyncAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建静态分析错误
    pub fn create_static_analysis_error(message: String) -> CompilerError {
        CompilerError::new(CompilerPhase::StaticAnalysis, ErrorSeverity::Error, message)
    }

    /// 创建动态分析错误
    pub fn create_dynamic_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::DynamicAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建响应式分析错误
    pub fn create_reactive_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ReactiveAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建计算分析错误
    pub fn create_computed_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::ComputedAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建派生分析错误
    pub fn create_derived_analysis_error(message: String) -> CompilerError {
        CompilerError::new(
            CompilerPhase::DerivedAnalysis,
            ErrorSeverity::Error,
            message,
        )
    }

    /// 创建详细的错误，包含上下文和帮助信息
    pub fn create_detailed_error(
        phase: CompilerPhase,
        error_type: CompilerErrorType,
        message: String,
        suggestion: Option<String>,
        context: Option<String>,
        help_url: Option<String>,
    ) -> CompilerError {
        let mut error =
            CompilerError::new_with_type(phase, ErrorSeverity::Error, error_type, message);

        if let Some(suggestion) = suggestion {
            error = error.with_suggestion(suggestion);
        }

        if let Some(context) = context {
            error = error.with_context(context);
        }

        if let Some(help_url) = help_url {
            error = error.with_help_url(help_url);
        }

        error
    }

    /// 创建带位置的错误
    pub fn create_positioned_error(
        phase: CompilerPhase,
        error_type: CompilerErrorType,
        message: String,
        line: u32,
        column: u32,
    ) -> CompilerError {
        CompilerError::new_with_type(phase, ErrorSeverity::Error, error_type, message)
            .with_location(line, column)
    }

    /// 创建带代码片段的错误
    pub fn create_code_error(
        phase: CompilerPhase,
        error_type: CompilerErrorType,
        message: String,
        code: String,
        line: u32,
        column: u32,
    ) -> CompilerError {
        CompilerError::new_with_type(phase, ErrorSeverity::Error, error_type, message)
            .with_code(code)
            .with_location(line, column)
    }

    /// 创建性能警告
    pub fn create_performance_warning(
        phase: CompilerPhase,
        message: String,
        suggestion: Option<String>,
    ) -> CompilerError {
        let mut warning = CompilerError::new_with_type(
            phase,
            ErrorSeverity::Warning,
            CompilerErrorType::PerformanceError,
            message,
        );

        if let Some(suggestion) = suggestion {
            warning = warning.with_suggestion(suggestion);
        }

        warning
    }

    /// 创建兼容性警告
    pub fn create_compatibility_warning(
        phase: CompilerPhase,
        message: String,
        suggestion: Option<String>,
    ) -> CompilerError {
        let mut warning = CompilerError::new_with_type(
            phase,
            ErrorSeverity::Warning,
            CompilerErrorType::CompatibilityError,
            message,
        );

        if let Some(suggestion) = suggestion {
            warning = warning.with_suggestion(suggestion);
        }

        warning
    }

    /// 创建安全错误
    pub fn create_security_error(
        phase: CompilerPhase,
        message: String,
        suggestion: Option<String>,
        help_url: Option<String>,
    ) -> CompilerError {
        let mut error = CompilerError::new_with_type(
            phase,
            ErrorSeverity::Error,
            CompilerErrorType::SecurityError,
            message,
        );

        if let Some(suggestion) = suggestion {
            error = error.with_suggestion(suggestion);
        }

        if let Some(help_url) = help_url {
            error = error.with_help_url(help_url);
        }

        error
    }
}
