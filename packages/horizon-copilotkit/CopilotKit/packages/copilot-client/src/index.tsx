// 核心组件
export * from "./components";

// Hooks
export * from "./hooks";

// 上下文
export * from "./context";

// 客户端
export * from "./client";

// 类型定义
export * from "./types";

// 工具函数
export * from "./utils";

// 重要的重导出，方便用户使用
export { CopilotKit } from "./components/copilot-provider/copilotkit";
export type { CopilotKitProps } from "./components/copilot-provider/copilotkit";

// Toast 系统  
export { useToast } from "./components/toast/toast-provider";
export type { ToastType, ToastItem } from "./components/toast/toast-provider";

// 错误边界
export { CopilotErrorBoundary, withErrorBoundary } from "./components/error-boundary/error-boundary";
export type { ErrorBoundaryProps } from "./components/error-boundary/error-boundary"; 