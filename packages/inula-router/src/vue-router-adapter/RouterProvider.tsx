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

import { InulaNode, useLayoutEffect, useRef, useState } from '@cloudsop/horizon';
import { RouteContext, RouterContext } from './RouterContext';
import { initRouter, RouterOptions, VueRouter, VueRouterInternal } from './Router';
import { parseURL } from './utils';
import { RouteLocation } from './types';

interface RouterProviderProps {
  router: VueRouter;
  children: InulaNode;
}

export function createRouter(option: RouterOptions): VueRouter {
  return initRouter(option);
}

export function RouterProvider(props: RouterProviderProps) {
  const { children } = props;
  const router = props.router as VueRouterInternal;
  const {
    currentRoute,
    option: { history },
  } = router;

  const unListen = useRef<(() => void) | null>(null);
  const isMount = useRef(false);
  const detachObserver = useRef<(() => void) | null>(null);

  const urlLocation = parseURL(history.location);
  const [location, setLocation] = useState<RouteLocation>(currentRoute);

  if (!detachObserver.current) {
    detachObserver.current = router.subscribeRouteChange(to => {
      setLocation(to);
    });
  }

  // trigger navigator guards when first entry page
  if (location.fullPath !== urlLocation.fullPath || !isMount.current) {
    void router.push(history.location);
  }

  useLayoutEffect(() => {
    isMount.current = true;
    if (unListen.current) {
      unListen.current();
    }
    if (detachObserver.current) {
      detachObserver.current();
    }

    detachObserver.current = router.subscribeRouteChange(to => {
      setLocation(to);
    });

    unListen.current = history.listen(to => {
      if (isMount.current) {
        router.pop(to);
      }
    });

    return () => {
      if (unListen.current) {
        isMount.current = false;
        unListen.current();
        unListen.current = null;
      }
      if (detachObserver.current) {
        detachObserver.current();
        detachObserver.current = null;
      }
    };
  });

  return (
    <RouterContext.Provider value={router}>
      <RouteContext.Provider value={location}>{children}</RouteContext.Provider>
    </RouterContext.Provider>
  );
}
