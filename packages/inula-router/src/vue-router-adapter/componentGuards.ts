/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import { NavigationGuard } from './types';
import { useContext, useLayoutEffect } from 'openinula';
import { CurrentRouteRecord } from './RouterContext';

function onBeforeRouteLeave(leaveGuard: NavigationGuard) {
  useRegisterGuards('leaveGuards', leaveGuard);
}

function onBeforeRouteUpdate(updateGuard: NavigationGuard) {
  useRegisterGuards('updateGuards', updateGuard);
}

type GuardType = 'leaveGuards' | 'updateGuards';

function useRegisterGuards(name: GuardType, guard: NavigationGuard) {
  const match = useContext(CurrentRouteRecord);

  useLayoutEffect(() => {
    match[name].add(guard);

    return () => {
      match[name].delete(guard);
    };
  }, []);

  return null;
}

export { onBeforeRouteLeave, onBeforeRouteUpdate };
