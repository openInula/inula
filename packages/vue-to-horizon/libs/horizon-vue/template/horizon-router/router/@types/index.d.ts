import * as _cloudsop_horizon from '@cloudsop/horizon';
import { ComponentType, InulaNode, InulaElement, Ref } from '@cloudsop/horizon';

type BaseOption = {
  basename?: string;
  getUserConfirmation?: ConfirmationFunc;
};
interface HistoryProps<T = unknown> {
  readonly action: Action;
  readonly location: Location$1<T>;
  length: number;
}
interface AgnosticHistory<T = unknown> extends HistoryProps<T> {
  createHref(path: Partial<Path>): string;
  push(to: To, state?: T): void;
  replace(to: To, state?: T): void;
  listen(listener: CommonListener<T>): () => void;
  addListener(listener: Listener<T>): () => void;
  destroy(): void;
  block(prompt: Prompt$1<T>): () => void;
  go(index: number): void;
  goBack(): void;
  goForward(): void;
}
type History<T = unknown> = Omit<AgnosticHistory<T>, 'addListener' | 'destroy'>;
declare enum Action {
  pop = 'POP',
  push = 'PUSH',
  replace = 'REPLACE',
}
declare enum PopDirection {
  back = 'back',
  forward = 'forward',
  unknown = '',
}
type Path = {
  pathname: string;
  search: string;
  hash: string;
};
type HistoryState<T> = {
  state?: T;
  key: string;
};
type DefaultStateType = unknown;
type Location$1<T = unknown> = Path & HistoryState<T>;
type To = string | Partial<Path>;
interface CommonListener<T = unknown> {
  (navigation: Navigation<T>): void;
}
interface ActionInfo {
  type: Action;
  direction: PopDirection;
  delta: number;
}
interface PopListener {
  (to: string, from: string, information: ActionInfo): void;
}
type Listener<S> =
  | {
      type: 'common';
      listener: CommonListener<S>;
    }
  | {
      type: 'pop';
      listener: PopListener;
    };
interface Navigation<T = unknown> {
  action: Action;
  location: Location$1<T>;
}
type Prompt$1<S> = string | boolean | null | ((location: Location$1<S>, action: Action) => void);
type CallBackFunc = (isJump: boolean) => void;
type ConfirmationFunc = (message: string, callBack: CallBackFunc) => void;

type BrowserHistoryOption = {
  /**
   * forceRefresh为True时跳转时会强制刷新页面
   */
  forceRefresh?: boolean;
} & BaseOption;
declare function createBrowserHistory<S = DefaultStateType>(options: BrowserHistoryOption): History<S>;

type urlHashType = 'slash' | 'noslash';
type HashHistoryOption = {
  hashType?: urlHashType;
} & BaseOption;
declare function createHashHistory<S = DefaultStateType>(option?: HashHistoryOption): AgnosticHistory<S>;

type ParserOption = {
  caseSensitive?: boolean;
  strictMode?: boolean;
  exact?: boolean;
};
type ClearLeading<U extends string> = U extends `/${infer R}` ? ClearLeading<R> : U;
type ClearTailing<U extends string> = U extends `${infer L}/` ? ClearTailing<L> : U;
type ParseParam<Param extends string> = Param extends `:${infer R}`
  ? {
      [K in R]: string;
    }
  : {};
type MergeParams<OneParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
  readonly [Key in keyof OneParam | keyof OtherParam]?: string;
};
type ParseURLString<Str extends string> = Str extends `${infer Param}/${infer Rest}`
  ? MergeParams<ParseParam<Param>, ParseURLString<ClearLeading<Rest>>>
  : ParseParam<Str>;
type GetURLParams<U extends string> = ParseURLString<ClearLeading<ClearTailing<U>>>;

type Params<P> = {
  [K in keyof P]?: P[K];
};
type Matched<P = any> = {
  score: number[];
  params: Params<P>;
  path: string;
  url: string;
  isExact: boolean;
};
/**
 * @description 依次使用pathname与pattern进行匹配，根据匹配分数取得分数最高结果
 */
declare function matchPath<P = any>(
  pathname: string,
  pattern: string | string[],
  option?: ParserOption
): Matched<P> | null;
declare function generatePath<P = any>(path: string, params: Params<P>): string;

