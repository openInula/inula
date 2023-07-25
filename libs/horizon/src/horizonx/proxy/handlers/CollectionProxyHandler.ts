/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import { isWeakMap, isWeakSet, isSet } from '../../CommonUtils';
import { createWeakSetProxy } from './WeakSetProxy';
import { createSetProxy } from './SetProxy';
import { createWeakMapProxy } from './WeakMapProxy';
import { createMapProxy } from './MapProxy';

export function createCollectionProxy(
  rawObj: Object,
  listener: { current: (...args) => any },
  hookObserver = true
): Object {
  if (isWeakSet(rawObj)) {
    return createWeakSetProxy(rawObj, listener, hookObserver);
  }
  if (isSet(rawObj)) {
    return createSetProxy(rawObj, listener, hookObserver);
  }
  if (isWeakMap(rawObj)) {
    return createWeakMapProxy(rawObj, listener, hookObserver);
  }
  return createMapProxy(rawObj, listener, hookObserver);
}
