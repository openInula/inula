export { thunk } from './reduxThunk';
export { Provider, useSelector, useStore, useDispatch, connect, createSelectorHook, createDispatchHook, } from './reduxReact';
export declare type ReduxStoreHandler = {
    reducer: (state: any, action: {
        type: string;
    }) => any;
    dispatch: (action: {
        type: string;
    }) => void;
    getState: () => any;
    subscribe: (listener: () => void) => () => void;
    replaceReducer: (reducer: (state: any, action: {
        type: string;
    }) => any) => void;
};
export declare type ReduxAction = {
    type: string;
    [key: string]: any;
};
export declare type ReduxMiddleware = (store: ReduxStoreHandler, extraArgument?: any) => (next: (action: ReduxAction) => any) => (action: ReduxAction | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)) => ReduxStoreHandler;
declare type Reducer = (state: any, action: ReduxAction) => any;
export declare function createStore(reducer: Reducer, preloadedState?: any, enhancers?: any): ReduxStoreHandler;
export declare function combineReducers(reducers: {
    [key: string]: Reducer;
}): Reducer;
export declare function applyMiddleware(...middlewares: ReduxMiddleware[]): (store: ReduxStoreHandler) => void;
declare type ActionCreator = (...params: any[]) => ReduxAction;
declare type ActionCreators = {
    [key: string]: ActionCreator;
};
export declare type BoundActionCreator = (...params: any[]) => void;
declare type BoundActionCreators = {
    [key: string]: BoundActionCreator;
};
declare type Dispatch = (action: any) => any;
export declare function bindActionCreators(actionCreators: ActionCreators, dispatch: Dispatch): BoundActionCreators;
export declare function compose(...middlewares: ReduxMiddleware[]): (store: ReduxStoreHandler, extraArgument: any) => any;
export declare function batch(fn: () => void): void;
