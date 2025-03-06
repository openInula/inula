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

import webpack from 'webpack';
import { build } from 'vite';

export default (api: any) => {
  api.registerCommand({
    name: 'build',
    description: 'build application for production',
    initialState: api.buildConfig,
    fn: async function (args: any, state: any) {
      switch (api.compileMode) {
        case 'webpack':
          if (state) {
            api.applyHook({ name: 'beforeCompile', args: state });
            state.forEach((s: any) => {
              webpack(s.config, (err: any, stats: any) => {
                if (err || stats.hasErrors()) {
                  api.logger.error(`Build failed.err: ${err}, stats:${stats}`);
                }
              });
            });
          } else {
            api.logger.error(`Build failed. Can't find build config.`);
          }
          break;
        case 'vite':
          if (state) {
            api.applyHook({ name: 'beforeCompile' });
            build(state);
          } else {
            api.logger.error(`Build failed. Can't find build config.`);
          }
          break;
      }
    },
  });
};
