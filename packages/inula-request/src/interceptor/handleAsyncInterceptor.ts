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

import { FulfilledFn } from '../types/types';
import { IrRequestConfig } from '../types/interfaces';

// 处理含有异步拦截器情况
function handleAsyncInterceptor(
  processFunc: (value: any) => any,
  requestInterceptorChain: (FulfilledFn<any> | undefined)[],
  responseInterceptorChain: (FulfilledFn<any> | undefined)[],
  mergedConfig: IrRequestConfig
): Promise<any> {
  // undefined 占位 rejected 回调函数
  const chain = [...requestInterceptorChain, processFunc, undefined, ...responseInterceptorChain];
  let promise = Promise.resolve(mergedConfig);

  for (let i = 0; i < chain.length; i += 2) {
    // 将拦截器使用Promise链进行链接
    promise = promise.then(chain[i], chain[i + 1]);
  }

  return promise;
}

export default handleAsyncInterceptor;
