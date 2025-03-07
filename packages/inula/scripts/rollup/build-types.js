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
import { parse } from '@babel/parser';
import MagicString from 'magic-string';
import assert from 'node:assert/strict';

const LIB_NAME = 'Inula';

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

/**
 * 获取AST语法树节点的名称
 *
 * @param  astNode AST语法树节点
 * @returns 节点的名称
 */
function getNodeName(astNode) {
  let node = astNode;
  if (node.type === 'VariableDeclaration') {
    node = node.declarations[0];
    if (!node.id) {
      return '';
    }
    return node.id.name;
  } else if (
    node.type === 'TSTypeAliasDeclaration' ||
    node.type === 'TSInterfaceDeclaration' ||
    node.type === 'TSDeclareFunction' ||
    node.type === 'TSEnumDeclaration' ||
    node.type === 'ClassDeclaration' ||
    node.type === 'TSModuleDeclaration'
  ) {
    if (!node.id) {
      return '';
    }
    return node.id.name;
  }
  return '';
}

/**
 * 判断AST语法树节点是否是Horizon变量节点
 *
 * @param  node AST语法树节点
 * @returns true 是 false 不是
 */
function isHorizonVariable(node) {
  if (node.type === 'VariableDeclaration') {
    let tmpNode = node.declarations[0];
    if (!tmpNode.id) {
      return false;
    }
    let exoprtName = tmpNode.id.name;
    if (exoprtName === LIB_NAME) {
      return true;
    }
  }
  return false;
}

/**
 * 为导出的类型节点加上前缀export
 *
 * @param node AST语法树节点
 * @param isExported 导出的类型名称集合
 * @param hasAliasExport 导出的重命名类型的集合
 * @param magicStr 原始的AST语法树对应的magic对象
 * @param parentDecl 当节点为VariableDeclaration类型的子节点时，该变量代表父亲节点，其他类型该参数不传
 */
function processDeclaration(node, isExported, hasAliasExport, magicStr, parentDecl) {
  if (!node.id) {
    return;
  }
  assert(node.id.type === 'Identifier');
  const name = node.id.name;
  if (name.startsWith('_')) {
    return;
  }
  if (isExported.has(name) && !hasAliasExport.has(name)) {
    const start = (parentDecl || node).start;
    assert(typeof start === 'number');
    magicStr.prependLeft(start, 'export ');
  }
}

/**
 * 生成Horzion的namespace，达到可以Horzion.foo的效果
 *
 * @example
 *  原始文件内容：
 *    type foo
 *    type f001
 *    type fooA$1
 *    const Horzion {
 *      version
 *    }
 *    export { typeof foo, type f001, type fooA$1 as fooA, default Horzion}
 *  修改后的文件内容:
 *    export type foo
 *    export type f001
 *    type fooA$1
 *    declare namespace Horzion {
 *      export { type foo };
 *      export { type f001 };
 *      export { type fooA$1 as fooA };
 *    }
 *    export { type fooA$1 as fooA };
 *    export default Horzion;
 * @returns 修改后的文件内容
 */
