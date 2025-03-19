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
 * Mapping to for Plugin
 * Convert map in JSXExpressionContainer to for
 * arr.map((item) => (<div>{item}</div>)) -> <for each={arr}>{item => <div>{item}</div>}</for>
 * Convert last map of multiple map call to for element
 * arr.map(item => <h1>{item}</h1>).map((item) => (<div>{item}</div>)) -> <for each={arr.map(item => <h1>{item}</h1>)}>{item => <div>{item}</div>}</for>
 * Convert map of map to for in for
 * <for each={matrix}>{arr => <for each={arr}>{item => <div>{item}</div>}</for>}</for>
 *
 * @param api Babel api
 * @return PluginObj mapping to for plugin
 */

export default function (api: typeof babel): PluginObj {
  register(api);
  return {
    visitor: {
      Program(program) {
        program.traverse({
          CallExpression(path: NodePath<t.CallExpression>) {
            callExpressionVisitor(path, false);
          },
        });
      },
    },
  };
}

/**
 * Convert map in JSXExpressionContainer to for visitor
 *
 * @param path Map call expression path
 * @param inner is inside for tag
 */

function callExpressionVisitor(path: NodePath<t.CallExpression>, inner: boolean): void {
  //match arrow function map call inside for tag
  if (inner && !path.parentPath.isArrowFunctionExpression()) {
    return;
  }
  //match map call in jsx expression container
  if (!inner && !path.parentPath.isJSXExpressionContainer()) {
    return;
  }

  // don't convert map call inside for tag
  if (path.parentPath?.parentPath?.parentPath?.isJSXOpeningElement()) {
    return;
  }

  const callee = path.get('callee');
  if (!callee.isMemberExpression()) {
    return;
  }
  const object = callee.get('object');
  const map = callee.get('property');
  if (!map.isIdentifier()) {
    return;
  }
  if (map.node.name !== 'map') {
    return;
  }
  const mapArgs = path.get('arguments');
  if (mapArgs.length !== 1) {
    return;
  }
  const expression = mapArgs[0];
  if (!expression.isExpression()) {
    return;
  }

  // generate for tag
  const forElement = t.jsxElement(
    t.jsxOpeningElement(
      t.jSXIdentifier('for'),
      [t.jsxAttribute(t.jsxIdentifier('each'), t.jsxExpressionContainer(object.node))],
      false
    ),
    t.jsxClosingElement(t.jSXIdentifier('for')),
    [t.jSXExpressionContainer(expression.node)]
  );
  if (path.parentPath.isArrowFunctionExpression()) {
    path.replaceWith(forElement);
  } else {
    path.parentPath.replaceWith(forElement);
  }
  // convert map call of arrow function inside for tag
  if (!inner) {
    path.parentPath.traverse({
      CallExpression(path: NodePath<t.CallExpression>) {
        callExpressionVisitor(path, true);
      },
    });
  }
}
