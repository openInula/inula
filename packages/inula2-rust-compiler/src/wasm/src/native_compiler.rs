use crate::InulaCompiler;

/// 原生二进制专用的编译器包装器
pub struct NativeInulaCompiler {
    inner: InulaCompiler,
}

impl NativeInulaCompiler {
    pub fn new() -> Self {
        Self {
            inner: InulaCompiler::new(),
        }
    }

    pub fn compile_jsx(&mut self, code: &str) -> Result<String, String> {
        match self.inner.compile_jsx(code) {
            Ok(result) => Ok(format!("{:?}", result)),
            Err(e) => Err(format!("{:?}", e)),
        }
    }

    pub fn parse_view(&mut self, code: &str) -> Result<String, String> {
        match self.inner.parse_jsx(code) {
            Ok(result) => Ok(format!("{:?}", result)),
            Err(e) => Err(format!("{:?}", e)),
        }
    }
}
