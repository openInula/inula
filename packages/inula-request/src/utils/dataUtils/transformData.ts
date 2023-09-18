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

import IrHeaders from '../../core/IrHeaders';
import defaultConfig from '../../config/defaultConfig';
import { IrRequestConfig, IrResponse } from '../../types/interfaces';

function transformData(inputConfig: IrRequestConfig, func: Function, response?: IrResponse) {
  const config = inputConfig || defaultConfig;
  const context = response || config;
  const headers = IrHeaders.from(context.headers);

  const transformedData = func.call(config, context.data, headers.normalize(), response ? response.status : undefined);
  headers.normalize();

  return transformedData;
}

export default transformData;
