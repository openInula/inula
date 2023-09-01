import { HrRequestConfig, InterceptorHandler, Interceptors } from '../types/interfaces';
import { FulfilledFn } from '../types/types';

// 获取请求拦截器链以及是否异步信息
function getRequestInterceptorsInfo(
  interceptors: Interceptors,
  config: HrRequestConfig | undefined,
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
