import { ComponentType, FC, InulaElement, InulaNode, ReactiveRet, ChangeEvent, ChildrenType } from '@cloudsop/horizon';

type FN = () => void;

declare const useIsMounted: () => boolean;
declare const onBeforeMount: (fn: FN) => void;
declare function onMounted(fn: FN): void;
declare function onBeforeUpdate(fn: FN): void;
declare function onUpdated(fn: FN): void;
declare const onBeforeUnmount: (fn: FN) => void;
declare function onUnmounted(fn: FN): void;

interface AppContext {
  app: App;
  config: AppConfig;
  components: Record<string, any>;
  directives: Record<string, any>;
  provides: Record<string | symbol, any>;
}
interface AppConfig {
  globalProperties: Record<string, any>;
}
declare function createAppContext(): AppContext;
interface App<HostElement = any> {
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
type ObjectPlugin<Options = any[]> = {
  install: PluginInstallFunction<Options>;
};
type FunctionPlugin<Options = any[]> = PluginInstallFunction<Options> & Partial<ObjectPlugin<Options>>;
type Plugin<Options = any[]> = FunctionPlugin<Options> | ObjectPlugin<Options>;
declare function createApp(rootComponent: any, id?: string): App<any>;
declare function useGlobalProperties(): Record<string, any>;
declare function useGlobalProperties(name: string): any;
declare function useProvide(name: string): any;
declare function registerComponent(name: string, component: any): void;
declare function GlobalComponent({ componentName, ...otherProps }: { [x: string]: any; componentName: any }): any;
declare function registerDirective(name: string, directive: any): void;
declare function useDirectives(): Record<string, any>;
declare function defineAsyncComponent(loader: () => Promise<any>): (props: any) => any;
declare function emit<T extends Record<string, any>>(props: T, eventName: keyof T, ...args: Parameters<any>): void;
declare function getCurrentInstance(): any;

/**
 * Vue写法：<div v-click-outside:foo.bar="closePopup" v-focus class="popup">
 * Horizon写法：
 * <DirectiveComponent
 *   componentName={'div'}
 *   directives={[
 *     {
 *       name: 'click-outside',
 *       arg: 'foo',
 *       modifiers: { bar: true },
 *       value: closePopup,
 *     },
 *     {
 *       name: 'focus',
 *     },
 *   ]}
 *   class="popup"
 * >
 *   <div>child</div>
 * </DirectiveComponent>
 *
 * @param props 组件属性
 */
interface DirectiveBinding {
  value?: any;
  oldValue?: any;
  arg?: string;
  modifiers?: Record<string, boolean>;
}
interface Directive {
  bind?: (el: HTMLElement, binding: DirectiveBinding) => void;
  inserted?: (el: HTMLElement, binding: DirectiveBinding) => void;
  update?: (el: HTMLElement, binding: DirectiveBinding) => void;
  componentUpdated?: (el: HTMLElement, binding: DirectiveBinding) => void;
  unbind?: (el: HTMLElement, binding: DirectiveBinding) => void;
  beforeMount?: (el: HTMLElement, binding: DirectiveBinding) => void;
  mounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
  updated?: (el: HTMLElement, binding: DirectiveBinding) => void;
  beforeUnmount?: (el: HTMLElement, binding: DirectiveBinding) => void;
  unmounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
}
interface DirectiveComponentProps {
  children?: any;
  componentName: string | ComponentType<any>;
  directives: {
    name: string;
    value?: any;
    oldValue?: any;
    arg?: string;
    modifiers?: Record<string, boolean>;
  }[];
  registerDirectives?: Record<string, Directive>;
  [key: string]: any;
}
declare function DirectiveComponent(props: DirectiveComponentProps): {
  [x: string]: any;
  vtype: number;
  src: any;
  type: any;
  key: any;
  ref: any;
  props: any;
};

interface ConditionalProps {
  children?: any;
  condition: boolean;
}
declare const If: FC<ConditionalProps>;
declare const ElseIf: FC<ConditionalProps>;
declare const Else: FC<Omit<ConditionalProps, 'condition'>>;
interface ConditionalRendererProps {
  children?: any;
}
declare const ConditionalRenderer: FC<ConditionalRendererProps>;

interface ComponentsMap {
  [key: string]: ComponentType<any>;
}
interface DynamicComponentProps {
  is: string | ComponentType;
  components?: ComponentsMap;
  [key: string]: any;
}
/**
 * 对标Vue的动态组件，如：<component :is="Math.random() > 0.5 ? Foo : Bar" />
 * @param is
 * @param components
 * @param componentProps
 * @constructor
 */
declare function DynamicComponent({ is, components, ...componentProps }: DynamicComponentProps): InulaElement | null;

type AnyProps = Record<string, any>;
/**
 * Custom Hook to simulate Vue's fallthrough attributes functionality
 * @param props Component props
 * @param excludeList Parameters declared as props do not fallthrough
 * @returns fallthrough attributes
 */
declare function useAttrs<T extends AnyProps>(props: T, excludeList?: (keyof T)[]): Omit<T, keyof T & string>;
type Slots = {
  [key: string]: SlotFunction | InulaNode;
  default?: InulaNode;
};
type SlotFunction = (props: any) => InulaNode;
/**
 * Custom Hook to simulate Vue's useSlots functionality in React
 * @param props Component props
 * @returns An object containing all slots, including the default slot
 */
declare function useSlots(props: AnyProps): Slots;
declare function defineExpose<Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed): void;
type ObjectEmitsOptions = Record<string, ((...args: any[]) => any) | null>;
type EmitsOptions = ObjectEmitsOptions | string[];
declare function defineEmits<T extends EmitsOptions>(
  emits: T,
  props: AnyProps
): <K extends keyof T>(eventName: K, ...args: Parameters<any>) => void;

