import { FulfilledFn } from '../types/types';
import { HrRequestConfig } from '../types/interfaces';

// 处理含有异步拦截器情况
function handleAsyncInterceptor(
  processFunc: (value: any) => any,
  requestInterceptorChain: (FulfilledFn<any> | undefined)[],
  responseInterceptorChain: (FulfilledFn<any> | undefined)[],
  mergedConfig: HrRequestConfig
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
