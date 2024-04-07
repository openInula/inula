/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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

import { PluginObj } from '@babel/core';
import { Option } from './types';
import * as babel from '@babel/core';
import { PluginProvider } from './pluginProvider';
import { ThisPatcher } from './thisPatcher';

export default function (api: typeof babel, options: Option): PluginObj {
  const pluginProvider = new PluginProvider(api, options);
  const thisPatcher = new ThisPatcher(api);
  return {
    name: 'zouyu-2',
    visitor: {
      FunctionDeclaration(path) {
        pluginProvider.functionDeclarationVisitor(path);

        thisPatcher.patch(path);
      },
    },
  };
}
