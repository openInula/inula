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
//先明确什么
//打包出来
//ut的例子
export function cleanUp(folders) {
  return {
    name: 'clean-up',
    buildEnd() {
      folders.forEach(f => deleteFolder(f));
    },
  };
}
/**
 * 自定义插件：处理生成的 .d.ts 文件
 * 例如，移除内部方法或不需要的类型定义。
 * @returns {{writeBundle(): void, name: string}}
 */
function processDTS() {
  return {
    name: 'process-dts',
    writeBundle() {
      const dtsFilePath = path.resolve('./build/@types/index.d.ts');
      if (fs.existsSync(dtsFilePath)) {
        let dtsContent = fs.readFileSync(dtsFilePath, 'utf-8');
        dtsContent = dtsContent.replace(/^export\s+.*_.*;/gm, '');
        //todo 这块如何优化 index.ts 的全部函数
        dtsContent = dtsContent.replace(/import\("openinula"\)/g, 'import { InulaNode } from "openinula"');

        // 写回处理后的 .d.ts 文件
        fs.writeFileSync(dtsFilePath, dtsContent, 'utf-8');
      }
    },
  };
}
function buildTypeConfig() {
  return {
    input: ['./build/@types/index.d.ts'],
    output: {
      file: './build/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), processDTS(), cleanUp(['./build/@types/'])],
  };
}

export default [buildTypeConfig()];
