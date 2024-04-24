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

import { Analyzer, ComponentNode, InulaNode } from '../src/analyze/types';
import babel, { type PluginObj, transform as transformWithBabel } from '@babel/core';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import { analyze } from '../src/analyze';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { register } from '../src/babelTypes';

export function mockAnalyze(code: string, analyzers?: Analyzer[]): ComponentNode {
  let root: ComponentNode | null = null;
  transformWithBabel(code, {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      function (api): PluginObj {
        register(api.types);
        return {
          visitor: {
            FunctionExpression: path => {
              root = analyze(api.types, 'test', path, analyzers);
              if (root) {
                path.skip();
              }
            },
            ArrowFunctionExpression: path => {
              root = analyze(api.types, 'test', path, analyzers);
              if (root) {
                path.skip();
              }
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
