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

import { PackageJSON } from 'resolve';
import yargsParser from 'yargs-parser';
import { Logger } from '../utils/logger.js';
import type * as http from 'http';
import type * as express from 'express';


interface Request extends express.Request {
}
interface Response extends express.Response {
}

export interface IDep {
  [name: string]: string;
}

export interface IPackage {
  name?: string;
  dependencies?: IDep;
  devDependencies?: IDep;
  [key: string]: any;
}

export interface IPlugin {
  id: string;
  key: string;
  path: string;
  apply: Function;

  config?: IPluginConfig;
  isPreset?: boolean;
}

export interface IPluginConfig {
  default?: any;
  onChange?: string | Function;
}

export interface IHook {
  // 触发事件名称
  name: string;
  fn?: {
    (state: any, config: any): void;
  };
  pluginId?: string;
}

export interface ICommand {
  name: string;
  description?: string;
  details?: string;
  initialState?: any;
  fn: {
    (args: yargsParser.Arguments, config: any): void;
  };
}

export interface IConfig {
  plugins?: string[];
  [key: string]: any;
}

interface applyHookConfig<T = any> {
  name: string;
  config?: T;
}

export interface API {
  cwd: string;
  logger: Logger;
  userConfig: IConfig;
  buildConfig: any;
  devBuildConfig: any;
  compileMode: string;
  commands: string[];
  packageJson: PackageJSON;

  registerCommand: {
    (command: ICommand): void;
  };
  registerHook: {
    (hook: IHook): void;
  };
  registerMethod: {
    (method: Function): void;
  }
  applyHook: {
    (opts: applyHookConfig): void;
  };
  setStore: {
    (name: string, initialState: any): void;
  };
}

export interface RemoteProxy {
  target: string;
  localPort?: number;
  localStatic?: StaticFileMatcher[];
  fowardingURL?: string[];
}

export interface StaticFileMatcher {
  url: string;
  local: string;
}

export interface UserConfig {
  mock?: MockConfig;
  proxy?: RemoteProxy;
  plugins?: string[];
  compileMode?: string;
  buildConfig?: BuildConfig[];
  devBuildConfig?: DevBuildConfig;
}

export interface MockConfig {
  enableMock?: boolean;
  mockPath?: string;
}

export interface DevBuildConfig {
  name: string;
  path: string;
  args?: object;
  env?: object;
  devProxy?: DevProxy;
}

export interface DevProxy {
  target: string;
  matcher: ((pathname: string, req: Request) => boolean);
  onProxyRes: (proxyRes: http.IncomingMessage, req: Request, res: Response) => void;
}

export interface BuildConfig {
  name: string;
  path: string;
  args?: object;
  env?: object;
}

export type ExportUserConfig = UserConfig | Promise<UserConfig>;

export function defineConfig(config: ExportUserConfig): ExportUserConfig {
  return config;
}

export interface Arguments {
  _: Array<string | number>;
  '--'?: Array<string | number>;
  [argName: string]: any;
}
