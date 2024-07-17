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

import CancelError from '../cancel/CancelError';
import { IrRequestConfig, IrResponse } from '../types/interfaces';
import IrHeaders from '../core/IrHeaders';
import transformData from '../utils/dataUtils/transformData';
import { fetchRequest } from './fetchRequest';
import transformRequest from '../dataTransformers/transformRequest';
import transformResponse from '../dataTransformers/transformResponse';
import checkCancel from '../cancel/checkCancel';
import { ieFetchRequest } from './ieFetchRequest';
import utils from '../utils/commonUtils/utils';

export default function processRequest(config: IrRequestConfig): Promise<IrResponse> {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  // 拦截可能会传入普通对象
  config.headers = IrHeaders.from(config.headers as Record<string, any>);

  // 转换请求数据
  if (config.data) {
    config.data = transformData(config, transformRequest);
  }

  return (utils.isIE() ? ieFetchRequest : fetchRequest)(config)
    .then(response => {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }

      // 转换响应数据
      response.data = transformData(config, transformResponse, response);

      return response;
    })
    .catch(error => {
      if (config.signal?.aborted) {
        error.response = {
          data: null,
          headers: config.headers,
          status: 200,
          statusText: 'ok',
          config,
        };
      }

      if (!checkCancel(error)) {
        if (config.cancelToken) {
          config.cancelToken.throwIfRequested();
        }

        // 转换响应数据
        if (error && error.response) {
          error.response.data = transformData(config, transformResponse, error.response);
        }
      }

      return Promise.reject(error);
    });
}
