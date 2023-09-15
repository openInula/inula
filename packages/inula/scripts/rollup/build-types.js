/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
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

import fs from 'fs';
import path from 'path';
import dts from 'rollup-plugin-dts';

function deleteFolder(filePath) {
  if (fs.existsSync(filePath)) {
    if (fs.lstatSync(filePath).isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        const nextFilePath = path.join(filePath, file);
        const states = fs.lstatSync(nextFilePath);
        if (states.isDirectory()) {
          deleteFolder(nextFilePath);
        } else {
          fs.unlinkSync(nextFilePath);
        }
      });
      fs.rmdirSync(filePath);
    } else if (fs.lstatSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * 删除非空文件夹
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

function buildTypeConfig() {
  return {
    input: ['./build/horizon/@types/index.d.ts'],
    output: {
      file: './build/horizon/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), cleanUp(['./build/horizon/@types/'])],
  };
}

export default [buildTypeConfig()];
