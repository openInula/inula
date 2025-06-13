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

import { isObject } from '../CommonUtils';
import { RAW_VALUE } from '../Constants';

export function readonlyProxy<T extends Record<string, any>>(rawObj: T): ProxyHandler<T> {
  return new Proxy(rawObj, {
    get(rawObj, property, receiver) {
      if (property === RAW_VALUE) {
        return rawObj;
      }
      const result = Reflect.get(rawObj, property, receiver);

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
