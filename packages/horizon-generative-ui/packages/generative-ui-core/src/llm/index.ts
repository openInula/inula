// DeepSeekClient.ts
import axios, { IrInstance, AxiosError, IrResponse, IrRequestConfig } from '@cloudsop/horizon-request';
import {
  DeepSeekCompletionParams,
  DeepSeekCompletionResponse,
  DeepSeekError,
  DeepSeekErrorResponse,
} from './types';
import { OpenAI, ChatCompletionCreateParamsStreaming } from 'openai';

export class LLMClient {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly client: IrInstance;
  private readonly defaultModel: string;
  private readonly defaultMaxTokens: number;

  // sdkClient 
  private readonly sdkClient: OpenAI;

  constructor(apiKey: string, options: { apiBaseUrl?: string; defaultModel?: string; defaultMaxTokens?: number } = {}) {
    this.apiKey = apiKey;
    this.apiBaseUrl = options.apiBaseUrl || 'https://api.deepseek.com/chat';
    this.defaultModel = options.defaultModel || 'deepseek-chat';
    this.defaultMaxTokens = options.defaultMaxTokens || 1000;

    this.client = axios.create({
      baseURL: this.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // 添加请求拦截器注入 API Key
    this.client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${this.apiKey}`;
      return config;
    });

    // 添加响应拦截器处理错误
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<DeepSeekErrorResponse>) => {
        if (error.response?.data?.error) {
          return Promise.reject(new DeepSeekError(error.response.data.error));
        }
        return Promise.reject(error);
      },
    );

    // 初始化OpenAI客户端
    this.sdkClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey, // 从环境变量获取API密钥
      dangerouslyAllowBrowser: true, // 仅用于演示，生产环境应通过后端调用
    });
  }

  /**
   * 生成文本补全
   * @param params 补全参数
   * @returns Promise<DeepSeekCompletionResponse>
   */
  async createCompletion(params: DeepSeekCompletionParams, config?: IrRequestConfig): Promise<DeepSeekCompletionResponse> {
    const requestParams: DeepSeekCompletionParams = {
      model: this.defaultModel,
      max_tokens: this.defaultMaxTokens,
      response_format: { type: 'json_object' },
      ...params,
    };

    try {
      const response: IrResponse<DeepSeekCompletionResponse> = await this.client.post(
        '/completions',
        requestParams,
        config,
      );
      return response.data;
    } catch (error) {
      if (error instanceof DeepSeekError) {
        console.error(`DeepSeek API Error: ${error.message}`);
      } else if (axios.isAxiosError(error)) {
        console.error(`HTTP Error: ${error.message}`);
      } else {
        console.error(`Unexpected Error: ${(error as Error).message}`);
      }
      throw error;
    }
  }

  /**
   * 简化版文本生成
   * @param prompt 提示文本
   * @param options 可选参数
   * @returns Promise<string> 生成的文本
   */
  async createStreamingCompletion(params: DeepSeekCompletionParams, onProgress = (chunk: string) => { }, options = {}) {
    try {
      // 合并默认参数和自定义参数
      const requestParams: ChatCompletionCreateParamsStreaming = {
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
        ...params,
      };

      // 创建流式请求
      const stream = await this.sdkClient.chat.completions.create(requestParams, options);

      let fullResponse = '';

      // 处理流式响应
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // 调用进度回调函数，传递当前累积的响应文本
          onProgress(fullResponse);
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('OpenAI API错误:', error);
      throw error;
    }
  }
}
