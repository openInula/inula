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

import { IrRequestConfig, InterceptorHandler, Interceptors } from '../types/interfaces';
import { FulfilledFn } from '../types/types';

// 获取请求拦截器链以及是否异步信息
function getRequestInterceptorsInfo(
  interceptors: Interceptors,
  config: IrRequestConfig | undefined,
  isSync: boolean | undefined
) {
  const requestInterceptorChain: (FulfilledFn<any> | undefined)[] = [];

  interceptors.request.forEach((interceptor: InterceptorHandler<any>) => {
    if (typeof interceptor.runWhen === 'function' && !interceptor.runWhen(config)) {
      return;
    }

    // 只要有一个异步拦截器则拦截器链为异步
    isSync = isSync && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  return { requestInterceptorChain, isSync: isSync };
}

export default getRequestInterceptorsInfo;
