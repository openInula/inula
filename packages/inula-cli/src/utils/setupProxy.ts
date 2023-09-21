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

import { createProxyMiddleware } from 'http-proxy-middleware';
import { API } from '../types/types';

export default (app: any, api: API) => {
    const { devProxy } = api.userConfig.devBuildConfig;
    app.use(createProxyMiddleware(devProxy.matcher, {
        target: devProxy.target,
        secure: false,
        changeOrigin: true,
        ws: false,
        onProxyRes: devProxy.onProxyRes
    }));
}