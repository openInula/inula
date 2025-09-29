// openinula_apis.rs - openInula API 支持模块
use std::collections::HashMap;

/// openInula API 类型枚举
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum OpenInulaAPI {
    // 组件
    Component,
    PureComponent,
    Memo,
    Fragment,
    Children,
    Suspense,

    // 钩子函数
    UseState,
    UseCallback,
    UseContext,
    UseEffect,
    UseLayoutEffect,
    UseMemo,
    UseReducer,
    UseRef,
    UseImperativeHandle,

    // APIs
    Render,
    CreateElement,
    CreatePortal,
    CreateRef,
    ForwardRef,
    Lazy,
    CreateContext,
    CloneElement,
    FindDOMNode,
    FlushSync,
    UnmountComponentAtNode,

    // Tools
    IsFragment,
    IsElement,
    IsValidElement,
    IsValidElementType,
    IsForwardRef,
    IsLazy,
    IsMemo,
    IsPortal,
    IsContextProvider,
    IsContextConsumer,
}

impl OpenInulaAPI {
    /// 获取 API 的导入名称
    pub fn import_name(&self) -> &'static str {
        match self {
            // 组件
            OpenInulaAPI::Component => "Component",
            OpenInulaAPI::PureComponent => "PureComponent",
            OpenInulaAPI::Memo => "memo",
            OpenInulaAPI::Fragment => "Fragment",
            OpenInulaAPI::Children => "Children",
            OpenInulaAPI::Suspense => "Suspense",

            // 钩子函数
            OpenInulaAPI::UseState => "useState",
            OpenInulaAPI::UseCallback => "useCallback",
            OpenInulaAPI::UseContext => "useContext",
            OpenInulaAPI::UseEffect => "useEffect",
            OpenInulaAPI::UseLayoutEffect => "useLayoutEffect",
            OpenInulaAPI::UseMemo => "useMemo",
            OpenInulaAPI::UseReducer => "useReducer",
            OpenInulaAPI::UseRef => "useRef",
            OpenInulaAPI::UseImperativeHandle => "useImperativeHandle",

            // APIs
            OpenInulaAPI::Render => "render",
            OpenInulaAPI::CreateElement => "createElement",
            OpenInulaAPI::CreatePortal => "createPortal",
            OpenInulaAPI::CreateRef => "createRef",
            OpenInulaAPI::ForwardRef => "forwardRef",
            OpenInulaAPI::Lazy => "lazy",
            OpenInulaAPI::CreateContext => "createContext",
            OpenInulaAPI::CloneElement => "cloneElement",
            OpenInulaAPI::FindDOMNode => "findDOMNode",
            OpenInulaAPI::FlushSync => "flushSync",
            OpenInulaAPI::UnmountComponentAtNode => "unmountComponentAtNode",

            // Tools
            OpenInulaAPI::IsFragment => "isFragment",
            OpenInulaAPI::IsElement => "isElement",
            OpenInulaAPI::IsValidElement => "isValidElement",
            OpenInulaAPI::IsValidElementType => "isValidElementType",
            OpenInulaAPI::IsForwardRef => "isForwardRef",
            OpenInulaAPI::IsLazy => "isLazy",
            OpenInulaAPI::IsMemo => "isMemo",
            OpenInulaAPI::IsPortal => "isPortal",
            OpenInulaAPI::IsContextProvider => "isContextProvider",
            OpenInulaAPI::IsContextConsumer => "isContextConsumer",
        }
    }

    /// 获取 API 的别名（用于代码生成）
    pub fn alias_name(&self) -> String {
        format!("$${}", self.import_name())
    }

    /// 检查是否是钩子函数
    pub fn is_hook(&self) -> bool {
        matches!(
            self,
            OpenInulaAPI::UseState
                | OpenInulaAPI::UseCallback
                | OpenInulaAPI::UseContext
                | OpenInulaAPI::UseEffect
                | OpenInulaAPI::UseLayoutEffect
                | OpenInulaAPI::UseMemo
                | OpenInulaAPI::UseReducer
                | OpenInulaAPI::UseRef
                | OpenInulaAPI::UseImperativeHandle
        )
    }

    /// 检查是否是组件
    pub fn is_component(&self) -> bool {
        matches!(
            self,
            OpenInulaAPI::Component
                | OpenInulaAPI::PureComponent
                | OpenInulaAPI::Memo
                | OpenInulaAPI::Fragment
                | OpenInulaAPI::Children
                | OpenInulaAPI::Suspense
        )
    }

    /// 检查是否是工具函数
    pub fn is_tool(&self) -> bool {
        matches!(
            self,
            OpenInulaAPI::IsFragment
                | OpenInulaAPI::IsElement
                | OpenInulaAPI::IsValidElement
                | OpenInulaAPI::IsValidElementType
                | OpenInulaAPI::IsForwardRef
                | OpenInulaAPI::IsLazy
                | OpenInulaAPI::IsMemo
                | OpenInulaAPI::IsPortal
                | OpenInulaAPI::IsContextProvider
                | OpenInulaAPI::IsContextConsumer
        )
    }
}

