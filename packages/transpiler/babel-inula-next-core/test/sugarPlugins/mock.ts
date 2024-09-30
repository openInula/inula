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

import { type PluginItem, transform as transformWithBabel } from '@babel/core';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import { register } from '@openinula/babel-api';

export function compile(plugins: PluginItem[], code: string) {
  return transformWithBabel(code, {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      function (api) {
        register(api);
        return {};
      },
      ...plugins,
    ],
    filename: 'test.tsx',
  })?.code;
}
