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

import { Location as HLocation } from '../history/types';

type Location<S = unknown> = Omit<HLocation<S>, 'key'>;

// ============================ history ============================

export { Location };
export type { History } from '../history/types';

export { createBrowserHistory } from '../history/browerHistory';
export { createHashHistory } from '../history/hashHistory';

export { default as __RouterContext } from './context';

// ============================ URL parser ============================

export { matchPath, generatePath } from './matcher/parser';

// ============================ Router Hooks ============================

export { useHistory, useLocation, useParams, useRouteMatch } from './hooks';

// ============================ Router function component ============================

export { default as Route } from './Route';
export { default as Router } from './Router';
export { default as Switch } from './Switch';
export { default as Redirect } from './Redirect';
export { default as Prompt } from './Prompt';
export { default as withRouter } from './withRouter';
export { default as HashRouter } from './HashRouter';
export { default as BrowserRouter } from './BrowserRouter';
export { default as Link } from './Link';
export { default as NavLink } from './NavLink';

// ============================ Router Types ============================

export type { RouteComponentProps, RouteChildrenProps, RouteProps } from './Route';
