import Plugin from './Plugin.js';
import { IHook, ICommand } from '../types/types.js';
import { Logger } from '../utils/logger.js';
export interface IOpts {
    path: string;
    manager: Plugin;
    logger: Logger;
}
export default class PluginAPI {
    path: string;
    manager: Plugin;
    logger: Logger;
    [key: string]: any;
    constructor(opts: IOpts);
    register(hook: IHook): void;
    registerCommand(command: ICommand): void;
    registerHook(hook: IHook): void;
    registerMethod(fn: Function): void;
    applyHook(name: string, args?: any): Promise<any>;
}
