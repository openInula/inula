import * as packageJson from "../../package.json";
import { ErrorHandler } from "./error-handler";
import { Message, convertMessagesToJSON } from "./message-types";

export interface CopilotClientOptions {
  url: string;
  publicApiKey?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  properties?: Record<string, any>;
  onError?: (error: Error) => void;
  onWarning?: (warning: string) => void;
}

export interface GenerateResponseRequest {
  messages: Message[];
  actions?: ProcessedAction[];
  context?: string;
  threadId?: string;
  agentSession?: AgentSession;
  extensions?: Extensions;
  forwardedParameters?: ForwardedParameters;
}

export interface ProcessedAction {
  name: string;
  description: string;
  parameters: any[];
  available: "enabled" | "disabled" | "remote";
}

export interface AgentSession {
  agentName: string;
  threadId?: string;
  nodeName?: string;
}

export interface Extensions {
  [key: string]: any;
}

export interface ForwardedParameters {
  temperature?: number;
}

export interface ChatResponse {
  threadId: string;
  runId?: string;
  messages: any[];
  extensions?: Extensions;
  status: ResponseStatus;
}

export interface ResponseStatus {
  code: "success" | "error" | "pending";
  reason?: string;
  details?: string;
}

export interface Agent {
  name: string;
  description?: string;
  configuration?: any;
}

export class CopilotRestClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private abortController?: AbortController;
  private errorHandler: ErrorHandler;

  constructor(options: CopilotClientOptions) {
    this.baseUrl = options.url.replace(/\/$/, ""); // 移除末尾斜杠
    this.errorHandler = new ErrorHandler({
      onError: options.onError,
      onWarning: options.onWarning,
    });

    this.headers = {
      "Content-Type": "application/json",
      "X-CopilotKit-Version": packageJson.version,
      ...options.headers,
    };

    if (options.publicApiKey) {
      this.headers["X-CopilotCloud-Public-API-Key"] = options.publicApiKey;
    }

    // 创建初始的 AbortController
    this.abortController = new AbortController();
  }

  // 中止当前请求
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = new AbortController();
    }
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: this.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
} 