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

import { types as t } from '@openinula/babel-api';
import { NodePath } from '@babel/core';
import { ComponentNode, FnComponentDeclaration, HookNode, IRNode } from './types';
import { ArrowFunctionWithBlock } from '../utils';
import assert from 'node:assert';

export function isValidPath<T>(path: NodePath<T>): path is NodePath<Exclude<T, undefined | null>> {
  return !!path.node;
}

// The component name must be UpperCamelCase
export function isValidComponent(node: t.FunctionDeclaration): node is FnComponentDeclaration {
  // the first letter of the component name must be uppercase
  return node.id ? isValidComponentName(node.id.name) : false;
}

export function isValidComponentName(name: string) {
  // the first letter of the component name must be uppercase
  return /^[A-Z]/.test(name);
}

export function hasJSX(path: NodePath<t.Node>) {
  if (path.isJSXElement()) {
    return true;
  }

  // check if there is JSXElement in the children
  let seen = false;
  path.traverse({
    JSXElement() {
      seen = true;
    },
  });
  return seen;
}

export function extractFnBody(node: t.FunctionExpression | t.ArrowFunctionExpression): t.Statement {
  return t.isStatement(node.body) ? node.body : t.expressionStatement(node.body);
}

export function isStaticValue(node: t.VariableDeclarator['init']) {
  return t.isLiteral(node) || t.isArrowFunctionExpression(node) || t.isFunctionExpression(node);
}

export function assertComponentNode(node: any): asserts node is ComponentNode {
  if (node.type !== 'comp' && node.type !== 'subComp') {
    throw new Error('Analyze: Should be component node');
  }
}

export function assertHookNode(node: any): asserts node is HookNode {
  if (node.type !== 'hook') {
    throw new Error('Analyze: Should be hook node');
  }
}