/// openInula API 管理器
#[derive(Debug, Clone)]
pub struct OpenInulaAPIManager {
    /// 已使用的 API
    used_apis: HashMap<OpenInulaAPI, bool>,
    /// 导入映射
    import_map: HashMap<String, String>,
}

impl OpenInulaAPIManager {
    pub fn new() -> Self {
        Self {
            used_apis: HashMap::new(),
            import_map: HashMap::new(),
        }
    }

    /// 标记 API 为已使用
    pub fn mark_api_used(&mut self, api: OpenInulaAPI) {
        self.used_apis.insert(api.clone(), true);
        self.import_map
            .insert(api.import_name().to_string(), api.alias_name());
    }

    /// 检查 API 是否已使用
    pub fn is_api_used(&self, api: &OpenInulaAPI) -> bool {
        self.used_apis.get(api).copied().unwrap_or(false)
    }

    /// 获取所有已使用的 API
    pub fn get_used_apis(&self) -> Vec<OpenInulaAPI> {
        self.used_apis
            .iter()
            .filter(|(_, &used)| used)
            .map(|(api, _)| api.clone())
            .collect()
    }

    /// 生成导入语句
    pub fn generate_import_statement(&self) -> String {
        let mut imports: Vec<String> = Vec::new();

        // 按类别分组导入
        let mut hooks = Vec::new();
        let mut components = Vec::new();
        let mut apis = Vec::new();
        let mut tools = Vec::new();

        for api in self.get_used_apis() {
            match api {
                OpenInulaAPI::UseState
                | OpenInulaAPI::UseCallback
                | OpenInulaAPI::UseContext
                | OpenInulaAPI::UseEffect
                | OpenInulaAPI::UseLayoutEffect
                | OpenInulaAPI::UseMemo
                | OpenInulaAPI::UseReducer
                | OpenInulaAPI::UseRef
                | OpenInulaAPI::UseImperativeHandle => {
                    hooks.push(api.import_name());
                }
                OpenInulaAPI::Component
                | OpenInulaAPI::PureComponent
                | OpenInulaAPI::Memo
                | OpenInulaAPI::Fragment
                | OpenInulaAPI::Children
                | OpenInulaAPI::Suspense => {
                    components.push(api.import_name());
                }
                OpenInulaAPI::Render
                | OpenInulaAPI::CreateElement
                | OpenInulaAPI::CreatePortal
                | OpenInulaAPI::CreateRef
                | OpenInulaAPI::ForwardRef
                | OpenInulaAPI::Lazy
                | OpenInulaAPI::CreateContext
                | OpenInulaAPI::CloneElement
                | OpenInulaAPI::FindDOMNode
                | OpenInulaAPI::FlushSync
                | OpenInulaAPI::UnmountComponentAtNode => {
                    apis.push(api.import_name());
                }
                _ => {
                    tools.push(api.import_name());
                }
            }
        }

        // 生成导入语句
        let mut import_parts = Vec::new();

        if !hooks.is_empty() {
            let hook_imports = hooks
                .iter()
                .map(|name| format!("{} as $${}", name, name))
                .collect::<Vec<_>>()
                .join(", ");
            import_parts.push(format!("  // 钩子函数\n  {}", hook_imports));
        }

        if !components.is_empty() {
            let component_imports = components
                .iter()
                .map(|name| format!("{} as $${}", name, name))
                .collect::<Vec<_>>()
                .join(", ");
            import_parts.push(format!("  // 组件\n  {}", component_imports));
        }

        if !apis.is_empty() {
            let api_imports = apis
                .iter()
                .map(|name| format!("{} as $${}", name, name))
                .collect::<Vec<_>>()
                .join(", ");
            import_parts.push(format!("  // APIs\n  {}", api_imports));
        }

        if !tools.is_empty() {
            let tool_imports = tools
                .iter()
                .map(|name| format!("{} as $${}", name, name))
                .collect::<Vec<_>>()
                .join(", ");
            import_parts.push(format!("  // 工具函数\n  {}", tool_imports));
        }

        if import_parts.is_empty() {
            "import {} from 'openinula';".to_string()
        } else {
            format!(
                "import {{\n{}\n}} from 'openinula';",
                import_parts.join(",\n")
            )
        }
    }

