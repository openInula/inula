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

import { Visitor } from '../types';
import { type NodePath } from '@babel/core';
import { types as t, traverse } from '@openinula/babel-api';
import { nodeWrapFile } from '../../generator/utils';

/**
 * Analyze the watch in the function component
 */
export function viewAnalyze(): Visitor {
  return {
    ReturnStatement(path: NodePath<t.ReturnStatement>, { builder }) {
      const returnedPath = path.get('argument');
      if (returnedPath.isJSXElement() || returnedPath.isJSXFragment()) {
        builder.setViewChild(returnedPath.node);
      } else if (returnedPath.isExpression() && hasVariables(returnedPath.node)) {
        // If the return value is an expression and contains variables, wrap it in a JSX expression container
        builder.setViewChild(t.jsxExpressionContainer(returnedPath.node));
      } else if (returnedPath.isStringLiteral() || returnedPath.isNumericLiteral() || returnedPath.isBooleanLiteral()) {
        // If the return value is a string, number, or boolean, wrap it in a JSX text node
        builder.setViewChild(t.jsxText(returnedPath.node.value.toString()));
      } else if (returnedPath.node === null || returnedPath.isNullLiteral()) {
        builder.setEmptyView();
      }
    },
  };
}

function hasVariables(expression: t.Expression): boolean {
  let hasVar = false;

  // 创建访问者对象
  const visitor = {
    Identifier(path: NodePath<t.Identifier>) {
      // 检查这个标识符是否是一个变量引用
      // isReferencedIdentifier 方法检查标识符是否作为引用使用
      if (path.isReferencedIdentifier()) {
        hasVar = true;
        // 一旦找到变量就停止遍历
        path.stop();
      }
    },
  };

  // 遍历表达式AST
  traverse(nodeWrapFile(expression), visitor);

  return hasVar;
}
