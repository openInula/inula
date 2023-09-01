import { FulfilledFn } from '../types/types';

// 处理同步拦截器
function handleSyncInterceptor(
  processFunc: (value: any) => any,
  mergedConfig: any,
  requestInterceptorChain: (FulfilledFn<any> | undefined)[],
  responseInterceptorChain: (FulfilledFn<any> | undefined)[]
): Promise<any> {
  let newConfig = mergedConfig;
  let promise;

  for (let i = 0; i < requestInterceptorChain.length; i += 2) {
    const fulfilled = requestInterceptorChain[i];
    const rejected = requestInterceptorChain[i + 1];

    // 返回拦截器处理后的 newConfig
    try {
      newConfig = fulfilled ? fulfilled(newConfig) : newConfig;
    } catch (error) {
      if (rejected) {
        rejected(error);
      }
      break;
    }
  }

  try {
    promise = processFunc(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  for (let i = 0; i < responseInterceptorChain.length; i += 2) {
    promise = promise.then(responseInterceptorChain[i], responseInterceptorChain[i + 1]);
  }

  return promise;
}

export default handleSyncInterceptor;
