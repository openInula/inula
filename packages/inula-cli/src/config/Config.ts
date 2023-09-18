/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
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

import { existsSync } from 'fs';
import { extname, join } from 'path';
import { parseRequireDeps, cleanRequireCache } from '../utils/util.js';
import deepmerge from 'deepmerge';
import { loadModule } from '../utils/loadModule.js';
import { Logger } from '../utils/logger.js';
import { UserConfig } from '../types/types.js';

interface ConfigOpts {
  cwd: string;
  isLocal?: boolean;
  logger: Logger;
}

const DEFAULT_CONFIG_FILES = ['.inula.ts', '.inula.js'];

export default class Config {
  cwd: string;
  isLocal: boolean;
  configFile?: string | null;
  logger: Logger;

  constructor(opts: ConfigOpts) {
    this.cwd = opts.cwd || process.cwd();
    this.isLocal = opts.isLocal || process.env.NODE_ENV === 'development';
    this.logger = opts.logger;
  }

  async getUserConfig(): Promise<UserConfig> {
    const configFile: string | null = this.getConfigFile();
    if (configFile === null) {
      this.logger.debug(`Can't find .inula.ts or .inula.js in ${this.cwd}`);
      return {};
    }

    this.configFile = configFile;

    if (configFile) {
      let envConfigFile: string | undefined = undefined;
      if (process.env.RUNNING_MODE) {
        envConfigFile = this.addModePath(configFile, process.env.RUNNING_MODE);
      }
      // 配置文件的来源
      // 1、默认的configFile 如.inula.ts
      // 2、带环境变量的configFile 如.inula.cloud.ts
      // 3、dev模式 包含local 如.inula.local.ts
      const files: string[] = [configFile];
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
      const requireDeps = files.reduce((deps: string[], file) => {
        deps = deps.concat(parseRequireDeps(file));
        return deps;
      }, []);
      requireDeps.forEach(cleanRequireCache);

      const configs = await this.requireConfigs(files);
      return this.mergeConfig(...configs);
    } else {
      return {};
    }
  }

  getConfigFile(): string | null {
    const configFileList: string[] = DEFAULT_CONFIG_FILES.map(f => join(this.cwd, f));
    for (let configFile of configFileList) {
      if (existsSync(configFile)) {
        return configFile;
      }
    }
    return null;
  }

  addModePath(file: string, mode: string) {
    const ext = extname(file);
    return file.replace(new RegExp(`${ext}$`), `.${mode}${ext}`);
  }

  async requireConfigs(configFiles: string[]) {
    const configs: UserConfig[] = [];
    for (const file in configFiles) {
      const content: UserConfig | undefined = await loadModule<UserConfig>(configFiles[file]);
      if (content) {
        configs.push(content);
      }
    }
    return configs;
  }

  mergeConfig(...configs: UserConfig[]) {
    let ret: UserConfig = {};
    for (const config of configs) {
      ret = deepmerge<UserConfig>(ret, config);
    }
    return ret;
  }
}
