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

import IrError from '../core/IrError';
import { IrRequestConfig } from '../types/interfaces';

class CancelError extends IrError {
  constructor(message: string | undefined | null, config: IrRequestConfig, request?: any) {
    const errorMessage = message || 'canceled';
    super(errorMessage, (IrError as any).ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }
}

export default CancelError;
