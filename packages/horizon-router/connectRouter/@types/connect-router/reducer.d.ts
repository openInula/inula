import { ActionName } from './actions';
import { Action, History } from '../history/types';
import { Location } from '../router';
type LocationWithQuery = Partial<Location> & {
    query?: Record<string, any>;
};
type InitRouterState = {
    location: LocationWithQuery;
    action: Action;
};
type Payload = {
    type?: ActionName;
    payload?: any;
};
export declare function createConnectRouter(): (history: History) => (state?: InitRouterState, { type, payload }?: Payload) => any;
export {};
