import PluginAPI, { IOpts } from './PluginAPI.js';
import { IHook, ICommand } from '../types/types.js';
import Hub from '../core/Hub';
import { Logger } from '../utils/logger.js';
interface pluginManagerOpts {
    cwd: string;
    hub: Hub;
    logger: Logger;
}
export interface IPlugin {
    id: string;
    key: string;
    path: string;
    apply: Function;
}
export default class Plugin {
    cwd: string;
    builtInPlugins: string[];
    userPlugins: string[];
    commands: {
        [name: string]: ICommand | string;
    };
    hooksByPluginPath: {
        [id: string]: IHook[];
    };
    hooks: {
        [key: string]: IHook[];
    };
    store: {
        [key: string]: any;
    };
    hub: Hub;
    logger: Logger;
    registerFunction: Function[];
    [key: string]: any;
    constructor(opts: pluginManagerOpts);
    getPluginPaths(builtInPlugins: string[], userPlugins: string[] | undefined): string[];
    setStore(name: string, initialValue: any): void;
    register(builtInPlugins: string[], userPlugins: string[] | undefined): Promise<void>;
    createPluginAPI(opts: IOpts): PluginAPI;
    initHook(): void;
}
export {};
