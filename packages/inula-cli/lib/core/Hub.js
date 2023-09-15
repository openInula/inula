var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { join, isAbsolute } from 'path';
import Config from '../config/Config.js';
import { ServiceStage } from '../enum/enum.js';
import Plugin from '../plugin/Plugin.js';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { Logger, LogLevel } from '../utils/logger.js';
import { loadModule } from '../utils/loadModule.js';
import readDirectory from '../utils/readDirectory.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPkg } from '../utils/loadPkg.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
export default class Hub {
    constructor(opts) {
        this.userConfig = {};
        this.stage = ServiceStage.uninitialized;
        this.buildConfig = [];
        this.buildConfigPath = [];
        this.devBuildConfig = {};
        this.compileMode = '';
        this.builtInPlugins = [];
        this.pluginPaths = [];
        this.devProxy = null;
        this.setStage(ServiceStage.constructor);
        this.cwd = opts.cwd || process.cwd();
        this.env = process.env.NODE_ENV;
        if (!opts.logger) {
            this.logger = new Logger(LogLevel.INFO);
        }
        else {
            this.logger = opts.logger;
        }
        this.packageJson = loadPkg(path.join(this.cwd, './package.json'));
        this.configManager = new Config({
            cwd: this.cwd,
            isLocal: this.env === 'development',
            logger: this.logger,
        });
        this.pluginManager = new Plugin({
            cwd: this.cwd,
            hub: this,
            logger: this.logger,
        });
    }
    setStage(stage) {
        this.stage = stage;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setStage(ServiceStage.init);
            // 获取用户配置
            this.userConfig = yield this.configManager.getUserConfig();
            // 设置编译模式
            this.setCompileMode();
            // 获取编译配置
            yield this.analyzeBuildConfig();
            this.setStage(ServiceStage.initPlugins);
            this.builtInPlugins = this.getBuiltInPlugins();
            yield this.pluginManager.register(this.builtInPlugins, this.userConfig.plugins);
            this.setStage(ServiceStage.initHooks);
            this.pluginManager.initHook();
        });
    }
    getBuiltInPlugins() {
        return readDirectory(path.resolve(__dirname, '../builtInPlugins'));
    }
    run({ command, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            args._ = args._ || [];
            if (args._[0] === command) {
                args._.shift();
            }
            this.args = args;
            yield this.init();
            this.setStage(ServiceStage.run);
            return this.runCommand({ command, args });
        });
    }
    runCommand({ command, args }) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug(`run command ${command}`);
            const commands = typeof this.pluginManager.commands[command] === 'string'
                ? this.pluginManager.commands[this.pluginManager.commands[command]]
                : this.pluginManager.commands[command];
            if (commands === undefined) {
                this.logger.error(`Invalid command ${command}`);
                return;
            }
            const { fn } = commands;
            return fn(args, this.pluginManager.store[command]);
        });
    }
    setCompileMode() {
        this.compileMode = this.userConfig.compileMode || 'webpack';
        this.logger.debug(`current compile mode is ${this.compileMode}`);
    }
    analyzeBuildConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userConfig.devBuildConfig) {
                let { name, path, env } = this.userConfig.devBuildConfig;
                path = isAbsolute(path) ? path : join(process.cwd(), path);
                if (!existsSync(path)) {
                    this.logger.warn(`Cant't find dev build config. Path is ${path}`);
                    return;
                }
                this.logger.debug(`Find dev build config. Path is ${path}`);
                let bc = yield loadModule(path);
                if (bc == undefined) {
                    return;
                }
                let finalBc = {};
                if (typeof bc === 'function') {
                    finalBc = bc(env);
                    this.devBuildConfig = finalBc;
                    return;
                }
                this.devBuildConfig = bc;
                if (this.userConfig.devBuildConfig.devProxy) {
                    this.devProxy = this.userConfig.devBuildConfig.devProxy;
                }
            }
            if (!this.userConfig.buildConfig) {
                switch (this.compileMode) {
                    case 'webpack':
                        this.buildConfigPath.push({ name: 'default', path: './webpack.config.js' });
                        break;
                    case 'vite':
                        this.buildConfigPath.push({ name: 'default', path: './vite.config.js' });
                        break;
                    default:
                        this.logger.warn(`Unknown compile mode ${this.compileMode}`);
                        break;
                }
            }
            else {
                this.userConfig.buildConfig.forEach((userBuildConfig) => {
                    // if (typeof userBuildConfig === 'string') {
                    //   const name = this.getConfigName(userBuildConfig);
                    //   this.buildConfigPath.push({name, path: userBuildConfig});
                    // }
                    if (typeof userBuildConfig === 'object') {
                        // const name = userBuildConfig.name;
                        // const path = userBuildConfig.path;
                        this.buildConfigPath.push(userBuildConfig);
                    }
                });
            }
            this.buildConfigPath.forEach((config) => __awaiter(this, void 0, void 0, function* () {
                let { name, path } = config;
                path = isAbsolute(path) ? path : join(process.cwd(), path);
                if (!existsSync(path)) {
                    this.logger.warn(`Cant't find build config. Path is ${path}`);
                    return;
                }
                this.logger.debug(`Find build config. Path is ${path}`);
                let bc = yield loadModule(path);
                if (bc == undefined) {
                    return;
                }
                let finalBc = {};
                if (typeof bc === 'function') {
                    finalBc = bc(config.env);
                    this.buildConfig.push({ name: name, config: finalBc });
                    return;
                }
                this.buildConfig.push({ name: name, config: bc });
            }));
        });
    }
    getConfigName(name) {
        name = name.replace('webpack.', '');
        name = name.replace('.js', '');
        name = name.replace('.ts', '');
        return name;
    }
}
