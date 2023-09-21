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

import InulaRequest from './core/InulaRequest';
import utils from './utils/commonUtils/utils';
import { CancelTokenStatic, IrInterface, IrRequestConfig } from './types/interfaces';
import defaultConfig from './config/defaultConfig';
import fetchLike from './request/ieCompatibility/fetchLike';
import CancelToken from './cancel/CancelToken';
import checkCancel from './cancel/checkCancel';
import IrError, { isIrError } from './core/IrError';
import buildInstance from './utils/instanceUtils/buildInstance';
import IrHeaders from './core/IrHeaders';
import CancelError from './cancel/CancelError';
import 'core-js/stable';

// 使用默认配置创建 ir 对象实例
const inulaRequest = buildInstance(defaultConfig as IrRequestConfig);

// 提供 Ir 类继承
inulaRequest.InulaRequest = InulaRequest as unknown as IrInterface;

// 创建 ir 实例的工厂函数
inulaRequest.create = InulaRequest.create;

// 提供取消请求令牌
inulaRequest.CancelToken = CancelToken as CancelTokenStatic;

inulaRequest.isCancel = checkCancel;

inulaRequest.Cancel = CancelError;

inulaRequest.all = utils.all;

inulaRequest.spread = utils.spread;

inulaRequest.default = inulaRequest;

inulaRequest.CanceledError = CancelError;

inulaRequest.IrError = IrError;

inulaRequest.isIrError = isIrError;

inulaRequest.IrHeaders = IrHeaders;

inulaRequest.defaults = defaultConfig as IrRequestConfig;

inulaRequest.Axios = InulaRequest;

inulaRequest.AxiosError = IrError;

inulaRequest.isAxiosError = isIrError;

inulaRequest.AxiosHeaders = IrHeaders;

export default inulaRequest;

// 兼容 IE 浏览器 fetch
if (utils.isIE()) {
  (window as any).fetch = fetchLike;
}
