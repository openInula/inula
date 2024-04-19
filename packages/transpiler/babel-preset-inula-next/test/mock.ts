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

import { ComponentNode, InulaNode } from '../src/analyze/types';
import babel, { type PluginObj, transform as transformWithBabel } from '@babel/core';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import { analyze } from '../src/analyze';
import generate from '@babel/generator';
import * as t from '@babel/types';

export function mockAnalyze(code: string): ComponentNode {
  let root: ComponentNode | null = null;
  transformWithBabel(code, {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      function (api: typeof babel): PluginObj {
        const { types } = api;
        return {
          visitor: {
            FunctionDeclaration: {
              enter: path => {
                root = analyze(path);
              },
            },
          },
        };
      },
    ],
    filename: 'test.tsx',
  });

  if (!root) {
    throw new Error('root is null');
  }

  return root;
}

export function genCode(ast: t.Node | null) {
  if (!ast) {
    throw new Error('ast is null');
  }
  return generate(ast).code;
}

export function printTree(node: InulaNode | undefined): any {
  if (!node) {
    return 'empty';
  }
  if (node.type === 'cond') {
    return {
      type: node.type,
      branch: node.branches.map(b => printTree(b.content)),
      children: printTree(node.child),
    };
  } else if (node.type === 'comp') {
    return {
      type: node.type,
      children: printTree(node.child),
    };
  } else if (node.type === 'jsx') {
    return {
      type: node.type,
    };
  }
  return 'unknown';
}
