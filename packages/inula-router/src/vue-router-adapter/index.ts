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

import { VueRouter } from './Router';
import { NormalizedRouteRecord } from './types';

export { createWebHistory, createWebHashHistory } from './vueHistory';

export { createRouter, RouterProvider } from './RouterProvider';
export { default as RouterView } from './RouterView';
export { default as RouterLink } from './RouterLink';

export { useRoute, useRouter, useLink, useRouteWatch } from './hooks';

export {
  onBeforeRouteUpdate,
  onBeforeRouteLeave,
  onBeforeRouteUpdate as BeforeRouteUpdate,
  onBeforeRouteLeave as BeforeRouteLeave,
} from './componentGuards';

export { isNavigationFailure } from './routerError';

export { START_LOCATION } from './const';

// type for $api
declare global {
  interface Window {
    $router: VueRouter;
    $route: NormalizedRouteRecord;
  }
}
