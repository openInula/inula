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
import IrError from '../core/IrError';
import { IrRequestConfig, IrResponse, Cancel } from '../types/interfaces';
import { Method, ResponseType } from '../types/types';
import processUploadProgress from './processUploadProgress';
import processDownloadProgress from './processDownloadProgress';
import CancelError from '../cancel/CancelError';

export const fetchRequest = (config: IrRequestConfig): Promise<IrResponse> => {
  return new Promise((resolve, reject) => {
    const {
      method = 'GET',
      baseURL,
      params = null,
      headers = {},
      responseType,
      timeout = 0,
      timeoutErrorMessage,
      cancelToken = null,
      withCredentials = false,
      onUploadProgress = null,
      onDownloadProgress = null,
      paramsSerializer,
      fetchOption,
    } = config;

    let { signal, url, data = null } = config;

    // GET HEAD 方法不允许设置 body
    if (method === 'GET' || method === 'HEAD') {
      data = null;
    }

    const options: RequestInit = {
      method,
      headers,
      body: data || null, // 防止用户在拦截器传入空字符串，引发 fetch 错误
      credentials: withCredentials ? 'include' : 'omit',
      ...fetchOption,
    };

    if (typeof window !== 'undefined' && window.AbortController) {
      const controller = new AbortController();
      signal = config.signal ? config.signal : controller.signal;

      // 处理请求取消
      if (cancelToken) {
        cancelToken.promise.then((reason: Cancel) => {
          const cancelError = new CancelError(reason.message, config);
          controller.abort();
          reject(cancelError);
        });
      }

      if (timeout) {
        setTimeout(() => {
          controller.abort();
          const errorMsg = timeoutErrorMessage ?? `timeout of ${timeout}ms exceeded`;
          const error = new IrError(errorMsg, 'ECONNABORTED', config);
          reject(error);
        }, timeout);
      }

      options.signal = signal;
    }

    // 拼接URL
    if (baseURL) {
      url = `${baseURL}${url}`;
    }

    // 处理请求参数
    if (params) {
      const queryString = utils.objectToQueryString(utils.filterUndefinedValues(params), paramsSerializer);
      if (queryString) {
        url = `${url}${url!.includes('?') ? '&' : '?'}${queryString}`; // 支持用户将部分请求参数写在 url 中
      }
    }

    if (!url) {
      return Promise.reject('URL is undefined!');
    }

    if (onUploadProgress) {
      processUploadProgress(onUploadProgress, data, reject, resolve, method, url, config);
    } else {
      fetch(url, options)
        .then(response => {
          // 将 Headers 对象转换为普通 JavaScript 对象，可以使用 [] 访问具体响应头
          const headersObj: Record<string, string> = {};
          response.headers.forEach((value, name) => {
            headersObj[name] = value;
          });

          config.method = config.method!.toLowerCase() as Method;

          const responseData: IrResponse = {
            type: response.type,
            data: '',
            status: response.status,
            statusText: response.statusText,
            headers: headersObj,
            config,
            request: null,
            responseURL: response.url,
          };

          const responseBody = onDownloadProgress
            ? processDownloadProgress(response.body, response, onDownloadProgress)
            : response.body;

          // 根据 responseType 选择相应的解析方法
          let parseMethod;
          let contentType = headersObj['content-type'];
          contentType = utils.checkString(contentType) ? contentType.split(';')[0].trim() : '';

          switch (responseType as ResponseType) {
            case 'arraybuffer':
              parseMethod = readStream(responseBody, 'arraybuffer');
              break;

            case 'blob':
              parseMethod = readStream(responseBody, 'blob', contentType);
              break;
            // text 和 json 服务端返回的都是字符串 统一处理
            default:
              parseMethod = readStream(responseBody, 'text');
          }

          parseMethod
            .then((parsedData: any) => {
              responseData.data = parsedData;
              if (responseData.config.validateStatus!(responseData.status)) {
                resolve(responseData);
              } else {
                const error = new IrError(
                  responseData.statusText,
                  '',
                  responseData.config,
                  responseData.request,
                  responseData
                );
                reject(error);
              }
            })
            .catch((error: IrError) => {
              // fetch 在取消请求的极限场景会抛出 Failed to fetch 的 error，此时将其转为取消 error
              if (signal?.aborted) {
                const irError = new CancelError('request canceled', config);
                reject(irError);
              } else {
                const irError = new IrError(
                  error.message,
                  'ERR_FETCH_FAILED',
                  responseData.config,
                  responseData.request,
                  responseData
                );
                reject(irError);
              }
            });
        })
        .catch((error: IrError) => {
          if (error.name === 'AbortError') {
            const cancelError = new CancelError('request canceled', config);
            reject(cancelError);
          } else {
            const irError = new IrError(error.message, 'ERR_FETCH_FAILED');
            reject(irError);
          }
        });
    }
  });
};

async function readStream(stream: ReadableStream<Uint8Array> | null, type: 'arraybuffer'): Promise<ArrayBuffer>;
async function readStream(stream: ReadableStream<Uint8Array> | null, type: 'blob', contentType: string): Promise<Blob>;
async function readStream(stream: ReadableStream<Uint8Array> | null, type: 'text'): Promise<string>;
async function readStream(
  stream: ReadableStream<Uint8Array> | null,
  type: 'arraybuffer' | 'blob' | 'text',
  contentType?: string
): Promise<ArrayBuffer | Blob | string> {
  if (stream === null) {
    if (type === 'arraybuffer') {
      return new ArrayBuffer(0);
    } else if (type === 'blob') {
      return new Blob();
    } else {
      return '';
    }
  }
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }

  if (type === 'arraybuffer') {
    return concatenateArrayBuffers(chunks);
  } else if (type === 'blob') {
    return new Blob(chunks, { type: contentType });
  } else {
    const decoder = new TextDecoder();
    let result = '';
    for (const chunk of chunks) {
      result += decoder.decode(chunk, { stream: true });
    }
    result += decoder.decode();
    return result;
  }
}

function concatenateArrayBuffers(chunks: Uint8Array[]): ArrayBuffer {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(new Uint8Array(chunk), offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}
