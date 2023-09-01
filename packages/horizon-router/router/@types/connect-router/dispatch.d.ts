import { ActionMessage } from './actions';
import { History } from '../history/types';
export declare function routerMiddleware(history: History): (_: any) => (next: any) => (action: ActionMessage) => any;
