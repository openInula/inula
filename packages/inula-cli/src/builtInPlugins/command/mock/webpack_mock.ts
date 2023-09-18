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

import { createRequire } from 'module';
import mockServer from '../../../utils/mockServer.js';
const require = createRequire(import.meta.url);

export default (api: any) => {
  api.registerHook({
    name: 'beforeStartDevServer',
    fn: async (state: any) => {
      const { compiler, devServerOptions } = state;
      devServerOptions.setupMiddlewares = (middlewares: any, devServer: { app: any }) => {
        mockServer(devServer.app);
        return middlewares;
      };
    },
  });
};
