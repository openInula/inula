export interface IObserver {
  vNodeKeys: WeakMap<any, any>;

  keyVNodes: Map<any, any>;

  listeners: (() => void)[];

  useProp: (key: string) => void;

  addListener: (listener: () => void) => void;

  removeListener: (listener: () => void) => void;

  setProp: (key: string) => void;

  triggerChangeListeners: () => void;

  triggerUpdate: (vNode: any) => void;

  allChange: () => void;

  clearByVNode: (vNode: any) => void;
}

type UserActions<S extends object> = { [K: string]: StateFunction<S> };
type UserComputedValues<S extends object> = { [K: string]: StateFunction<S> };

type StateFunction<S extends object> = (state: S, ...args: any[]) => any;
type StoreActions<S extends object, A extends UserActions<S>> = { [K in keyof A]: A[K] };
type ComputedValues<S extends object, C extends UserComputedValues<S>> = { [K in keyof C]: C[K] };
type PostponedAction = (state: object, ...args: any[]) => Promise<any>;
type PostponedActions = { [key: string]: PostponedAction };

export type StoreHandler<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  $subscribe: (listener: () => void) => void;
  $unsubscribe: (listener: () => void) => void;
  $state: S;
  $config: StoreConfig<S, A, C>;
  $queue: StoreActions<S, A>;
  $actions: StoreActions<S, A>;
  $computed: StoreActions<S, A>;
  reduxHandler?: ReduxStoreHandler;
} & { [K in keyof S]: S[K] } &
  { [K in keyof A]: A[K] } &
  { [K in keyof C]: C[K] };

export type StoreConfig<S extends object, A extends UserActions<S>, C extends UserComputedValues<S>> = {
  state?: S;
  options?: { suppressHooks?: boolean };
  actions?: A;
  id?: string;
  computed?: C;
};

type ReduxStoreHandler = {
  reducer: (state: any, action: { type: string }) => any;
  dispatch: (action: { type: string }) => void;
  getState: () => any;
  subscribe: (listener: () => void) => (listener: () => void) => void;
};

type ReduxAction = {
  type: string;
};

type ReduxMiddleware = (
  store: ReduxStoreHandler,
  extraArgument?: any
) => (
  next: (action: ReduxAction) => any
) => (
  action:
    | ReduxAction
    | ((dispatch: (action: ReduxAction) => void, store: ReduxStoreHandler, extraArgument?: any) => any)
) => ReduxStoreHandler;
