import * as packageJson from "../../package.json";

export class CopilotApiError extends Error {
  public status: number;
  public response?: string;

  constructor(status: number, response?: string) {
    super(`CopilotKit API Error (${status}): ${response || "Unknown error"}`);
    this.name = "CopilotApiError";
    this.status = status;
    this.response = response;
  }
}

export class CopilotConnectionError extends Error {
  constructor(message: string) {
    super(`CopilotKit Connection Error: ${message}`);
    this.name = "CopilotConnectionError";
  }
}

export class CopilotVersionMismatchError extends Error {
  constructor(mismatch: { message: string }) {
    super(`CopilotKit Version Mismatch: ${mismatch.message}`);
    this.name = "CopilotVersionMismatchError";
  }
}

export interface ErrorHandlerOptions {
  onError?: (error: Error) => void;
  onWarning?: (warning: string) => void;
}

export class ErrorHandler {
  private onError?: (error: Error) => void;
  private onWarning?: (warning: string) => void;

  constructor(options: ErrorHandlerOptions) {
    this.onError = options.onError;
    this.onWarning = options.onWarning;
  }

  handleError(error: Error) {
    if (this.onError) {
      this.onError(error);
    } else {
      console.error("CopilotKit Error:", error);
    }
  }

  handleWarning(warning: string) {
    if (this.onWarning) {
      this.onWarning(warning);
    } else {
      console.warn("CopilotKit Warning:", warning);
    }
  }

  // 检查版本兼容性
  checkVersionCompatibility(runtimeVersion?: string): void {
    if (!runtimeVersion) return;

    const currentVersion = packageJson.version;
    
    // 简单的版本检查逻辑
    if (runtimeVersion !== currentVersion) {
      this.handleWarning(
        `Runtime version (${runtimeVersion}) doesn't match client version (${currentVersion}). This may cause compatibility issues.`
      );
    }
  }

  // 处理 fetch 响应错误
  async handleFetchResponse(response: Response): Promise<Response> {
    // 检查版本兼容性
    const runtimeVersion = response.headers.get("X-CopilotKit-Runtime-Version");
    this.checkVersionCompatibility(runtimeVersion || undefined);

    if (!response.ok) {
      const errorText = await response.text();
      throw new CopilotApiError(response.status, errorText);
    }

    return response;
  }

  // 处理 WebSocket 连接错误
  handleWebSocketError(event: Event): void {
    const error = new CopilotConnectionError("WebSocket connection failed");
    this.handleError(error);
  }

  // 处理网络错误
  handleNetworkError(error: Error): void {
    if (error.name === "AbortError") {
      // 忽略主动取消的请求
      return;
    }

    const networkError = new CopilotConnectionError(
      `Network error: ${error.message}`
    );
    this.handleError(networkError);
  }
} 