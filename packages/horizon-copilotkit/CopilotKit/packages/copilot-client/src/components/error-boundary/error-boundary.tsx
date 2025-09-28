import React, { Component, ErrorInfo, ReactNode } from "react";

/**
 * 错误边界状态
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * 错误边界属性
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

/**
 * CopilotKit 错误边界组件
 * 
 * 用于捕获和处理 React 组件树中的 JavaScript 错误
 */
export class CopilotErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新状态以便下一次渲染显示降级 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    this.setState({
      error,
      errorInfo,
    });

    // 调用错误回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发模式下打印错误信息
    if (process.env.NODE_ENV === "development") {
      console.error("CopilotKit Error Boundary caught an error:", error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // 如果之前有错误且现在应该重置
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys && prevProps.resetKeys) {
        // 检查重置键是否发生变化
        const hasResetKeyChanged = resetKeys.some(
          (resetKey, index) => resetKey !== prevProps.resetKeys![index]
        );
        
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    // 如果启用了属性变化重置
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
      });
    }, 0);
  };

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义的错误 UI
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // 默认错误 UI
      return <DefaultErrorFallback error={this.state.error} onReset={this.resetErrorBoundary} />;
    }

    return this.props.children;
  }
}

/**
 * 默认错误降级组件属性
 */
interface DefaultErrorFallbackProps {
  error?: Error;
  onReset: () => void;
}

/**
 * 默认错误降级组件
 */
function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="copilot-error-boundary">
      <div className="copilot-error-boundary-container">
        <div className="copilot-error-boundary-icon">⚠️</div>
        <h2 className="copilot-error-boundary-title">出现了一些问题</h2>
        <p className="copilot-error-boundary-message">
          CopilotKit 遇到了一个错误。请尝试刷新页面或联系支持。
        </p>
        {error && process.env.NODE_ENV === "development" && (
          <details className="copilot-error-boundary-details">
            <summary>错误详情 (开发模式)</summary>
            <pre className="copilot-error-boundary-stack">
              {error.message}
              {"\n"}
              {error.stack}
            </pre>
          </details>
        )}
        <button 
          className="copilot-error-boundary-button"
          onClick={onReset}
        >
          重试
        </button>
      </div>
    </div>
  );
}

/**
 * 高阶组件：为组件包装错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <CopilotErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </CopilotErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
} 