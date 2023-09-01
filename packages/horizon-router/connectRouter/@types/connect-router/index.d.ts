export { getConnectedRouter } from './connectedRouter';
export declare const connectRouter: (history: import("../router").History<unknown>) => (state?: {
    location: Partial<import("../router").Location<unknown>> & {
        query?: Record<string, any>;
    };
    action: import("../history/types").Action;
}, { type, payload }?: {
    type?: import("./actions").ActionName;
    payload?: any;
}) => any;
export { routerMiddleware } from './dispatch';
