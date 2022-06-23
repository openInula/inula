import { ReduxStoreHandler, ReduxAction, ReduxMiddleware } from '../types';

function createThunkMiddleware(extraArgument?: any): ReduxMiddleware {
  return (store: ReduxStoreHandler) => (next: (action: ReduxAction) => any) => (
    action:
      | ReduxAction
      | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)
  ) => {
    // This gets called for every action you dispatch.
    // If it's a function, call it.
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState.bind(store), extraArgument);
    }

    // Otherwise, just continue processing this action as usual
    return next(action);
  };
}

export const thunk = createThunkMiddleware();
// @ts-ignore
thunk.withExtraArgument = createThunkMiddleware;
