import { InulaElement, FunctionComponent, ComponentType, InulaNode } from '@cloudsop/horizon';

declare enum Action {
    pop = "POP",
    push = "PUSH",
    replace = "REPLACE"
}
declare enum PopDirection {
    back = "back",
    forward = "forward",
    unknown = ""
}
interface ActionInfo {
    type: Action;
    direction: PopDirection;
    delta: number;
}

type HistoryLocation = string;
type HistoryState = {
    [key: string | number]: HistoryStateValue;
};
type HistoryStateValue = string | number | boolean | null | undefined | HistoryState | HistoryStateValue[];
interface HistoryCallback {
    (to: HistoryLocation, from: HistoryLocation, information: ActionInfo): void;
}
interface VueHistory {
    readonly base: string;
    readonly location: HistoryLocation;
    readonly state: HistoryState;
    push(to: HistoryLocation, data?: HistoryState): void;
    replace(to: HistoryLocation, data?: HistoryState): void;
    go(delta: number, triggerListeners?: boolean): void;
    listen(cb: HistoryCallback): () => void;
    createHref(location: HistoryLocation): string;
    destroy(): void;
}
declare function createWebHistory(base?: string): VueHistory;
declare function createWebHashHistory(base?: string): VueHistory;

declare const START_LOCATION: RouteLocation;
declare const enum ErrorTypes {
    MATCHER_NOT_FOUND = 1,
    NAVIGATION_GUARD_REDIRECT = 2,
    NAVIGATION_ABORTED = 4,
    NAVIGATION_CANCELLED = 8,
    NAVIGATION_DUPLICATED = 16
}

interface NavigationFailure extends Error {
    type: ErrorTypes.NAVIGATION_CANCELLED | ErrorTypes.NAVIGATION_ABORTED | ErrorTypes.NAVIGATION_DUPLICATED;
    from: RouteLocation;
    to: RouteLocation;
}
declare function isNavigationFailure(error: any, type: ErrorTypes): boolean;

declare global {
    interface Window {
        $router: VueRouter;
        $route: NormalizedRouteRecord;
    }
}
type RouteQueryAndHash = {
    query?: LocationQuery;
    hash?: string;
};
type RouteLocationOptions = {
    replace?: boolean;
    force?: boolean;
    state?: HistoryState;
};
interface RouteLocationPathRaw extends RouteQueryAndHash, RouteLocationOptions {
    path: string;
}
type RouteRecordName$1 = string | symbol;
interface RouteLocationNamedRaw extends RouteQueryAndHash, RouteLocationOptions {
    name?: RouteRecordName$1;
    params?: Record<string, string | string[]>;
    path?: undefined;
}
interface MatcherLocation {
    name?: RouteRecordName$1 | null;
    path: string;
    params: Record<string, string | string[]>;
    meta: RouteMetaData;
    matched: NormalizedRouteRecord[];
}
interface RouteLocation extends MatcherLocation {
    fullPath: string;
    query: LocationQuery;
    hash: string;
    redirectedFrom?: RouteLocation | undefined;
}
interface NormalizedRouteRecord {
    path: RouteRecord['path'];
    redirected: RouteRecord['redirect'];
    name: RouteRecord['name'];
    component: RouteRecord['component'];
    children: RouteRecord['children'];
    meta?: RouteRecord['meta'];
    props: RouteRecord['props'];
    beforeEnter: RouteRecord['beforeEnter'];
    leaveGuards: Set<NavigationGuard>;
    updateGuards: Set<NavigationGuard>;
}
type LocationQueryValue = string | null;
type LocationQuery = Record<string, LocationQueryValue | LocationQueryValue[]>;
type RouteLocationRaw = string | RouteLocationPathRaw | RouteLocationNamedRaw;
type RouteMetaData = Record<string | number | symbol, unknown>;
type RouteRedirectOption = RouteLocationRaw | ((to: RouteLocation) => RouteLocationRaw);
type NavigationGuardReturn = void | Error | RouteLocationRaw | boolean;
interface NavigationGuardNext {
    (): void;
    (error: Error): void;
    (location: RouteLocationRaw): void;
    (valid: boolean | undefined): void;
}
interface NavigationGuard {
    (to: RouteLocation, from: RouteLocation, next: NavigationGuardNext): NavigationGuardReturn | Promise<NavigationGuardReturn>;
}
interface NavigationHook {
    (to: RouteLocation, from: RouteLocation, failure?: NavigationFailure | void): any;
}
interface ExceptListener {
    (error: any, to: RouteLocation, from: RouteLocation): any;
}

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

interface Parser<P> {
    regexp: RegExp;
    keys: string[];
    score: number[];
    parse(url: string): Matched<P> | null;
    compile(params: Params<P>): string;
}

