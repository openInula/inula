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
import IrHeaders from '../core/IrHeaders';
import getJSONByFormData from '../utils/dataUtils/getJSONByFormData';
import getFormData from '../utils/dataUtils/getFormData';
import { Strategy } from '../types/types';

// 策略映射，用于根据数据类型处理和转换请求数据
const strategies: Record<string, Strategy> = {
  HTMLForm: data => {
    return new FormData(data);
  },
  FormData: (data, headers, hasJSONContentType: boolean) => {
    return hasJSONContentType ? JSON.stringify(getJSONByFormData(data)) : data;
  },
  StreamOrFileOrBlob: data => {
    return data;
  },
  URLSearchParams: (data, headers) => {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    }
    return data.toString();
  },
  MultipartFormData: (data, headers, isFileList: boolean) => {
    return getFormData(isFileList ? { 'files[]': data } : data);
  },
  JSONData: (data, headers) => {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return utils.stringifySafely(data);
  },
};

function transformRequest(data: any, headers: IrHeaders): any {
  const contentType = headers.get('Content-Type') || '';
  const hasJSONContentType = contentType.indexOf('application/json') > -1;
  const isObjectPayload = utils.checkObject(data);

  if (isObjectPayload && utils.checkHTMLForm(data)) {
    return strategies.HTMLForm(data, headers);
  }

  if (utils.checkFormData(data)) {
    return strategies.FormData(data, headers, hasJSONContentType);
  }

  if (utils.checkStream(data) || utils.checkFile(data) || utils.checkBlob(data)) {
    return strategies.StreamOrFileOrBlob(data, headers);
  }

  if (utils.checkURLSearchParams(data)) {
    return strategies.URLSearchParams(data, headers);
  }

  let isFileList: boolean;

  if (isObjectPayload) {
    if ((isFileList = utils.checkFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
      return strategies.MultipartFormData(data, headers, isFileList);
    }
  }

  if (isObjectPayload || hasJSONContentType) {
    return strategies.JSONData(data, headers);
  }

  return data;
}

export default transformRequest;