    /// 生成钩子函数代码
    pub fn generate_hook_code(&self, hook: &OpenInulaAPI, params: &[String]) -> String {
        match hook {
            OpenInulaAPI::UseState => {
                if params.is_empty() {
                    "$$useState(0)".to_string()
                } else {
                    format!("$$useState({})", params[0])
                }
            }
            OpenInulaAPI::UseEffect => {
                if params.len() >= 2 {
                    format!("$$useEffect(() => {{ {} }}, [{}])", params[0], params[1])
                } else if params.len() == 1 {
                    format!("$$useEffect(() => {{ {} }})", params[0])
                } else {
                    "$$useEffect(() => {})".to_string()
                }
            }
            OpenInulaAPI::UseMemo => {
                if params.len() >= 2 {
                    format!("$$useMemo(() => {{ {} }}, [{}])", params[0], params[1])
                } else {
                    format!("$$useMemo(() => {{ {} }})", params[0])
                }
            }
            OpenInulaAPI::UseCallback => {
                if params.len() >= 2 {
                    format!("$$useCallback({}, [{}])", params[0], params[1])
                } else {
                    format!("$$useCallback({})", params[0])
                }
            }
            OpenInulaAPI::UseRef => {
                if params.is_empty() {
                    "$$useRef(null)".to_string()
                } else {
                    format!("$$useRef({})", params[0])
                }
            }
            OpenInulaAPI::UseContext => {
                if params.is_empty() {
                    "$$useContext()".to_string()
                } else {
                    format!("$$useContext({})", params[0])
                }
            }
            _ => format!("$${}()", hook.import_name()),
        }
    }

    /// 生成组件代码
    pub fn generate_component_code(&self, component: &OpenInulaAPI, props: &[String]) -> String {
        match component {
            OpenInulaAPI::Fragment => {
                if props.is_empty() {
                    "$$Fragment".to_string()
                } else {
                    format!("$$Fragment({})", props.join(", "))
                }
            }
            OpenInulaAPI::Suspense => {
                if props.len() >= 2 {
                    format!("$$Suspense({{ fallback: {} }}, {})", props[0], props[1])
                } else {
                    "$$Suspense".to_string()
                }
            }
            _ => format!("$${}", component.import_name()),
        }
    }
}

impl Default for OpenInulaAPIManager {
    fn default() -> Self {
        Self::new()
    }
}

