import { Location as HLocation } from '../history/types';
import { getConnectedRouter } from '../connect-router';

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

// ============================ Connect-router ============================

export { connectRouter, routerMiddleware } from '../connect-router';
export const ConnectedRouter = getConnectedRouter('Redux');
export const ConnectedHRouter = getConnectedRouter('HorizonXCompat');