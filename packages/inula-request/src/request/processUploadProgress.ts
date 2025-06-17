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

import { IrProgressEvent, IrRequestConfig, IrResponse } from '../types/interfaces';
import IrError from '../core/IrError';
import CancelError from '../cancel/CancelError';
import { calculateTransRate } from '../utils/dataUtils/calculateTransRate';

function processUploadProgress(
  onUploadProgress: (progressEvent: IrProgressEvent) => void,
  data: FormData,
  reject: (reason?: any) => void,
  resolve: (value: PromiseLike<IrResponse> | IrResponse) => void,
  method: string,
  url: string | undefined,
  config: IrRequestConfig
) {
  if (onUploadProgress) {
    const handleUploadProgress = () => {
      const xhr = new XMLHttpRequest();
      let loadedBytes = 0;
      const calculate = calculateTransRate(50, 250);

      // 添加 progress 事件监听器
      xhr.upload.addEventListener('progress', event => {
        const loaded = event.loaded;
        const total = event.lengthComputable ? event.total : undefined;
        const progressBytes = loaded - loadedBytes;
        const rate = calculate(progressBytes);
        const inRange = total && loaded <= total;
        loadedBytes = loaded;
        const feedback = {
          loaded,
          total,
          progress: total ? loaded / total : undefined,
          bytes: progressBytes,
          rate: rate ?? undefined,
          estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
          event,
          upload: true,
        };
        // 可以计算上传进度
        onUploadProgress!(feedback);
      });

      // 添加 readystatechange 事件监听器，当 xhr.readyState 变更时执行回调函数
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
          let parsedText;
          try {
            switch (xhr.responseType) {
              case 'json':
                parsedText = JSON.parse(xhr.responseText);
                break;
              case 'text':
              default:
                parsedText = xhr.responseText;
            }
          } catch (e) {
            const responseData: IrResponse = {
              type: 'default',
              data: parsedText,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: xhr.getAllResponseHeaders(),
              config: config,
              request: xhr,
            };
            const error = new IrError('parse error', '', config, xhr, responseData);
            reject(error);
          }
          const response: IrResponse = {
            type: 'default',
            data: parsedText,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders(),
            config: config,
            request: xhr,
          };

          if (config.validateStatus!(xhr.status)) {
            // 如果 fetch 请求已经成功或者拒绝，则此处不生效
            resolve(response);
          } else {
            const error = new IrError(xhr.statusText, '', config, xhr, response);
            reject(error);
          }
        }
      });

      xhr.open(method, url as string);

      if (config.timeout) {
        xhr.timeout = config.timeout;
        xhr.ontimeout = function () {
          xhr.abort();
          const errorMsg = config.timeoutErrorMessage ?? `timeout of ${config.timeout}ms exceeded`;
          throw new IrError(errorMsg, '', config, xhr, undefined);
        };
      }

      for (const header in config.headers) {
        if (
          !['Content-Length', 'Accept-Encoding', 'User-Agent'].includes(header) && // 过滤不安全的请求头设置
          Object.prototype.hasOwnProperty.call(config.headers, header) // 不遍历请求头原型上的方法
        ) {
          xhr.setRequestHeader(header, config.headers[header]);
        }
      }

      if (config.signal) {
        const onCanceled = () => {
          const irError = new CancelError('request canceled', config);
          reject(irError);
          xhr.abort();
        };

        if (config.signal.aborted) {
          onCanceled();
        } else {
          config.signal.addEventListener('abort', onCanceled);
        }
      }

      xhr.send(data);
    };

    handleUploadProgress(); // 启动文件上传过程
  }
}

export default processUploadProgress;