/// 检测代码中使用的 openInula API
pub fn detect_used_apis(code: &str) -> Vec<OpenInulaAPI> {
    let mut used_apis = Vec::new();

    // 检测钩子函数
    if code.contains("useState") {
        used_apis.push(OpenInulaAPI::UseState);
    }
    if code.contains("useEffect") {
        used_apis.push(OpenInulaAPI::UseEffect);
    }
    if code.contains("useMemo") {
        used_apis.push(OpenInulaAPI::UseMemo);
    }
    if code.contains("useCallback") {
        used_apis.push(OpenInulaAPI::UseCallback);
    }
    if code.contains("useRef") {
        used_apis.push(OpenInulaAPI::UseRef);
    }
    if code.contains("useContext") {
        used_apis.push(OpenInulaAPI::UseContext);
    }
    if code.contains("useLayoutEffect") {
        used_apis.push(OpenInulaAPI::UseLayoutEffect);
    }
    if code.contains("useReducer") {
        used_apis.push(OpenInulaAPI::UseReducer);
    }
    if code.contains("useImperativeHandle") {
        used_apis.push(OpenInulaAPI::UseImperativeHandle);
    }

    // 检测组件
    if code.contains("Fragment") {
        used_apis.push(OpenInulaAPI::Fragment);
    }
    if code.contains("Suspense") {
        used_apis.push(OpenInulaAPI::Suspense);
    }
    if code.contains("memo") {
        used_apis.push(OpenInulaAPI::Memo);
    }

    // 检测 APIs
    if code.contains("createElement") {
        used_apis.push(OpenInulaAPI::CreateElement);
    }
    if code.contains("createPortal") {
        used_apis.push(OpenInulaAPI::CreatePortal);
    }
    if code.contains("createRef") {
        used_apis.push(OpenInulaAPI::CreateRef);
    }
    if code.contains("forwardRef") {
        used_apis.push(OpenInulaAPI::ForwardRef);
    }
    if code.contains("lazy") {
        used_apis.push(OpenInulaAPI::Lazy);
    }
    if code.contains("createContext") {
        used_apis.push(OpenInulaAPI::CreateContext);
    }
    if code.contains("cloneElement") {
        used_apis.push(OpenInulaAPI::CloneElement);
    }
    if code.contains("render") {
        used_apis.push(OpenInulaAPI::Render);
    }

    // 检测工具函数
    if code.contains("isValidElement") {
        used_apis.push(OpenInulaAPI::IsValidElement);
    }
    if code.contains("isElement") {
        used_apis.push(OpenInulaAPI::IsElement);
    }
    if code.contains("isFragment") {
        used_apis.push(OpenInulaAPI::IsFragment);
    }
    if code.contains("isValidElementType") {
        used_apis.push(OpenInulaAPI::IsValidElementType);
    }
    if code.contains("isForwardRef") {
        used_apis.push(OpenInulaAPI::IsForwardRef);
    }
    if code.contains("isLazy") {
        used_apis.push(OpenInulaAPI::IsLazy);
    }
    if code.contains("isMemo") {
        used_apis.push(OpenInulaAPI::IsMemo);
    }
    if code.contains("isPortal") {
        used_apis.push(OpenInulaAPI::IsPortal);
    }
    if code.contains("isContextProvider") {
        used_apis.push(OpenInulaAPI::IsContextProvider);
    }
    if code.contains("isContextConsumer") {
        used_apis.push(OpenInulaAPI::IsContextConsumer);
    }

    // 检测隐式的 lazy 使用（通过组件名模式）
    if code.contains("LazyComponent")
        || code.contains("Lazy")
        || code.contains("AsyncComponent")
        || code.contains("Async")
    {
        used_apis.push(OpenInulaAPI::Lazy);
    }

    used_apis
}

#[cfg(test)]
mod tests {
    use super::*;

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_api_import_name() {
        assert_eq!(OpenInulaAPI::UseState.import_name(), "useState");
        assert_eq!(OpenInulaAPI::CreateElement.import_name(), "createElement");
        assert_eq!(OpenInulaAPI::Fragment.import_name(), "Fragment");
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_api_alias_name() {
        assert_eq!(OpenInulaAPI::UseState.alias_name(), "$$useState");
        assert_eq!(OpenInulaAPI::CreateElement.alias_name(), "$$createElement");
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_is_hook() {
        assert!(OpenInulaAPI::UseState.is_hook());
        assert!(OpenInulaAPI::UseEffect.is_hook());
        assert!(!OpenInulaAPI::CreateElement.is_hook());
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_is_component() {
        assert!(OpenInulaAPI::Fragment.is_component());
        assert!(OpenInulaAPI::Suspense.is_component());
        assert!(!OpenInulaAPI::UseState.is_component());
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_detect_used_apis() {
        let code = "const [count, setCount] = useState(0); useEffect(() => {}, []);";
        let apis = detect_used_apis(code);
        assert!(apis.contains(&OpenInulaAPI::UseState));
        assert!(apis.contains(&OpenInulaAPI::UseEffect));
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_api_manager() {
        let mut manager = OpenInulaAPIManager::new();
        manager.mark_api_used(OpenInulaAPI::UseState);
        manager.mark_api_used(OpenInulaAPI::CreateElement);

        assert!(manager.is_api_used(&OpenInulaAPI::UseState));
        assert!(manager.is_api_used(&OpenInulaAPI::CreateElement));
        assert!(!manager.is_api_used(&OpenInulaAPI::UseEffect));

        let import_statement = manager.generate_import_statement();
        assert!(import_statement.contains("useState"));
        assert!(import_statement.contains("createElement"));
    }
}
