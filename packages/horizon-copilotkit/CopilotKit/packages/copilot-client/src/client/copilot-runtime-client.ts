import { CopilotRestClient } from "./rest-client";
import { StreamProcessor } from "./stream-processor";
import { 
  CopilotClientOptions, 
  GenerateResponseRequest, 
  Agent, 
} from "./rest-client";
import { Message } from "./message-types";

export interface StreamResponseOptions {
  onMessage?: (message: Message) => void;
  onComplete?: (messages: Message[]) => void;
  onError?: (error: Error) => void;
}

export class CopilotRuntimeClient {
  private restClient: CopilotRestClient;
  private streamProcessor?: StreamProcessor;

  constructor(options: CopilotClientOptions) {
    this.restClient = new CopilotRestClient(options);
  }

  // SSE 流式响应（使用 Server-Sent Events）
  async generateSSEStreamResponse(
    data: GenerateResponseRequest,
    options: StreamResponseOptions
  ): Promise<Message[]> {
    try {
      const requestBody = {
        ...data,
        messages: data.messages.map(m => m.toJSON()),
        stream: true, // 启用流式响应
      };

      const response = await fetch(`${this.restClient['baseUrl']}/api/chat/stream`, {
        method: "POST",
        headers: {
          ...this.restClient['headers'],
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: this.restClient['abortController']?.signal,
      });

      await this.restClient['errorHandler'].handleFetchResponse(response);

      // 设置流处理器回调
      this.streamProcessor = new StreamProcessor({
        onMessage: options.onMessage,
        onComplete: options.onComplete,
        onError: options.onError,
      });

      // Server-Sent Events
      return await this.streamProcessor.processSSEStream(response);
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    }
  }

  // 中止所有请求
  abort() {
    this.restClient.abort();
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    return this.restClient.healthCheck();
  }

  // 获取客户端统计信息
  getClientStats() {
    return {
      lastMessages: this.streamProcessor?.getMessages(),
    };
  }

  // 获取基础URL
  getBaseUrl(): string {
    return (this.restClient as any).baseUrl;
  }

  // 清理资源
  dispose(): void {
    this.abort();
    this.streamProcessor?.clear();
  }
}

// 便捷工厂函数
export function createCopilotRuntimeClient(options: CopilotClientOptions): CopilotRuntimeClient {
  return new CopilotRuntimeClient(options);
} 