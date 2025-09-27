import { randomId } from "@copilotkit/shared";

export type MessageType = "text" | "action_execution" | "result" | "agent_state" | "image";

export interface MessageStatus {
  code: "success" | "error" | "pending";
  reason?: string;
}

export type MessageRole = "user" | "assistant" | "system";

export abstract class BaseMessage {
  id: string;
  abstract type: MessageType;
  createdAt: Date;
  status: MessageStatus;

  constructor(props: Partial<BaseMessage>) {
    this.id = props.id ?? randomId();
    this.createdAt = props.createdAt ?? new Date();
    this.status = props.status ?? { code: "success" };
    Object.assign(this, props);
  }

  abstract toJSON(): any;

  isTextMessage(): this is TextMessage {
    return this.type === "text";
  }

  isActionExecutionMessage(): this is ActionExecutionMessage {
    return this.type === "action_execution";
  }

  isResultMessage(): this is ResultMessage {
    return this.type === "result";
  }

  isAgentStateMessage(): this is AgentStateMessage {
    return this.type === "agent_state";
  }

  isImageMessage(): this is ImageMessage {
    return this.type === "image";
  }
}

export class TextMessage extends BaseMessage {
  type = "text" as const;
  role: MessageRole;
  content: string;
  parentMessageId?: string;

  constructor(props: Partial<TextMessage> & Pick<TextMessage, "role" | "content">) {
    super(props);
    this.type = "text";
    this.role = props.role;
    this.content = props.content;
    this.parentMessageId = props.parentMessageId;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      role: this.role,
      content: this.content,
      parentMessageId: this.parentMessageId,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
    };
  }
}

export class ActionExecutionMessage extends BaseMessage {
  type = "action_execution" as const;
  name: string;
  arguments: Record<string, any>;
  parentMessageId?: string;

  constructor(
    props: Partial<ActionExecutionMessage> & Pick<ActionExecutionMessage, "name" | "arguments">
  ) {
    super(props);
    this.type = "action_execution";
    this.name = props.name;
    this.arguments = props.arguments;
    this.parentMessageId = props.parentMessageId;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      arguments: this.arguments,
      parentMessageId: this.parentMessageId,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
    };
  }
}

export class ResultMessage extends BaseMessage {
  type = "result" as const;
  actionExecutionId: string;
  actionName: string;
  result: any;

  constructor(
    props: Partial<ResultMessage> &
      Pick<ResultMessage, "actionExecutionId" | "actionName" | "result">
  ) {
    super(props);
    this.type = "result";
    this.actionExecutionId = props.actionExecutionId;
    this.actionName = props.actionName;
    this.result = props.result;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      actionExecutionId: this.actionExecutionId,
      actionName: this.actionName,
      result: typeof this.result === "string" ? this.result : JSON.stringify(this.result),
      createdAt: this.createdAt.toISOString(),
      status: this.status,
    };
  }

  static decodeResult(result: string): any {
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  static encodeResult(result: any): string {
    if (result === undefined) {
      return "";
    } else if (typeof result === "string") {
      return result;
    } else {
      return JSON.stringify(result);
    }
  }
}

export class AgentStateMessage extends BaseMessage {
  type = "agent_state" as const;
  agentName: string;
  state: any;
  running: boolean;
  threadId: string;
  nodeName?: string;
  runId?: string;
  active: boolean;
  role: MessageRole = "assistant";

  constructor(
    props: Partial<AgentStateMessage> &
      Pick<AgentStateMessage, "agentName" | "state" | "running" | "threadId" | "active">
  ) {
    super(props);
    this.type = "agent_state";
    this.agentName = props.agentName;
    this.state = props.state;
    this.running = props.running;
    this.threadId = props.threadId;
    this.active = props.active;
    this.nodeName = props.nodeName;
    this.runId = props.runId;
    this.role = props.role || "assistant";
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      agentName: this.agentName,
      state: this.state,
      running: this.running,
      threadId: this.threadId,
      nodeName: this.nodeName,
      runId: this.runId,
      active: this.active,
      role: this.role,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
    };
  }
}

export class ImageMessage extends BaseMessage {
  type = "image" as const;
  format: string;
  bytes: string;
  role: MessageRole;
  parentMessageId?: string;

  constructor(
    props: Partial<ImageMessage> & Pick<ImageMessage, "format" | "bytes" | "role">
  ) {
    super(props);
    this.type = "image";
    this.format = props.format;
    this.bytes = props.bytes;
    this.role = props.role;
    this.parentMessageId = props.parentMessageId;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      format: this.format,
      bytes: this.bytes,
      role: this.role,
      parentMessageId: this.parentMessageId,
      createdAt: this.createdAt.toISOString(),
      status: this.status,
    };
  }
}

export type Message =
  | TextMessage
  | ActionExecutionMessage
  | ResultMessage
  | AgentStateMessage
  | ImageMessage;

// 从 JSON 创建消息实例的工厂函数
export function createMessageFromJSON(data: any): Message {
  switch (data.type) {
    case "text":
      return new TextMessage({
        ...data,
        createdAt: new Date(data.createdAt),
      });
    case "action_execution":
      return new ActionExecutionMessage({
        ...data,
        arguments: data.arguments || {}, // 确保 arguments 不为 undefined
        createdAt: new Date(data.createdAt),
      });
    case "result":
      return new ResultMessage({
        ...data,
        result: ResultMessage.decodeResult(data.result),
        createdAt: new Date(data.createdAt),
      });
    case "agent_state":
      return new AgentStateMessage({
        ...data,
        createdAt: new Date(data.createdAt),
      });
    case "image":
      return new ImageMessage({
        ...data,
        createdAt: new Date(data.createdAt),
      });
    default:
      throw new Error(`Unknown message type: ${data.type}`);
  }
}

// 批量转换消息
export function convertMessagesToJSON(messages: Message[]): any[] {
  return messages.map((message) => message.toJSON());
}

export function convertJSONToMessages(data: any[]): Message[] {
  return data.map((item) => createMessageFromJSON(item));
}

// Role 常量导出 (兼容旧 API)
export const Role = {
  User: "user" as const,
  Assistant: "assistant" as const,
  System: "system" as const,
}; 