import { IrRequestConfig, IrResponse, TransitionalOptions } from '../types/interfaces';
import IrError from '../core/IrError';
import defaultConfig from '../config/defaultConfig';

// this 需要拿到上下文的config，processRequest 是动态调用的，直接将 config 当参数传入会拿到错误的 config
function transformResponse<T>(this: IrRequestConfig, data: any): T | string | null {
  const transitional: TransitionalOptions = this.transitional || defaultConfig.transitional;

  // 判断是否需要强制 JSON 解析
  const enableForcedJSONParsing: boolean | undefined = transitional && transitional.forcedJSONParsing;
  const isJSON: boolean = this.responseType === 'json';

  // 如果数据存在且为字符串类型，并且请求的响应类型为 JSON 则进行强制解析
  if (data && typeof data === 'string' && ((enableForcedJSONParsing && !this.responseType) || isJSON)) {
    // 解析 JSON 失败是否抛出异常
    const enableSilentJSONParsing: boolean | undefined = transitional && transitional.silentJSONParsing;
    const enableStrictJSONParsing: boolean = !enableSilentJSONParsing && isJSON;

    try {
      return JSON.parse(data);
    } catch (error) {
      if (enableStrictJSONParsing) {
        if ((error as Error).name !== 'SyntaxError') {
          throw IrError.from(error as Error, (IrError as any).ERR_BAD_RESPONSE, this, null, (this as any).response); // 使用拦截器可能会将 response 写入 config 中
        }
        throw error;
      }
    }
  }

  return data;
}

export default transformResponse;
