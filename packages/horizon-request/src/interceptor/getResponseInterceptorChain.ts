import { FulfilledFn } from '../types/types';
import { InterceptorHandler } from '../types/interfaces';

function getResponseInterceptorChain(this: any) {
  const responseInterceptorChain: (FulfilledFn<any> | undefined)[] = [];
  this.interceptors.response.forEach((interceptor: InterceptorHandler<any>) => {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  return responseInterceptorChain;
}

export default getResponseInterceptorChain;
