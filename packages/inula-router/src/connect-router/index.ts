import { createConnectRouter } from './reducer';

export { getConnectedRouter } from './connectedRouter';
export const connectRouter = createConnectRouter();
export { routerMiddleware } from './dispatch';
export { push, go, replace } from './actions';