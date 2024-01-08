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

import inulaRequest from './src/inulaRequest';
import useIR from './src/core/useIR/useIR';

const {
  create,
  request,
  get,
  post,
  put,
  ['delete']: propToDelete,
  head,
  options,
  InulaRequest,
  IrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isIrError,
  spread,
  IrHeaders,
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
} = inulaRequest;

export {
  create,
  request,
  get,
  post,
  put,
  propToDelete as delete,
  head,
  options,
  InulaRequest,
  IrError,
  CanceledError,
  isCancel,
  CancelToken,
  all,
  Cancel,
  isIrError,
  spread,
  IrHeaders,
  useIR,
  // 兼容axios
  Axios,
  AxiosError,
  AxiosHeaders,
  isAxiosError,
};

export { IrRequestConfig, IrResponse, IrInstance, CancelTokenSource, IrProgressEvent } from './src/types/interfaces';
export { Method, ResponseType } from './src/types/types';

export default inulaRequest;