interface Data {
  [key: string]: any;
}
interface Option {
  default?: any | (() => any);
  type?: any;
}
interface Options {
  [key: string]: Option;
}
/**
 * 自定义 Hook，用于处理响应式属性
 * @param rawProps 原始属性对象或 null
 * @param options 可选的配置对象，用于设置默认值
 * @returns 响应式处理后的属性对象
 */
declare function useReactiveProps(rawProps: Data | null, options?: Options): ReactiveRet<Data>;
/**
 * 初始化属性对象
 * @param rawProps 原始属性对象或 null
 * @param options 配置对象，包含默认值
 * @returns 响应式处理后的属性对象
 */
declare function initProps(rawProps: Data | null, options: Options): ReactiveRet<Data>;
/**
 * 更新属性对象
 * @param props 待更新的属性对象
 * @param rawProps 包含新值的原始属性对象或 null
 * @param options 属性配置对象，包含默认值等信息
 */
declare function updateProps(props: Data, rawProps: Data | null, options: Options): void;

/**
 * 将函数和属性设置到指定实例上
 * @param {Object} instance - 目标实例对象
 * @param {Array|Object} items - 要设置的函数或 [key, value] 键值对数组，或者包含方法的对象
 * @returns {Object} 返回修改后的实例（支持链式调用）
 */
declare function setToInstance(instance: any, items: any): any;
declare function styles(...args: any[]): any;

interface SemiControlledInputProps {
  value?: {
    value: string;
  };
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}
/**
 * SemiControlledInput 组件
 *
 * 这是一个半受控的输入框组件，结合了受控和非受控组件的特性。
 * 它允许直接操作 DOM 来设置输入值，同时也响应 props 的变化。
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.valueObj - 包含输入值的对象，格式为 { value: string }，为了保证SemiControlledInput每次都刷新
 * @param {function} props.onChange - 输入值变化时的回调函数
 * @param {Object} props.[...otherProps] - 其他传递给 input 元素的属性
 *
 * @returns {JSX.Element} 返回一个 input 元素
 *
 * @example
 * <SemiControlledInput
 *   valueObj={{ value: 'initialValue' }}
 *   onChange={(e) => console.log('New value:', e.target.value)}
 *   placeholder="Enter text"
 * />
 */
declare const SemiControlledInput: FC<SemiControlledInputProps>;

declare function provide(name: any, value: any): void;
declare function inject(name: any, defaultValue?: any): any;

type StringRegexList$1 = String | RegExp | (String | RegExp)[];
interface KeepAliveProps$1 {
  children?: ChildrenType;
  max?: number;
  include?: StringRegexList$1;
  exclude?: StringRegexList$1;
}
declare function onActivated(listener: () => void): () => void;
declare function onDeactivated(listener: () => void): () => void;
declare const KeepAlivePro: ({ children, max, include, exclude }: KeepAliveProps$1) => any;

type StringRegexList = string | RegExp | (string | RegExp)[];
interface KeepAliveProps {
  include?: StringRegexList;
  max?: number;
  exclude?: StringRegexList;
  children?: any;
}
declare function KeepAlive({ children, exclude, include, max }: KeepAliveProps): any;

type LifeCycleFunc = () => unknown;
declare const useActivatePro: (func: LifeCycleFunc) => void;
declare const useUnActivatePro: (func: LifeCycleFunc) => void;

export {
  type App,
  type AppConfig,
  type AppContext,
  ConditionalRenderer,
  type Directive,
  DirectiveComponent,
  DynamicComponent,
  Else,
  ElseIf,
  type FunctionPlugin,
  GlobalComponent,
  If,
  KeepAlive,
  KeepAlivePro,
  type ObjectPlugin,
  type Plugin,
  SemiControlledInput,
  createApp,
  createAppContext,
  defineAsyncComponent,
  defineEmits,
  defineExpose,
  emit,
  getCurrentInstance,
  initProps,
  inject,
  onActivated,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onDeactivated,
  onMounted,
  onUnmounted,
  onUpdated,
  provide,
  registerComponent,
  registerDirective,
  setToInstance,
  styles,
  updateProps,
  useActivatePro,
  useAttrs,
  useDirectives,
  useGlobalProperties,
  useIsMounted,
  useProvide,
  useReactiveProps,
  useSlots,
  useUnActivatePro,
};
