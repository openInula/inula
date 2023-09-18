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

import InulaRequest from '../../core/InulaRequest';
import utils from '../commonUtils/utils';

function extendInstance(context: InulaRequest): (...arg: any) => any {
  const instance = utils.bind(InulaRequest.prototype.request, context);
  utils.extendObject(instance, InulaRequest.prototype, context, { includeAll: true });
  utils.extendObject(instance, context, null, { includeAll: true });
  return instance;
}

export default extendInstance;
