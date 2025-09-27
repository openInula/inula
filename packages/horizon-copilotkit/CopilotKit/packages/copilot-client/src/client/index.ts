// 主要客户端类
export { CopilotRuntimeClient, createCopilotRuntimeClient } from "./copilot-runtime-client";
export { StreamProcessor } from "./stream-processor";

// 消息类型
export * from "./message-types";

// 错误处理
export * from "./error-handler";

// 类型定义
export type {
  CopilotClientOptions,
  GenerateResponseRequest,
  ChatResponse,
  Agent,
  ProcessedAction,
  AgentSession,
  Extensions,
  ForwardedParameters,
  ResponseStatus,
} from "./rest-client";

export type {
  StreamResponseOptions,
} from "./copilot-runtime-client";

export type {
  StreamProcessorOptions,
} from "./stream-processor"; 