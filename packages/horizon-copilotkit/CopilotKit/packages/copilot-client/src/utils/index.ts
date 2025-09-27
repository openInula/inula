/**
 * 判断是否应该显示开发控制台
 */
export function shouldShowDevConsole(showDevConsole: boolean | "auto"): boolean {
  if (typeof showDevConsole === "boolean") {
    return showDevConsole;
  }
  
  if (showDevConsole === "auto") {
    // 在开发环境下自动显示
    return process.env.NODE_ENV === "development";
  }
  
  return false;
}

/**
 * 生成默认的上下文分类
 */
export const defaultCopilotContextCategories = ["copilot"];

/**
 * 格式化特性名称
 */
export function formatFeatureName(featureName: string): string {
  return featureName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delay: initialDelay = 1000, backoff = 2 } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delayMs = initialDelay * Math.pow(backoff, attempt - 1);
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

/**
 * 安全的 JSON 解析
 */
export function safeJsonParse<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === "object") {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
} 