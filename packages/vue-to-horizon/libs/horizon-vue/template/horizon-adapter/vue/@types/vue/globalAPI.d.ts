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
type PluginInstallFunction<Options = any[]> = Options extends unknown[]
  ? (app: App, ...options: Options) => any
  : (app: App, options: Options) => any;
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
export declare function GlobalComponent({
  componentName,
  ...otherProps
}: {
  [x: string]: any;
  componentName: any;
}): any;
export declare function registerDirective(name: string, directive: any): void;
export declare function useDirectives(): Record<string, any>;
export declare function defineAsyncComponent(loader: () => Promise<any>): (props: any) => any;
export declare function useAppContext(): App<any>;
export declare function emit<T extends Record<string, any>>(
  props: T,
  eventName: keyof T,
  ...args: Parameters<any>
): void;
export type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
export type EmitsOptions = ObjectEmitsOptions | string[];
export declare function defineEmits<T extends EmitsOptions>(
  emits: T,
  props: Record<string, any>
): <K extends keyof T>(eventName: K, ...args: Parameters<any>) => void;
export declare function getCurrentInstance(): {
  vnode: any;
  proxy: any;
};
export declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(
  exposed?: Exposed
): void;
export declare function useSlots(): {};
export declare function useAttrs(): {};
export {};