function patchNamespaceType() {
  return {
    name: 'patch-types',
    renderChunk(code) {
      const magicCodeStr = new MagicString(code);
      const ast = parse(code, {
        plugins: ['typescript'],
        sourceType: 'module',
      });

      const exportedSet = new Set();
      const hasAliasExportMap = new Map();
      const aliasTypeArr = [];
      const exportTypeArr = [];
      const moduleSet = new Set();

      /**
       * 第一部分： 遍历AST语法树获取所有的导出的类型名称放入isExported
       * 获取所有的声明的namespace的名称放入moduleArr
       *
       * @example
       *   export { typeof foo } 会将foo放入isExported
       *   delcare namespace foo1 {} 会将foo1放入moduleArr
       */
      for (const node of ast.program.body) {
        if (node.type === 'TSModuleDeclaration') {
          moduleSet.add(getNodeName(node));
        }
        if (node.type === 'ExportNamedDeclaration' && !node.source) {
          for (let i = 0; i < node.specifiers.length; i++) {
            const spec = node.specifiers[i];
            if (spec.type === 'ExportSpecifier') {
              exportedSet.add(spec.local.name);
            }
          }
        }
      }

      /**
       * 第二部分：遍历AST语法树 ，去除最后的export声明部分，并且删除Horizon变量的声明
       * 将除了namespace的导出声明外的所有导出类型放入exportTypeArr
       * 将所有被重名的导出类型的名称放入aliasTypeArr
       * 将所有被重名的导出类型的名称和别名放入hasAliasExport，key是类型的名称 value是导出类型的别名
       */
      for (const node of ast.program.body) {
        if (node.type === 'VariableDeclaration') {
          if (isHorizonVariable(node)) {
            // 不导出Horizon变量，需要将Horizon的变量重命名为namespace
            assert(typeof node.start === 'number');
            assert(typeof node.end === 'number');
            magicCodeStr.remove(node.start, node.end);
          }
        } else if (node.type === 'ExportNamedDeclaration' && !node.source) {
          for (let i = 0; i < node.specifiers.length; i++) {
            const spec = node.specifiers[i];
            if (spec.type === 'ExportSpecifier' && spec.local.name != LIB_NAME) {
              assert(spec.exported.type === 'Identifier');
              const exported = spec.exported.name;
              if (!moduleSet.has(spec.local.name)) {
                /**
                 * @example
                 * type foo
                 * namespace foo1{}
                 * export {type foo , foo1}
                 *
                 * 最后放入到exportTypeArr中的为type foo字符串
                 */
                exportTypeArr.push(magicCodeStr.slice(spec.start, spec.end));
              }
              if (exported !== spec.local.name) {
                /**
                 * @example
                 * type foo
                 * type foo1
                 * export {type foo as fooalias, type foo1}
                 *
                 * 最后放入aliasTypeArr为type foo as fooalias
                 * 放入hasAliasExport的key为foo， value为fooalias
                 */
                aliasTypeArr.push(magicCodeStr.slice(spec.start, spec.end));
                hasAliasExportMap.set(spec.local.name, exported);
              }
            }
          }
          assert(typeof node.start === 'number');
          assert(typeof node.end === 'number');
          magicCodeStr.remove(node.start, node.end);
        }
      }

      /**
       * 第三部分：遍历AST语法树为所有需要导出的类型加上前缀 export
       *
       * @example
       *
       * type foo
       *
       * @returns
       *
       * export type foo
       */
      for (const node of ast.program.body) {
        if (node.type === 'VariableDeclaration') {
          if (isHorizonVariable(node)) {
            continue;
          }
          processDeclaration(node.declarations[0], exportedSet, hasAliasExportMap, magicCodeStr, node);
          if (node.declarations.length > 1) {
            assert(typeof node.start === 'number');
            assert(typeof node.end === 'number');
            throw new Error(
              `unhandled declare const with more than one declarators:\n${code.slice(node.start, node.end)}`
            );
          }
        } else if (
          node.type === 'TSTypeAliasDeclaration' ||
          node.type === 'TSInterfaceDeclaration' ||
          node.type === 'TSDeclareFunction' ||
          node.type === 'TSEnumDeclaration' ||
          node.type === 'ClassDeclaration' ||
          node.type === 'TSModuleDeclaration'
        ) {
          processDeclaration(node, exportedSet, hasAliasExportMap, magicCodeStr);
        }
      }

      /**
       * 第四部分：拼接名称为${HORIZON_NAME} 的namespace，并将它作为默认导出类型
       * 将所有的重命名的导出类型添加到末尾
       *
       * @example
       *
       * 结果示例如下
       * export typeof foo
       * export typeof foo$1
       * declare namespace Horizon {
       *  export {typeof foo}
       *  export {typeof foo$1 as fooalias}
       * }
       *
       * export {typeof foo$1 as fooalias}
       * export default Horizon
       */
      magicCodeStr.append(`declare namespace ${LIB_NAME} {\n`);
      exportTypeArr.forEach(ele => {
        magicCodeStr.append(`  export { ${ele} };\n`);
      });
      magicCodeStr.append('}\n');
      aliasTypeArr.forEach(ele => {
        magicCodeStr.append(`export { ${ele} };\n`);
      });
      magicCodeStr.append(`export default ${LIB_NAME};`);

      return magicCodeStr.toString();
    },
  };
}

function buildTypeConfig() {
  return {
    input: ['./build/inula/@types/index.d.ts'],
    output: {
      file: './build/inula/@types/index.d.ts',
      format: 'es',
    },
    plugins: [dts(), patchNamespaceType(), cleanUp(['./build/inula/@types/'])],
  };
}

export default [buildTypeConfig()];