type RouterContextValue = {
  history: History;
  location: Location;
  match: Matched | null;
};
declare const RouterContext: _cloudsop_horizon.Context<RouterContextValue>;

declare function useHistory<S>(): History<S>;
declare function useLocation<S>(): Location<S>;
declare function useParams<P>(): Params<P> | {};
declare function useRouteMatch<P>(path?: string): Matched<P> | null;

type RouteComponentProps<P extends Record<string, any> = {}, S = unknown> = RouteChildrenProps<P, S>;
type RouteChildrenProps<P extends Record<string, any> = {}, S = unknown> = {
  history: History<S>;
  location: Location<S>;
  match: Matched<P> | null;
};
type RouteProps<P extends Record<string, any> = {}, Path extends string = string> = {
  location?: Location;
  component?: ComponentType<RouteComponentProps<P>> | ComponentType<any> | undefined;
  children?: ((props: RouteChildrenProps<P>) => InulaNode) | InulaNode;
  render?: (props: RouteComponentProps<P>) => InulaNode;
  path?: Path | Path[];
  exact?: boolean;
  sensitive?: boolean;
  strict?: boolean;
  computed?: Matched<P>;
};
declare function Route<Path extends string, P extends Record<string, any> = GetURLParams<Path>>(
  props: RouteProps<P, Path>
): any;

type RouterProps = {
  history: History;
  children?: InulaNode;
};
declare function Router<P extends RouterProps>(props: P): any;

type SwitchProps = {
  location?: Location;
  children?: InulaNode;
};
declare function Switch<P extends SwitchProps>(props: P): InulaElement | null;

type RedirectProps = {
  to: string | Partial<Location>;
  push?: boolean;
  path?: string;
  from?: string;
  exact?: boolean;
  strict?: boolean;
  readonly computed?: Matched | null;
};
declare function Redirect<P extends RedirectProps>(props: P): any;

type PromptProps = {
  message?: string | ((location: Partial<Location>, action: Action) => string | boolean);
  when?: boolean | ((location: Partial<Location>) => boolean);
};
declare function Prompt<P extends PromptProps>(props: P): any;

declare function withRouter<C extends ComponentType>(Component: C): (props: any) => any;

type BaseRouterProps = {
  basename: string;
  getUserConfirmation: ConfirmationFunc;
  children?: InulaNode;
};
type BrowserRouterProps = BaseRouterProps & {
  forceRefresh: boolean;
};
declare function BrowserRouter<P extends Partial<BrowserRouterProps>>(props: P): any;

type HashRouterProps = BaseRouterProps & {
  hashType: urlHashType;
};
declare function HashRouter<P extends Partial<HashRouterProps>>(props: P): any;

type LinkProps = {
  component?: ComponentType<any>;
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  replace?: boolean;
  tag?: string;
  /**
   * @deprecated
   * React16以后不再需要该属性
   **/
  innerRef?: Ref<HTMLAnchorElement>;
} & {
  [key: string]: any;
};
declare function Link<P extends LinkProps>(
  props: P
): {
  [x: string]: any;
  vtype: number;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
};

type NavLinkProps = {
  to: Partial<Location> | string | ((location: Location) => string | Partial<Location>);
  isActive?<
    P extends {
      [K in keyof P]?: string;
    },
  >(
    match: Matched<P> | null,
    location: Location
  ): boolean;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  className?: string | ((isActive: boolean) => string);
  activeClassName?: string;
  [key: string]: any;
} & Omit<LinkProps, 'className'>;
declare function NavLink<P extends NavLinkProps>(props: P): any;

type Location<S = unknown> = Omit<Location$1<S>, 'key'>;

export {
  BrowserRouter,
  HashRouter,
  type History,
  Link,
  type Location,
  NavLink,
  Prompt,
  Redirect,
  Route,
  type RouteChildrenProps,
  type RouteComponentProps,
  type RouteProps,
  Router,
  Switch,
  RouterContext as __RouterContext,
  createBrowserHistory,
  createHashHistory,
  generatePath,
  matchPath,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
  withRouter,
};
