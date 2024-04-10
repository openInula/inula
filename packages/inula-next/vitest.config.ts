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

// vitest.config.ts
import { defineConfig } from 'vitest/config';
import inula from 'vite-plugin-inula-next';
import * as path from 'node:path';

export default defineConfig({
  esbuild: {
    jsx: 'preserve',
  },
  resolve: {
    alias: {
      '@openinula/next': path.resolve(__dirname, 'src'),
    },
    conditions: ['dev'],
  },
  plugins: [
    // @ts-expect-error TODO: fix vite plugin interface is not compatible
    inula(),
  ],
  test: {
    environment: 'jsdom', // or 'jsdom', 'node'
  },
});
