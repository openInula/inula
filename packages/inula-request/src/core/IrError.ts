/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import utils from '../utils/commonUtils/utils';
import { IrErrorInterface, IrInstance, IrRequestConfig, IrResponse } from '../types/interfaces';

class IrError extends Error implements IrErrorInterface {
  code?: string;
  config?: IrRequestConfig;
  request?: IrInstance;
  response?: IrResponse;

  constructor(message: string, code?: string, config?: IrRequestConfig, request?: any, response?: IrResponse) {
    super(message);

    this.message = message;
    this.name = 'IrError';
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

  // 从现有的 Error 对象创建一个新的 IrError 对象
  static from(
    error: Error,
    code: string,
    config: IrRequestConfig,
    request: any,
    response: IrResponse,
    customProps?: Record<string, any>
  ): IrError {
    // 由传入的 Error 对象属性初始化 IrError 实例化对象
    const irError = new IrError(error.message, code, config, request, response);

    // 将现有的 Error 对象的属性复制到新创建的对象中
    utils.flattenObject(
      error,
      irError,
      obj => obj !== Error.prototype,
      prop => prop !== 'isIrError'
    );

    // 设置基本错误类型属性
    irError.name = error.name;

    if (customProps) {
      Object.assign(irError, customProps);
    }

    return irError;
  }
}

// 在 IrError 类的原型链中添加 Error 类的原型，使 IrError 成为 Error 的子类
Object.setPrototypeOf(IrError.prototype, Error.prototype);
Object.defineProperties(IrError.prototype, {
  toJSON: {
    value: IrError.prototype.toJSON,
  },
  isIrError: {
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
  'ERR_FETCH_FAILED',
];

const descriptors: PropertyDescriptorMap = errorTypes.reduce((acc, code) => {
  acc[code] = { value: code };
  return acc;
}, {} as PropertyDescriptorMap);

// 将 descriptors 对象中定义的属性添加到 IrError 类上
Object.defineProperties(IrError, descriptors);

// 在 IrError 类的原型上定义了一个名为 isIrError 的属性,用于判断错误对象是否为 IrError
Object.defineProperty(IrError.prototype, 'isIrError', { value: true });

// 判断输入值是否为 IrError
export const isIrError = (value: any) => !!value.isIrError;

export default IrError;
