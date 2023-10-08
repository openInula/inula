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
import CustomAbortController from './ieCompatibility/CustomAbortController';
import { IrRequestConfig, IrResponse, Cancel } from '../types/interfaces';
import { Method, ResponseType } from '../types/types';

export const ieFetchRequest = (config: IrRequestConfig): Promise<IrResponse> => {
  return new Promise((resolve, reject) => {
    let {
      method = 'get',
      baseURL,
      url,
      params = null,
      data = null,
      headers = {},
      responseType,
      timeout = 0,
      timeoutErrorMessage,
      cancelToken = null,
      withCredentials = false,
    } = config;

    let controller: any;
    let signal;

    // 兼容处理 IE 浏览器AbortController
    if (window.AbortController) {
      controller = new AbortController();
      signal = controller.signal;
    } else {
      controller = new CustomAbortController();
      signal = controller.signal;
    }

    // 处理请求取消
    if (cancelToken) {
      cancelToken.promise.then((reason: Cancel) => {
        controller.abort();
        reject(reason);
      });
    }

    // 拼接URL
    if (baseURL) {
      url = `${baseURL}${url}`;
    }

    // 处理请求参数
    if (params) {
      const queryString = utils.objectToQueryString(params);
      url = `${url}?${queryString}`;
    }

    // GET HEAD 方法不允许设置body
    const options = {
      method,
      headers,
      body: data || null, // 防止用户在拦截器传入空字符串，引发 fetch 错误
      signal,
      credentials: withCredentials ? 'include' : 'omit',
    };

    if (timeout) {
      setTimeout(() => {
        controller.abort();
        reject(new Error(timeoutErrorMessage ?? `timeout of ${timeout}ms exceeded`));
      }, timeout);
    }

    if (!url) {
      return Promise.reject('URL is undefined!');
    }

    fetch(url, options as RequestInit)
      .then(response => {

        config.method = config.method!.toLowerCase() as Method;

        const responseData: IrResponse = {
          data: '',
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config,
          request: null,
          responseURL: response.url
        };

        // 根据 responseType 选择相应的解析方法
        let parseMethod;

        switch (responseType as ResponseType) {
          case 'arraybuffer':
            parseMethod = response.arrayBuffer();
            break;

          case 'blob':
            parseMethod = response.blob();
            break;

          // text 和 json 服务端返回的都是字符串 统一处理
          case 'text':
            parseMethod = response.text();
            break;

          // 显式指定返回类型
          case 'json':
            parseMethod = response.text().then((text: string) => {
              try {
                return JSON.parse(text);
              } catch (e) {
                // 显式指定返回类型 JSON解析失败报错
                reject('parse error');
              }
            });
            break;

          default:
            parseMethod = response.text().then((text: string) => {
              try {
                return JSON.parse(text);
              } catch (e) {
                // 默认为 JSON 类型，若JSON校验失败则直接返回服务端数据
                return text;
              }
            });
        }

        parseMethod
          .then((parsedData: any) => {
            responseData.data = parsedData;
            resolve(responseData);
          })
          .catch((error: IrError) => {
            if (error.name === 'AbortError') {
              reject(error.message);
            } else {
              reject(error);
            }
          });
      })
      .catch((error: IrError) => {
        if (error.name === 'AbortError') {
          reject(error.message);
        } else {
          reject(error);
        }
      });
  });
};
