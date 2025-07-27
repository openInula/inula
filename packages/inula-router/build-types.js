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

import dts from 'rollup-plugin-dts';
import fs from 'fs';

function deleteFolder(filePath) {
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath);
    files.forEach(file => {
      const nextFilePath = `${filePath}/${file}`;
      const states = fs.statSync(nextFilePath);
      if (states.isDirectory()) {
        // recurse
        deleteFolder(nextFilePath);
      } else {
        // delete file
        fs.unlinkSync(nextFilePath);
      }
    });
    fs.rmdirSync(filePath);
  }
}

/**
 * rollup 删除文件夹插件
 * @param folders {string[]}
 * @returns {{buildEnd(): void, name: string}}
 */
export function cleanUp(folders) {
  return {
    name: 'clean-up',
    buildEnd() {
      folders.forEach(f => deleteFolder(f));
    },
  };
}

function routerTypeConfig() {
  return {
    input: './router/@types/router/index.d.ts',
    output: {
      file: './router/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), cleanUp(['./router/@types/history', './router/@types/router'])],
  };
}

function connectRouterTypeConfig() {
  return {
    input: './connectRouter/@types/router/index2.d.ts',
    output: {
      file: './connectRouter/@types/index.d.ts',
      format: 'es',
    },
    plugins: [
      dts(),
      cleanUp([
        './connectRouter/@types/history',
        './connectRouter/@types/router',
        './connectRouter/@types/connect-router',
      ]),
    ],
  };
}

export default [routerTypeConfig(), connectRouterTypeConfig()];
