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

import { isWeakMap, isWeakSet, isSet } from '../../CommonUtils';
import { createWeakSetProxy } from './WeakSetProxy';
import { createSetProxy } from './SetProxy';
import { createWeakMapProxy } from './WeakMapProxy';
import { createMapProxy } from './MapProxy';

import { CurrentListener } from '../../types/ProxyTypes';

export function createCollectionProxy<T extends any>(rawObj: T, listener: CurrentListener) {
  if (isWeakSet(rawObj)) {
    return createWeakSetProxy(rawObj as WeakSet<any>, listener);
  }

  if (isSet(rawObj)) {
    return createSetProxy(rawObj as Set<any>, listener);
  }

  if (isWeakMap(rawObj)) {
    return createWeakMapProxy(rawObj as WeakMap<any, any>, listener);
  }

  return createMapProxy(rawObj as Map<any, any>, listener);
}
