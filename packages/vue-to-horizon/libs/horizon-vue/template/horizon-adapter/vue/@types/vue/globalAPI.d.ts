export interface AppContext {
    app: App;
    config: AppConfig;
    components: Record<string, any>;
    directives: Record<string, any>;
    provides: Record<string | symbol, any>;
}
export interface AppConfig {
    globalProperties: Record<string, any>;
}
export declare function createAppContext(): AppContext;
export interface App<HostElement = any> {
    _container: HostElement | null;
    _context: AppContext;
    rootComponent: any;
    version: string;
    config: AppConfig;
    use<Options extends unknown[]>(plugin: Plugin<Options>, ...options: Options): this;
    use<Options>(plugin: Plugin<Options>, options: Options): this;
    mixin(mixin: any): this;
    component(name: string, component: any): this;
    directive(name: string, directive: any): this;
    mount(rootContainer: HostElement | string): any;
    unmount(): void;
    provide<T>(key: string, value: T): this;
    runWithContext<T>(fn: () => T): T;
}
type PluginInstallFunction<Options = any[]> = Options extends unknown[] ? (app: App, ...options: Options) => any : (app: App, options: Options) => any;
export type ObjectPlugin<Options = any[]> = {
    install: PluginInstallFunction<Options>;
};
export type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>;
export type Plugin<Options = any[]> = FunctionPlugin<Options> | ObjectPlugin<Options>;
export declare function createApp(rootComponent: any, id?: string): App<any>;
export declare function useGlobalProperties(): Record<string, any>;
export declare function useGlobalProperties(name: string): any;
export declare function useProvide(name: string): any;
export declare function registerComponent(name: string, component: any): void;
export declare function GlobalComponent({ componentName, ...otherProps }: {
    [x: string]: any;
    componentName: any;
}): any;
export declare function registerDirective(name: string, directive: any): void;
export declare function useDirectives(): Record<string, any>;
export declare function defineAsyncComponent(loader: () => Promise<any>): (props: any) => any;
export declare function emit<T extends Record<string, any>>(props: T, eventName: keyof T, ...args: Parameters<any>): void;
export declare function getCurrentInstance(): any;
export declare function createVNode(component: any, props: any): {
    [x: string]: any;
    vtype: number;
    src: any;
    type: any;
    key: any;
    ref: any;
    props: any;
};
export declare function render(vnode: any, target: any): void;
export declare function useWindowSize(options?: {}): {
    width: any;
    height: any;
};
export {};
