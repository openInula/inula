import { ActionMessage, ActionName } from './actions';
import { History } from '../history/types';

// 定义connect-router对应的redux dispatch函数
export function routerMiddleware(history: History) {
  return function(_: any) {
    return function(next: any) {
      return function(action: ActionMessage) {
        if (action.type !== ActionName.CALL_HISTORY_METHOD) {
          return next(action);
        }
        const { payload: { method, args } } = action;
        if (method in history) {
          (history as any)[method](...args);
        }
      };
    };
  };
}
