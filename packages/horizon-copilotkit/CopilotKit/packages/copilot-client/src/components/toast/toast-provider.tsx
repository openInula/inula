import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { randomId } from "@copilotkit/shared";

/**
 * Toast 类型
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast 项目接口
 */
export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast 上下文接口
 */
export interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // 便捷的 toast 方法
  toast: (message: string, type?: ToastType, options?: { duration?: number; action?: ToastItem['action'] }) => string;
}

/**
 * Toast 上下文
 */
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Provider 属性
 */
export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

/**
 * Toast Provider 组件
 */
export function ToastProvider({ 
  children, 
  maxToasts = 5,
  defaultDuration = 5000 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast-${randomId()}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? defaultDuration,
    };

    setToasts(prevToasts => {
      const updatedToasts = [...prevToasts, newToast];
      // 限制 toast 数量
      if (updatedToasts.length > maxToasts) {
        return updatedToasts.slice(-maxToasts);
      }
      return updatedToasts;
    });

    // 自动移除 toast
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts, defaultDuration]);

  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const toast = useCallback((
    message: string, 
    type: ToastType = "info", 
    options?: { duration?: number; action?: ToastItem['action'] }
  ) => {
    return addToast({
      type,
      message,
      duration: options?.duration,
      action: options?.action,
    });
  }, [addToast]);

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    toast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/**
 * Toast 容器组件
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="copilot-toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * 单个 Toast 项组件
 */
interface ToastItemProps {
  toast: ToastItem;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return "copilot-toast-success";
      case "error":
        return "copilot-toast-error";
      case "warning":
        return "copilot-toast-warning";
      case "info":
      default:
        return "copilot-toast-info";
    }
  };

  return (
    <div className={`copilot-toast ${getTypeStyles()}`}>
      <div className="copilot-toast-content">
        <div className="copilot-toast-message">{toast.message}</div>
        {toast.action && (
          <button
            className="copilot-toast-action"
            onClick={toast.action.onClick}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        className="copilot-toast-close"
        onClick={onClose}
        aria-label="关闭通知"
      >
        ×
      </button>
    </div>
  );
}

/**
 * useToast Hook
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
} 