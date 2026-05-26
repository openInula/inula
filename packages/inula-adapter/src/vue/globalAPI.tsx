/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import Inula, { createContext, lazy, Suspense, unmountComponentAtNode, useContext, vueReactive } from 'openinula';
import { vShow } from './vShow';

const { useInstance } = vueReactive;

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

export function createAppContext(): AppContext {
  return {
    app: null as any,
    config: {
      globalProperties: {},
    },
    components: {},
    directives: {},
    provides: Object.create(null),
  };
}

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

function AppWrapper(props) {
  const AppContext = props.appContext;

  return <AppContext.Provider value={props.value}>{props.root}</AppContext.Provider>;
}

const DEFAULT_APP_KEY = 'DEFAULT_APP_KEY';
const appMap = new Map<string, App>();
const AppContext = createContext<App | null>(null);

export function createApp(rootComponent, id: string = DEFAULT_APP_KEY) {
  const context = createAppContext();
  const installedPlugins = new WeakSet();
  let isMounted = false;

  if (typeof rootComponent === 'function') {
    rootComponent = Inula.createElement(rootComponent, {});
  }

  const app: App = (context.app = {
    _container: null,
    _context: context,

    rootComponent,
    version: '1.0.0',

    get config() {
      return context.config;
    },

    set config(v) {},

    use(plugin: Plugin, ...options: any[]) {
      if (installedPlugins.has(plugin)) {
        // 已经安装过了
      } else if (plugin && typeof plugin.install === 'function') {
        installedPlugins.add(plugin);
        plugin.install(app, ...options);
      } else if (typeof plugin === 'function') {
        installedPlugins.add(plugin);
        plugin(app, ...options);
      }

      return app;
    },

    mixin(mixin) {
      // 不支持
      console.log('Inula中暂时不支持mixin，请用Hook方式进行改造代码。');
      return app;
    },

    component(name, component) {
      const ccName = kebabToCamelCase(name);
      if (!component) {
        return context.components[ccName];
      }

      context.components[ccName] = component;
      return app;
    },

    directive(name, directive) {
      if (!directive) {
        return context.directives[name];
      }

      context.directives[name] = directive;
      return app;
    },

    mount(rootContainer) {
      if (!isMounted) {
        if (typeof rootContainer === 'string') {
          rootContainer = document.querySelector(rootContainer);
        }

        Inula.render(<AppWrapper root={app.rootComponent} appContext={AppContext} value={app} />, rootContainer);

        isMounted = true;
        app._container = rootContainer;
      }
    },

    unmount() {
      if (isMounted) {
        unmountComponentAtNode(app._container);

        delete app._container;
      }
    },

    provide(key, value) {
      context.provides[key as string | symbol] = value;

      return app;
    },

    runWithContext(fn) {
      // 不支持
      console.log('Inula中暂时不支持runWithContext，请手动修改相关的代码。');
      return fn();
    },
  });

  // 默认提供v-show指令
  app.directive('show', vShow);

  appMap.set(id, app);

  return app;
}

export function useGlobalProperties(): Record<string, any>;
export function useGlobalProperties(name: string): any;
export function useGlobalProperties(name?: string): any {
  const app = useContext(AppContext);

  if (name) {
    return app!.config.globalProperties[name];
  } else {
    return app!.config.globalProperties;
  }
}

export function useProvide(name: string) {
  const app = useContext(AppContext);
  return app!._context.provides[name];
}

export function registerComponent(name: string, component: any) {
  const app = appMap.get(DEFAULT_APP_KEY);
  app!.component(name, component);
}

function kebabToCamelCase(str: string) {
  return str
    .split('-')
    .map(sub => {
      return sub.charAt(0).toUpperCase() + sub.substr(1);
    })
    .join('');
}

export function GlobalComponent({ componentName, ...otherProps }) {
  const app = useContext(AppContext);
  componentName = kebabToCamelCase(componentName);
  const Comp = app!._context.components[componentName];

  if (!Comp) {
    throw new Error(`Component ${componentName} not found, please register it first.`);
  }

  return <Comp {...otherProps} />;
}

export function registerDirective(name: string, directive: any) {
  const app = appMap.get(DEFAULT_APP_KEY);
  app!.directive(name, directive);
}

export function useDirectives() {
  const app = useContext(AppContext);
  return app!._context.directives;
}

export function defineAsyncComponent(loader: () => Promise<any>) {
  const LazyComponent = lazy(loader);

  return props => (
    <Suspense fallback={null}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

export function emit<T extends Record<string, any>>(props: T, eventName: keyof T, ...args: Parameters<any>): void {
  let fn = props[eventName];

  if (typeof fn !== 'function' && typeof eventName === 'string' && !eventName.startsWith('on')) {
    const capitalizedEventName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    const onEventName = `on${capitalizedEventName}` as keyof T;
    fn = props[onEventName];
  }

  if (typeof fn === 'function') {
    fn(...args);
  } else {
    console.warn(`Attempted to emit event '${String(eventName)}' but no handler was defined.`);
  }
}

export function getCurrentInstance(): any {
  const instance = useInstance();
  const app = useContext(AppContext);

  return {
    vnode: {
      get el() {
        return instance['$el'];
      },
    },
    proxy: instance,
    appContext: {
      app,
    },
  };
}

export function useWindowSize(options = {}) {
  const {
    initialWidth = Number.POSITIVE_INFINITY,
    initialHeight = Number.POSITIVE_INFINITY,
    listenOrientation = true,
    includeScrollbar = true,
  } = options;

  const width = vueReactive.useReference(initialWidth);
  const height = vueReactive.useReference(initialHeight);

  function update() {
    if (window) {
      if (includeScrollbar) {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
      } else {
        width.value = window.document.documentElement.clientWidth;
        height.value = window.document.documentElement.clientHeight;
      }
    }
  }

  update();

  Inula.useEffect(() => {
    window.addEventListener('resize', update);
    if (listenOrientation) window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      if (listenOrientation) window.removeEventListener('orientationchange', update);
    };
  });

  return { width: width.value, height: height.value };
}

export function createVNode(component, props) {
  return Inula.createElement(component, props, props.children);
}

export function render(vnode, target) {
  Inula.render(vnode, target);
}