type RouteRecordName = string | symbol;
interface AgnosticRouteRecord<T extends AgnosticRouteRecord<T>> {
    path: string;
    component?: unknown | undefined;
    meta?: Record<string | number | symbol, unknown>;
    strict?: boolean;
    sensitive?: boolean;
    name?: RouteRecordName;
    children?: T[];
}
interface RouteBranch<T extends AgnosticRouteRecord<T>, R = T> {
    path: T['path'];
    score: number[];
    component: T['component'];
    key: string[];
    regexp: RegExp;
    parse: Parser<unknown>['parse'];
    compile: Parser<unknown>['compile'];
    parent?: RouteBranch<T, R>;
    children: RouteBranch<T, R>[];
    raw: R;
}

interface App {
    rootComponent: InulaElement;
    component(name: string, component: FunctionComponent<any>): void;
    config: AppConfig;
}
interface AppConfig {
    globalProperties: Record<string, any>;
}
interface VueRouter {
    readonly currentRoute: RouteLocation;
    readonly option: RouterOptions;
    listening: boolean;
    addRoute(route: RouteRecord): () => void;
    removeRoute(name: RouteRecordName$1): void;
    hasRoute(name: RouteRecordName$1): boolean;
    getRoutes(): RouteBranch<RouteRecord, NormalizedRouteRecord>[];
    resolve(to: Readonly<RouteLocationRaw>, from?: Readonly<RouteLocation>): RouteLocation;
    push(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;
    replace(to: RouteLocationRaw): Promise<NavigationFailure | void | undefined>;
    go(delta: number): void;
    back(): void;
    forward(): void;
    beforeEach(guard: NavigationGuard): () => void;
    beforeResolve(guard: NavigationGuard): () => void;
    afterEach(guard: NavigationHook): () => void;
    onError(handler: ExceptListener): () => void;
    isReady(): Promise<void>;
    install(app: App): void;
}
interface RouterMatchOption {
    sensitive?: boolean;
    strict?: boolean;
    start?: boolean;
    end?: boolean;
}
type RouteRecordOption = Omit<RouterMatchOption, 'start' | 'end'>;
interface RouteRecordBase extends RouteRecordOption {
    path: string;
    redirect?: RouteRedirectOption;
    alias?: string | string[];
    name?: RouteRecordName$1;
    meta?: RouteMetaData;
    children?: unknown[];
    props?: boolean | Record<string, unknown>;
    beforeEnter?: NavigationGuard | NavigationGuard[];
}
interface RouteRecordSingleView extends RouteRecordBase {
    component: ComponentType<any>;
    children?: never;
}
interface RouteRecordWithChildren extends RouteRecordBase {
    component: ComponentType<any>;
    children: RouteRecord[];
}
interface RouteRecordRedirect extends RouteRecordBase {
    redirect?: RouteRedirectOption;
    component?: never;
    props?: never;
    children?: never;
}
type RouteRecord = RouteRecordSingleView | RouteRecordWithChildren | RouteRecordRedirect;
interface RouterOptions extends RouteRecordOption {
    history: VueHistory;
    routes: RouteRecord[];
    linkActiveClass?: string;
    linkExactActiveClass?: string;
}

interface RouterProviderProps {
    router: VueRouter;
    children: InulaNode;
}
declare function createRouter(option: RouterOptions): VueRouter;
declare function RouterProvider(props: RouterProviderProps): any;

declare function RouterView(): any;

interface RouterLinkProps {
    to: string;
    replace?: boolean;
    activeClass?: string;
    exactActiveClass?: string;
    children?: InulaNode;
    [key: string]: any;
}
declare function RouterLink(props: RouterLinkProps): any;

declare function useRouter(): VueRouter;
declare function useRoute(): RouteLocation;
declare function useLink(props: Pick<RouterLinkProps, 'to' | 'replace'>): {
    route: RouteLocation;
    navigate: (e: MouseEvent) => Promise<void | NavigationFailure>;
    isActive: boolean;
    isExactActive: boolean;
};
interface WatchCallback {
    (newRouteLocation: RouteLocation, oldRouteLocation: RouteLocation): void;
}
interface WatchConfig {
    immediate: boolean;
}
declare function useRouteWatch(callback: WatchCallback, config?: WatchConfig): () => void;

declare function onBeforeRouteLeave(leaveGuard: NavigationGuard): void;
declare function onBeforeRouteUpdate(updateGuard: NavigationGuard): void;

declare global {
    interface Window {
        $router: VueRouter;
        $route: NormalizedRouteRecord;
    }
}

export { onBeforeRouteLeave as BeforeRouteLeave, onBeforeRouteUpdate as BeforeRouteUpdate, RouterLink, RouterProvider, RouterView, START_LOCATION, createRouter, createWebHashHistory, createWebHistory, isNavigationFailure, onBeforeRouteLeave, onBeforeRouteUpdate, useLink, useRoute, useRouteWatch, useRouter };
