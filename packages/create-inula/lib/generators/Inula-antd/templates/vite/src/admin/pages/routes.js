import Inula, { lazy } from 'inulajs';

export function getRoutes() {
  const routes = [
    {
      path: '/',
      component: lazy(() => import(/* webpackChunkName: 'layouts__index' */ '@/layouts/index.js')),
      childRoutes: [
        {
          path: '/404',
          component: lazy(() => import(/* webpackChunkName: 'p__404' */ '@/pages/404.jsx')),
        },
        {
          path: '/dashboard',
          component: lazy(() => import(/* webpackChunkName: 'p__dashboard__index' */ './dashboard/index.tsx')),
        },
        {
          path: '/user',
          component: lazy(() => import(/* webpackChunkName: 'p__user__index' */ '@/pages/user/index.tsx')),
        },
      ],
    },
  ];

  return routes;
}
