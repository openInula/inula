import resolve from 'resolve';
import chalk from 'chalk';
import PluginAPI, { IOpts } from './PluginAPI.js';
import { IHook, ICommand } from '../types/types.js';
import Hub from '../core/Hub';
import { loadModule } from '../utils/loadModule.js';
import { Logger } from '../utils/logger.js';

interface pluginManagerOpts {
  cwd: string;
  hub: Hub;
  logger: Logger;
}

interface PluginObj {
  path: string;
  api: PluginAPI;
}

export interface IPlugin {
  id: string;
  key: string;
  path: string;
  apply: Function;
}

export default class Plugin {
  cwd: string;
  builtInPlugins: string[] = [];
  userPlugins: string[] = [];
  commands: {
    [name: string]: ICommand | string;
  } = {};
  hooksByPluginPath: {
    [id: string]: IHook[];
  } = {};
  hooks: {
    [key: string]: IHook[];
  } = {};
  store: {
    [key: string]: any;
  } = {};
  hub: Hub;
  logger: Logger;
  registerFunction: Function[] = [];
  // 解决调用this[props]时ts提示属性未知
  [key: string]: any;

  constructor(opts: pluginManagerOpts) {
    this.cwd = opts.cwd || process.cwd();
    this.hub = opts.hub;
    this.logger = opts.logger;
  }

  getPluginPaths(builtInPlugins: string[], userPlugins: string[] | undefined): string[] {
    const paths: string[] = [];
    paths.push(...builtInPlugins);
    if (userPlugins) {
      paths.push(...userPlugins);
    }

    // 获取所有插件文件的绝对路径
    const absPaths: string[] = paths.map(path => {
      return resolve.sync(path, {
        basedir: this.cwd,
        extensions: ['.js', '.ts'],
      });
    });

    return absPaths;
  }

  setStore(name: string, initialValue: any) {
    const store = this.store;
    if (this.store[name]) {
      return;
    }
    store[name] = initialValue;
  }

  async register(builtInPlugins: string[], userPlugins: string[] | undefined) {
    const paths = this.getPluginPaths(builtInPlugins, userPlugins);
    this.hub.pluginPaths = paths;

    const objs: PluginObj[] = paths.map(path => {
      const api: PluginAPI = this.createPluginAPI({
        path,
        manager: this,
        logger: this.logger,
      });
      return {
        path,
        api,
      };
    });
    
    for (const obj of objs) {
      const module: Function | undefined = await loadModule(obj.path);
      if (module) {
        try {
          module(obj.api);
        } catch (err: unknown) {
          if (err instanceof Error) {
            this.logger.error(chalk.red(err.message));
            if (err.stack) {
              this.logger.error(err.stack);
            }
          }
        }
      }
    }
  }

  // todo 给API换个名字
  createPluginAPI(opts: IOpts): PluginAPI {
    const pluginAPI = new PluginAPI(opts);

    // 为PluginAPI添加代理
    // 除了PluginAPI自有的方法之外，为开发者提供更丰富的api
    return new Proxy(pluginAPI, {
      get: (target: PluginAPI, prop: string) => {
        if (['userConfig', 'devBuildConfig', 'buildConfig', 'compileMode', 'packageJson', 'cwd'].includes(prop)) {
          return typeof this.hub[prop] === 'function' 
            ? this.hub[prop].bind(this.hub) 
            : this.hub[prop];
        }

        if (['setStore', 'logger', 'commands'].includes(prop)) {
          return typeof this[prop] === 'function' 
            ? this[prop].bind(this) 
            : this[prop];
        }

        return target[prop];
      },
    });
  }

  initHook() {
    Object.keys(this.hooksByPluginPath).forEach(path => {
      const hooks = this.hooksByPluginPath[path];
      hooks.forEach(hook => {
        const { name } = hook;
        hook.pluginId = path;
        if (!this.hooks[name]) {
          this.hooks[name] = [];
        }
        this.hooks[name].push(hook);
      });
    });
  }
}
