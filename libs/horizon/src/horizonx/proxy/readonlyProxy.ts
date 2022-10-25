/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * openGauss is licensed under Mulan PSL v2.
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

import { isObject } from '../CommonUtils';

export function readonlyProxy<T extends object>(target: T): ProxyHandler<T> {
  return new Proxy(target, {
    get(target, property, receiver) {
      const result = Reflect.get(target, property, receiver);
      try {
        if (isObject(result)) {
          return readonlyProxy(result);
        }
      } catch (err) {
        // 不处理
      }
      return result;
    },

    set() {
      throw Error('Trying to change readonly variable');
    },

    deleteProperty() {
      throw Error('Trying to change readonly variable');
    },
  });
}

export default readonlyProxy;
