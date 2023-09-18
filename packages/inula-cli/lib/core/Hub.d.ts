import Config from '../config/Config.js';
import { BuildConfig, DevProxy, UserConfig } from '../types/types.js';
import { ServiceStage } from '../enum/enum.js';
import Plugin from '../plugin/Plugin.js';
import { Logger } from '../utils/logger.js';
import yargsParser from 'yargs-parser';
import { PackageJSON } from 'resolve';
interface HubOpts {
    cwd?: string;
    logger?: Logger;
}
export default class Hub {
    args: any;
    cwd: string;
    env: string | undefined;
    configManager: Config;
    userConfig: UserConfig;
    packageJson: PackageJSON;
    stage: ServiceStage;
    buildConfig: {
        name: string;
        config: object;
    }[];
    pluginManager: Plugin;
    buildConfigPath: BuildConfig[];
    devBuildConfig: object;
    compileMode: string;
    builtInPlugins: string[];
    pluginPaths: string[];
    devProxy: DevProxy | null;
    logger: Logger;
    [key: string]: any;
    constructor(opts: HubOpts);
    setStage(stage: ServiceStage): void;
    init(): Promise<void>;
    getBuiltInPlugins(): string[];
    run({ command, args }: {
        command: string | number;
        args: yargsParser.Arguments;
    }): Promise<void>;
    runCommand({ command, args }: {
        command: string | number;
        args: yargsParser.Arguments;
    }): Promise<void>;
    setCompileMode(): void;
    analyzeBuildConfig(): Promise<void>;
    getConfigName(name: string): string;
}
export {};
