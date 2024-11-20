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

import { AnalyzeContext, Visitor } from '../types';
import { isStaticValue, isValidPath } from '../utils';
import { type NodePath } from '@babel/core';
import { importMap } from '../../constants';
import { analyzeUnitOfWork } from '../index';
import { types as t } from '@openinula/babel-api';
import { isCompPath } from '../../utils';
import { IRBuilder } from '../IRBuilder';

/**
 * collect all properties and methods from the node
 * and analyze the dependencies of the properties
 * @returns
 */
export function variablesAnalyze(): Visitor {
  return {
    VariableDeclaration(path: NodePath<t.VariableDeclaration>, ctx) {
      const { builder } = ctx;
      const declarations = path.get('declarations');
      // iterate the declarations
      declarations.forEach(declaration => {
        const id = declaration.get('id');
        // --- properties: the state / computed / plain properties / methods ---
        const init = declaration.get('init');
        const kind = path.node.kind;

        // Check if the variable can't be modified
        if (kind === 'const' && isStaticValue(init.node)) {
          builder.addRawStmt(path.node);
          return;
        }

        if (!isValidPath(init)) {
          assertIdentifier(id);
          resolveUninitializedVariable(kind, builder, id, declaration.node);
          return;
        }

        // Handle the subcomponent, should like Component(() => {})
        if (init.isCallExpression() && isCompPath(init)) {
          assertIdentifier(id);
          resolveSubComponent(init, builder, id, ctx);
          return;
        }

        // ensure evert jsx slice call expression can found responding sub-component
        assertJSXSliceIsValid(path, builder.checkSubComponent.bind(builder));

        builder.addVariable({
          id,
          value: init.node,
          kind: path.node.kind,
        });
      });
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>, { builder }) {
      builder.addRawStmt(path.node);
    },
  };
}

function assertIdentifier(id: NodePath<t.LVal>): asserts id is NodePath<t.Identifier> {
  if (!id.isIdentifier()) {
    throw new Error(`${id.node.type} is not valid initial value type for state`);
  }
}

function assertJSXSliceIsValid(path: NodePath<t.VariableDeclaration>, checker: (name: string) => boolean) {
  path.traverse({
    CallExpression(callPath) {
      const callee = callPath.node.callee;
      if (t.isIdentifier(callee) && callee.name === importMap.Comp) {
        const subCompIdPath = callPath.get('arguments')[0];
        if (!subCompIdPath.isIdentifier()) {
          throw Error('invalid jsx slice');
        }
        const subCompName = subCompIdPath.node.name;
        if (!checker(subCompName)) {
          throw Error(`Sub component not found: ${subCompName}`);
        }
      }
    },
  });
}

function resolveUninitializedVariable(
  kind: 'var' | 'let' | 'const' | 'using' | 'await using',
  builder: IRBuilder,
  id: NodePath<t.Identifier>,
  node: Array<t.VariableDeclarator>[number]
) {
  if (kind === 'const') {
    builder.addRawStmt(t.variableDeclaration('const', [node]));
  }
  builder.addVariable({
    id,
    value: null,
    kind,
  });
}

function resolveSubComponent(
  init: NodePath<t.CallExpression>,
  builder: IRBuilder,
  id: NodePath<t.Identifier>,
  ctx: AnalyzeContext
) {
  const fnNode = init.get('arguments')[0] as NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionExpression>;

  builder.startSubComponent(id.node.name, fnNode);

  analyzeUnitOfWork(id.node.name, fnNode, ctx);

  builder.endSubComponent();
}
