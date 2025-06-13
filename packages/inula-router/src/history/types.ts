export type BaseOption = {
  basename?: string;
  getUserConfirmation?: ConfirmationFunc;
};

export interface HistoryProps<T = unknown> {
  readonly action: Action;

  readonly location: Location<T>;

  length: number;
}

export interface AgnosticHistory<T = unknown> extends HistoryProps<T> {
  createHref(path: Partial<Path>): string;

  push(to: To, state?: T): void;

  replace(to: To, state?: T): void;

  listen(listener: CommonListener<T>): () => void;

  // add listener for listen pop action
  addListener(listener: Listener<T>): () => void;

  // cancel all pop listeners
  destroy(): void;

  block(prompt: Prompt<T>): () => void;

  go(index: number): void;

  goBack(): void;

  goForward(): void;
}

export type History<T = unknown> = Omit<AgnosticHistory<T>, 'addListener' | 'destroy'>;

export interface LocationHandler<T> {
  locationHandler?: ((state?: Partial<HistoryState<T>>) => Location<T>) | null;
  baseHandler?: (() => string) | null;
}

export interface CreateLocationHandler<T> {
  locationHandler?: ((basename: string) => (state?: Partial<HistoryState<T>>) => Location<T>) | null;
  baseHandler?: ((basename: string) => () => string) | null;
}

export enum Action {
  pop = 'POP',
  push = 'PUSH',
  replace = 'REPLACE',
}

export enum EventType {
  PopState = 'popstate',
  HashChange = 'hashchange',
}

export enum PopDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}

export type Path = {
  pathname: string;

  search: string;

  hash: string;
};

export type HistoryState<T> = {
  state?: T;

  key: string;
};

export type DefaultStateType = unknown;

export type Location<T = unknown> = Path & HistoryState<T>;

export type To = string | Partial<Path>;

export interface CommonListener<T = unknown> {
  (navigation: Navigation<T>): void;
}

export interface ActionInfo {
  type: Action;
  direction: PopDirection;
  delta: number;
}

export interface PopListener {
  (to: string, from: string, information: ActionInfo): void;
}

export interface PopNavigation {
  to: string;
  from: string;
  information: ActionInfo;
}

export type Listener<S> =
  | {
      type: 'common';
      listener: CommonListener<S>;
    }
  | {
      type: 'pop';
      listener: PopListener;
    };

export interface Navigation<T = unknown> {
  action: Action;

  location: Location<T>;
}

export type Prompt<S> = string | boolean | null | ((location: Location<S>, action: Action) => void);

export type CallBackFunc = (isJump: boolean) => void;

export type ConfirmationFunc = (message: string, callBack: CallBackFunc) => void;

export interface TManager<S> {
  setPrompt(next: Prompt<S>): () => void;

  confirmJumpTo(
    location: Location<S>,
    action: Action,
    userConfirmationFunc: ConfirmationFunc,
    callBack: CallBackFunc
  ): void;
}
