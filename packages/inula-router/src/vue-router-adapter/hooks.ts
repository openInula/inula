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

import { useContext, useEffect, useMemo, useRef } from 'openinula';
import { RouteContext, RouterContext } from './RouterContext';
import { guardEvent, includesParams, isSameRouteLocation } from './utils';
import type { RouterLinkProps } from './RouterLink';
import type { NavigationFailure } from './routerError';
import type { RouteLocation } from './types';
import type { VueRouterInternal } from './Router';

function useRouter() {
  return useContext(RouterContext);
}

function useRoute() {
  return useContext(RouteContext);
}

function useLink(props: Pick<RouterLinkProps, 'to' | 'replace'>) {
  const router = useContext(RouterContext);
  const currentRoute = useContext(RouteContext);

  const { to, replace } = props;

  const route = useMemo(() => router.resolve(to), [to]);

  const activeBranchIndex = useMemo<number>(() => {
    const matched = route.matched;
    const length = matched.length;

    const targetMatched = matched[length - 1];
    const currentMatched = currentRoute.matched;
    if (!targetMatched || currentMatched.length === 0) {
      return -1;
    }
    const index = currentMatched.findIndex(m => m === targetMatched);
    if (index > -1) {
      return index;
    }
    const parentRecordPath: string = matched[length - 2] ? matched[length - 2].path : '';

    if (
      length > 1 &&
      targetMatched.path === parentRecordPath &&
      currentMatched[currentMatched.length - 1].path !== parentRecordPath
    ) {
      return currentMatched.findIndex(m => m === matched[length - 2]);
    }
    return index;
  }, [route, currentRoute]);

  const isActive = activeBranchIndex > -1 && includesParams(currentRoute.params, route.params);
  const isExactActive =
    activeBranchIndex > -1 &&
    activeBranchIndex === currentRoute.matched.length - 1 &&
    isSameRouteLocation(currentRoute, route);

  function navigate(e: MouseEvent): Promise<void | NavigationFailure> {
    if (guardEvent(e)) {
      return router[replace ? 'replace' : 'push'](to);
    }
    return Promise.resolve();
  }

  return {
    route,
    navigate,
    isActive,
    isExactActive,
  };
}

interface WatchCallback {
  (newRouteLocation: RouteLocation, oldRouteLocation: RouteLocation): void;
}

interface WatchConfig {
  immediate: boolean;
}

function useRouteWatch(callback: WatchCallback, config?: WatchConfig): () => void {
  const router = useContext(RouterContext) as VueRouterInternal;
  const { immediate } = config || {};
  const isMount = useRef(false);
  const unListener = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!isMount.current) {
      unListener.current = router.subscribeRouteChange((to, from) => callback(to, from));
      if (immediate) {
        callback(router.currentRoute, router.currentRoute);
      }
      isMount.current = true;
    }
  }, []);
  return () => unListener.current && unListener.current();
}

export { useRouter, useRoute, useLink, useRouteWatch };
