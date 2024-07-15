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

import babel, { NodePath, PluginObj } from '@babel/core';
import { register, types as t } from '@openinula/babel-api';

/**
 * Condition Plugin
 * Convert '&&' logical expression in JSXExpressionContainer to if tag
 * show && <h1>hello world</h1> -> <if cond={show}>{<h1>hello world</h1>}</if>
 * Convert conditional expression in JSXExpressionContainer to if and else tag
 * show ? <h1>hello world</h1> : 'Empty' -> <if cond={show}>{<h1>hello world</h1>}</if><else>{'Empty'}</else>
 *
 * @param api Babel api
 * @return PluginObj mapping to for plugin
 */

export default function (api: typeof babel): PluginObj {
  register(api);
  return {
    visitor: {
      LogicalExpression(path: NodePath<t.LogicalExpression>) {
        // expression in jsx expression container only
        if (!path.parentPath.isJSXExpressionContainer()) {
          return;
        }
        // expression is jsx element's child
        if (!path.parentPath.parentPath.isJSXElement()) {
          return;
        }
        // && operator only
        if (path.node.operator !== '&&') {
          return;
        }
        const left = path.node.left;
        const right = path.node.right;
        if (!t.isJSXElement(right) && !t.isLogicalExpression(right) && !t.isConditionalExpression(right)) {
          return;
        }
        // create if tag
        const ifTag = t.jsxElement(
          t.jsxOpeningElement(
            t.jSXIdentifier('if'),
            [t.jsxAttribute(t.jsxIdentifier('cond'), t.jsxExpressionContainer(left))],
            false
          ),
          t.jsxClosingElement(t.jSXIdentifier('if')),
          [t.jSXExpressionContainer(right)]
        );
        path.parentPath.replaceWith(ifTag);
      },
      ConditionalExpression(path: NodePath<t.ConditionalExpression>) {
        // expression in jsx expression container only
        if (!path.parentPath.isJSXExpressionContainer()) {
          return;
        }
        // expression is jsx element's child
        if (!path.parentPath.parentPath.isJSXElement()) {
          return;
        }
        const test = path.node.test;
        const consequent = path.node.consequent;
        const alternate = path.node.alternate;
        // create if tag
        const ifTag = t.jsxElement(
          t.jsxOpeningElement(
            t.jSXIdentifier('if'),
            [t.jsxAttribute(t.jsxIdentifier('cond'), t.jsxExpressionContainer(test))],
            false
          ),
          t.jsxClosingElement(t.jSXIdentifier('if')),
          [getJsxElementChild(consequent)]
        );
        // create else tag
        const elseTag = t.jsxElement(
          t.jsxOpeningElement(t.jSXIdentifier('else'), [], false),
          t.jsxClosingElement(t.jSXIdentifier('else')),
          [getJsxElementChild(alternate)]
        );
        path.parentPath.replaceWith(ifTag);
        path.parentPath.insertAfter(elseTag);
      },
    },
  };
}

function getJsxElementChild(expression: t.Expression): t.JSXElement | t.JSXExpressionContainer {
  return t.isJSXElement(expression) ? expression : t.jSXExpressionContainer(expression);
}
