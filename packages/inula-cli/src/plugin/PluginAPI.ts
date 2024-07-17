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

  constructor(opts: IOpts) {
    this.path = opts.path;
    this.manager = opts.manager;
    this.logger = opts.logger;
  }

  register(hook: IHook) {
    if (!this.manager.hooksByPluginPath[this.path]) {
      this.manager.hooksByPluginPath[this.path] = [];
    }

    this.manager.hooksByPluginPath[this.path].push(hook);
  }

  registerCommand(command: ICommand) {
    const { name } = command;
    this.manager.commands[name] = command;
    if (command.initialState) {
      this.manager.setStore(name, command.initialState);
    }
  }

  registerHook(hook: IHook) {
    this.register(hook);
  }

  registerMethod(fn: (...args: any[]) => any) {
    this.manager.registerFunction.push(fn);
  }

  async applyHook(name: string, args?: any) {
    const hooks: IHook[] = this.manager.hooks[name] || [];
    let config: any = undefined;
    for (const hook of hooks) {
      if (this.manager.store[name]) {
        config = this.manager.store[name];
      }
      if (hook.fn) {
        await hook.fn(args, config);
      }
    }
    return this.manager.store[name];
  }
}
