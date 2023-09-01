import utils from '../utils/commonUtils/utils';
import { HrErrorInterface, HrInstance, HrRequestConfig, HrResponse } from '../types/interfaces';

class HrError extends Error implements HrErrorInterface {
  code?: string;
  config?: HrRequestConfig;
  request?: HrInstance;
  response?: HrResponse;

  constructor(message: string, code?: string, config?: HrRequestConfig, request?: any, response?: HrResponse) {
    super(message);

    this.message = message;
    this.name = 'HrError';
    this.code = code;
    this.config = config;
    this.request = request;
    this.response = response;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      config: utils.toJSONSafe(this.config as Record<string, any>),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null,
    };
  }

  // 从现有的 Error 对象创建一个新的 HrError 对象
  static from(
    error: Error,
    code: string,
    config: HrRequestConfig,
    request: any,
    response: HrResponse,
    customProps?: Record<string, any>
  ): HrError {
    // 由传入的 Error 对象属性初始化 HrError 实例化对象
    const hrError = new HrError(error.message, code, config, request, response);

    // 将现有的 Error 对象的属性复制到新创建的对象中
    utils.flattenObject(
      error,
      hrError,
      obj => obj !== Error.prototype,
      prop => prop !== 'isHrError'
    );

    // 设置基本错误类型属性
    hrError.name = error.name;

    if (customProps) {
      Object.assign(hrError, customProps);
    }

    return hrError;
  }
}

// 在 HrError 类的原型链中添加 Error 类的原型，使 HrError 成为 Error 的子类
Object.setPrototypeOf(HrError.prototype, Error.prototype);
Object.defineProperties(HrError.prototype, {
  toJSON: {
    value: HrError.prototype.toJSON,
  },
  isHrError: {
    value: true,
  },
});

const errorTypes = [
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL',
];

const descriptors: PropertyDescriptorMap = errorTypes.reduce((acc, code) => {
  acc[code] = { value: code };
  return acc;
}, {});

// 将 descriptors 对象中定义的属性添加到 HrError 类上
Object.defineProperties(HrError, descriptors);

// 在 HrError 类的原型上定义了一个名为 isHrError 的属性,用于判断错误对象是否为 HrError
Object.defineProperty(HrError.prototype, 'isHrError', { value: true });

// 判断输入值是否为 HrError
export const isHrError = (value: any) => !!value.isHrError;

export default HrError;
