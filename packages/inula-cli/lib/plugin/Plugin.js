var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import resolve from 'resolve';
import chalk from 'chalk';
import PluginAPI from './PluginAPI.js';
import { loadModule } from '../utils/loadModule.js';
export default class Plugin {
    constructor(opts) {
        this.builtInPlugins = [];
        this.userPlugins = [];
        this.commands = {};
        this.hooksByPluginPath = {};
        this.hooks = {};
        this.store = {};
        this.registerFunction = [];
        this.cwd = opts.cwd || process.cwd();
        this.hub = opts.hub;
        this.logger = opts.logger;
    }
    getPluginPaths(builtInPlugins, userPlugins) {
        const paths = [];
        paths.push(...builtInPlugins);
        if (userPlugins) {
            paths.push(...userPlugins);
        }
        // 获取所有插件文件的绝对路径
        const absPaths = paths.map(path => {
            return resolve.sync(path, {
                basedir: this.cwd,
                extensions: ['.js', '.ts'],
            });
        });
        return absPaths;
    }
    setStore(name, initialValue) {
        const store = this.store;
        if (this.store[name]) {
            return;
        }
        store[name] = initialValue;
    }
    register(builtInPlugins, userPlugins) {
        return __awaiter(this, void 0, void 0, function* () {
            const paths = this.getPluginPaths(builtInPlugins, userPlugins);
            this.hub.pluginPaths = paths;
            const objs = paths.map(path => {
                const api = this.createPluginAPI({
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
                const module = yield loadModule(obj.path);
                if (module) {
                    try {
                        module(obj.api);
                    }
                    catch (err) {
                        if (err instanceof Error) {
                            this.logger.error(chalk.red(err.message));
                            if (err.stack) {
                                this.logger.error(err.stack);
                            }
                        }
                    }
                }
            }
        });
    }
    // todo 给API换个名字
    createPluginAPI(opts) {
        const pluginAPI = new PluginAPI(opts);
        // 为PluginAPI添加代理
        // 除了PluginAPI自有的方法之外，为开发者提供更丰富的api
        return new Proxy(pluginAPI, {
            get: (target, prop) => {
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
