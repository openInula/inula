import { Logger } from '../utils/logger.js';
import { UserConfig } from '../types/types.js';
interface ConfigOpts {
    cwd: string;
    isLocal?: boolean;
    logger: Logger;
}
export default class Config {
    cwd: string;
    isLocal: boolean;
    configFile?: string | null;
    logger: Logger;
    constructor(opts: ConfigOpts);
    getUserConfig(): Promise<UserConfig>;
    getConfigFile(): string | null;
    addModePath(file: string, mode: string): string;
    requireConfigs(configFiles: string[]): Promise<UserConfig[]>;
    mergeConfig(...configs: UserConfig[]): UserConfig;
}
export {};
