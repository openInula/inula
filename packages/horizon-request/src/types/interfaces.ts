import HrError from '../core/HrError';
import HrHeaders from '../core/HrHeaders';
import { Method, ResponseType, HrTransformer, FulfilledFn, RejectedFn, Callback } from './types';
import CancelError from "../cancel/CancelError";
import { CanceledError } from "../../index";

// 请求配置
export interface HrRequestConfig {
  url?: string;

  method?: Method;

  // 公共URL前缀
  baseURL?: string;

  headers?: Record<string, any>;

  params?: Record<string, any> | null;

  data?: any;

  timeout?: number;

  // 超时错误消息
  timeoutErrorMessage?: string;

  // 是否发送凭据
  withCredentials?: boolean;

  // 响应类型
  responseType?: ResponseType;

  // 上传进度事件回调
  onUploadProgress?: (progressEvent: any) => void;

  // 下载进度事件回调
  onDownloadProgress?: (progressEvent: any) => void;

  // 请求取消令牌
  cancelToken?: CancelToken;

  signal?: AbortSignal;

  // 过渡选项
  transitional?: TransitionalOptions;

  validateStatus?: (status: number) => boolean;
}

export interface TransitionalOptions {
  // 是否忽略 JSON parse 的错误配置
  silentJSONParsing?: boolean;

  // 强制解析为 JSON 格式
  forcedJSONParsing?: boolean;

  // 请求超时异常错误配置
  clarifyTimeoutError?: boolean;
}

// 请求响应
export type HrResponse<T = any> = {
  // 响应数据
  data: T;

  // 响应状态码
  status: number;

  // 响应状态消息
  statusText: string;

  // 响应头
  headers: any;

  // 请求配置
  config: HrRequestConfig;

  // 请求对象
  request?: any;

  // 响应事件消息
  event?: string;
};

// Hr 类接口类型
export interface HrInterface {
  request<T = unknown>(url: string | Record<string, any>, config?: HrRequestConfig): Promise<HrResponse<T>>;

  get<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  post<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

  put<T = unknown>(url: string, data?: any, config?: HrRequestConfig): Promise<HrResponse<T>>;

  delete<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  head<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  options<T = unknown>(url: string, config?: HrRequestConfig): Promise<HrResponse<T>>;

  postForm<T = unknown>(url: string, data: any, config: HrRequestConfig): Promise<HrResponse<T>>;

  putForm<T = unknown>(url: string, data: any, config: HrRequestConfig): Promise<HrResponse<T>>;

  patchForm<T = unknown>(url: string, data: any, config: HrRequestConfig): Promise<HrResponse<T>>;
}

// Hr 实例接口类型
export interface HrInstance extends HrInterface {
  // Hr 类
  HorizonRequest: HrInterface;

  // 创建 Hr 实例
  create: (config?: HrRequestConfig) => HrInstance;

  // 使用内置的配置初始化实例属性
  defaults: HrRequestConfig;

  // 取消当前正在进行的请求
  CancelToken: CancelTokenStatic;

  // 判断是否请求取消
  isCancel: (value: any) => boolean;

  // CanceledError的别名，用于向后兼容
  Cancel: typeof CanceledError;

  // 实例拦截请求
  interceptors: Interceptors;

  // 并发发送多个 HTTP 请求
  all<T>(promises: Array<Promise<T>>): Promise<Array<T>>;

  // 封装多个 Promise 至数组，便于作为 all 传入参数
  spread: <T>(callback: Callback<T>) => (arr: any[]) => T;

  // horizonRequest 对象的默认实例
  default: HrInstance;

  CanceledError: typeof CancelError;

  // HrError 错误
  HrError: typeof HrError;

  // 判断输入值是否为 HrError
  isHrError: (avl: any) => boolean;

  // HrHeaders 响应头
  HrHeaders: typeof HrHeaders;

  useHR: <T = any>(url: string, config?: HrRequestConfig, options?: QueryOptions) => { data?: T; error?: any };

  /*----------------兼容axios--------------------*/
  Axios: any;

  AxiosError: any;

  isAxiosError: (val: any) => boolean;

  AxiosHeaders: any;
}

export interface Interceptors {
  request: HrInterceptorManager<HrRequestConfig>;
  response: HrInterceptorManager<HrResponse>;
}

// 拦截器接口类型
export interface InterceptorHandler<T> {
  //  Promise 成功时，拦截器处理响应函数
  fulfilled?: FulfilledFn<T>;

  //  Promise 拒绝时，拦截器处理响应值函数
  rejected?: RejectedFn;

  // 截器是否在单线程中执行
  synchronous?: boolean;

  // 拦截器何时被执行
  runWhen?: (value: T) => boolean;
}

// 拦截器管理器接口类型
export interface HrInterceptorManager<T> {
  // 添加拦截器
  use(
    fulfilled?: FulfilledFn<T>,
    rejected?: RejectedFn,
    options?: {
      synchronous?: boolean;
      runWhen?: (value: T) => boolean;
    }
  ): number;

  // 移除拦截器
  eject(id: number): void;

  // 清除拦截器
  clear(): void;

  // 过滤跳过迭代器
  forEach(func: Function): void;
}

export interface HrErrorInterface {
  // 产生错误的请求配置对象
  config?: HrRequestConfig;

  // 表示请求错误的字符串代码。例如，"ECONNABORTED"表示连接被中止。
  code?: string;

  // 产生错误的原始请求实例。
  request?: HrInstance;

  // 包含错误响应的响应实例。如果请求成功完成，但服务器返回错误状态码（例如404或500），则此属性存在。
  response?: HrResponse;
}

// 请求取消令牌
export interface CancelToken {
  // 可取消的 Promise，在超时时间 (或其他原因) 结束时被解决，并返回一个字符串值，该字符串值将作为取消请求的标识符
  promise: Promise<Cancel>;

  // 取消请求的标识符
  reason?: Cancel;

  // 如果请求被取消，则会抛出错误
  throwIfRequested(): void;
}

export interface Cancel {
  message?: string;
  cancelFlag?: boolean;
}

interface CancelExecutor {
  (cancel: Cancel): void;
}

interface CancelTokenSource {
  token: CancelToken;
  cancel: Cancel;
}

export interface CancelTokenStatic {
  new (executor: CancelExecutor): CancelToken;

  source(): CancelTokenSource;
}

// 兼容 IE fetchLike 接口类型
export interface FetchOptions {
  method?: Method;
  headers?: Record<string, string>;
  body?: any;
}

// 轮询查询配置 轮询间隔（毫秒）
export interface QueryOptions {
  pollingInterval?: number;
  // 是否启用动态轮询策略
  enablePollingOptimization?: boolean;
  // 配置动态轮询策略后生效
  limitation?: Limitation;
  // 动态轮询策略分析历史数据容量，默认100
  capacity?: number;
  // 动态轮询策略窗口大小，默认5
  windowSize?: number;
}

export interface Limitation {
  minInterval: number,
  maxInterval: number,
}

// useHR 缓存
export interface CacheItem {
  data: any;
  lastUpdated: number;
  pollingInterval?: number;
  timeoutId?: any;
}
