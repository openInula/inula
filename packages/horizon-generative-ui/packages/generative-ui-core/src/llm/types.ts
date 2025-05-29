export interface DeepSeekCompletionParams {
  model?: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  response_format?: { type: 'text' | 'json_object' };
  temperature?: number;
  top_p?: number;
  n?: number;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface DeepSeekCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | null;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string | null;
  };
}

export class DeepSeekError extends Error {
  type: string;
  param: string | null;
  code: string | null;

  constructor(error: DeepSeekErrorResponse['error']) {
    super(error.message);
    this.name = 'DeepSeekError';
    this.type = error.type;
    this.param = error.param;
    this.code = error.code;
  }
}

