var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { existsSync } from 'fs';
import { extname, join } from 'path';
import { parseRequireDeps, cleanRequireCache } from '../utils/util.js';
import deepmerge from 'deepmerge';
import { loadModule } from '../utils/loadModule.js';
const DEFAULT_CONFIG_FILES = ['.inula.ts', '.inula.js'];
export default class Config {
    constructor(opts) {
        this.cwd = opts.cwd || process.cwd();
        this.isLocal = opts.isLocal || process.env.NODE_ENV === 'development';
        this.logger = opts.logger;
    }
    getUserConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const configFile = this.getConfigFile();
            if (configFile === null) {
                this.logger.warn(`Can't find .inula.ts or .inula.js in ${this.cwd}`);
                return {};
            }
            this.configFile = configFile;
            if (configFile) {
                let envConfigFile = undefined;
                if (process.env.RUNNING_MODE) {
                    envConfigFile = this.addModePath(configFile, process.env.RUNNING_MODE);
                }
                // 配置文件的来源
                // 1、默认的configFile 如.inula.ts
                // 2、带环境变量的configFile 如.inula.cloud.ts
                // 3、dev模式 包含local 如.inula.local.ts
                const files = [configFile];
                if (envConfigFile && existsSync(envConfigFile)) {
                    files.push(envConfigFile);
                }
                if (this.isLocal) {
                    const localConfigFile = this.addModePath(configFile, 'local');
                    if (existsSync(localConfigFile)) {
                        files.push(localConfigFile);
                    }
                }
                this.logger.debug(`Find user config files ${files}`);
                // 依次加载配置文件中的依赖并刷新require中的缓存
                const requireDeps = files.reduce((deps, file) => {
                    deps = deps.concat(parseRequireDeps(file));
                    return deps;
                }, []);
                requireDeps.forEach(cleanRequireCache);
                const configs = yield this.requireConfigs(files);
                return this.mergeConfig(...configs);
            }
            else {
                return {};
            }
        });
    }
    getConfigFile() {
        const configFileList = DEFAULT_CONFIG_FILES.map(f => join(this.cwd, f));
        for (let configFile of configFileList) {
            if (existsSync(configFile)) {
                return configFile;
            }
        }
        return null;
    }
    addModePath(file, mode) {
        const ext = extname(file);
        return file.replace(new RegExp(`${ext}$`), `.${mode}${ext}`);
    }
    requireConfigs(configFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            const configs = [];
            for (const file in configFiles) {
                const content = yield loadModule(configFiles[file]);
                if (content) {
                    configs.push(content);
                }
            }
            return configs;
        });
    }
    mergeConfig(...configs) {
        let ret = {};
        for (const config of configs) {
            ret = deepmerge(ret, config);
        }
        return ret;
    }
}
