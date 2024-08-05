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
import { searchNestedProps } from './stateDestructuringPlugin';
import { genUid } from './earlyReturnPlugin';

/**
 * For Sub Component Plugin
 * Find For element and convert
 *
 * @param api
 */

export default function (api: typeof babel): PluginObj {
  register(api);
  return {
    visitor: {
      JSXElement: function (path: NodePath<t.JSXElement>) {
        const tagName = path.node.openingElement.name;

        if (t.isJSXIdentifier(tagName) && tagName.name === 'for') {
          let jsx: t.Expression;
          const children = path.get('children');
          const expContainer: NodePath | undefined = children.find(child => child.isJSXExpressionContainer());
          if (!expContainer) {
            return;
          }
          // 判断箭头函数
          const arrow = expContainer.get('expression');
          if (Array.isArray(arrow)) {
            return;
          }
          if (!arrow.isArrowFunctionExpression()) {
            return;
          }
          const inputs = arrow.get('params');

          let arrowParams: NodePath[] = [];
          if (Array.isArray(inputs)) {
            arrowParams = inputs;
          } else {
            arrowParams.push(inputs);
          }

          let params: string[] = [];
          arrowParams.forEach(input => {
            if (input.isIdentifier()) {
              params.push(input.node.name);
            } else if (input.isObjectPattern()) {
              params = params.concat(searchNestedProps(input));
            }
          });
          const body = arrow.node.body;
          if (t.isExpression(body)) {
            return;
          }
          if (Array.isArray(body)) {
            return;
          }
          if (body.body.length == 1 && t.isReturnStatement(body.body[0])) {
            return;
          }
          const id = genUid(path.scope, 'For');
          arrow.node.body = t.jsxElement(
            t.jsxOpeningElement(
              t.jsxIdentifier(id),
              params.map(param =>
                t.jsxAttribute(t.jsxIdentifier(param), t.jsxExpressionContainer(t.identifier(param)))
              ),
              true
            ),
            null,
            []
          );

          const func = t.functionDeclaration(
            t.identifier(id),
            [
              t.objectPattern(
                params.map(param => t.objectProperty(t.identifier(param), t.identifier(param), false, true))
              ),
            ],
            body
          );
          let parent: NodePath<t.Node> = path.parentPath;
          while (!parent.isReturnStatement()) {
            if (!parent.parentPath) {
              return;
            }
            parent = parent.parentPath;
          }
          parent.insertBefore(func);
        }
      },
    },
  };
}
