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
import { addMethod, addVariable, addSubComponent, createComponentNode } from '../nodeFactory';
import { isValidPath } from '../utils';
import { type NodePath } from '@babel/core';
import { COMPONENT } from '../../constants';
import { analyzeFnComp } from '../index';
import { getDependenciesFromNode } from '@openinula/reactivity-parser';
import { types as t } from '@openinula/babel-api';
import { reactivityFuncNames } from '../../const';

/**
 * collect all properties and methods from the node
 * and analyze the dependencies of the properties
 * @returns
 */
export function variablesAnalyze(): Visitor {
  return {
    VariableDeclaration(path: NodePath<t.VariableDeclaration>, ctx) {
      const declarations = path.get('declarations');
      // iterate the declarations
      declarations.forEach(declaration => {
        const id = declaration.get('id');
        // handle destructuring
        if (id.isObjectPattern()) {
          throw new Error('Object destructuring is not supported yet');
        } else if (id.isArrayPattern()) {
          // TODO: handle array destructuring
          throw new Error('Array destructuring is not supported yet');
        } else if (id.isIdentifier()) {
          // --- properties: the state / computed / plain properties / methods ---
          const init = declaration.get('init');
          if (!isValidPath(init)) {
            addVariable(
              ctx.current,
              {
                name: id.node.name,
                value: null,
                kind: path.node.kind,
              },
              null
            );
            return;
          }
          // handle the subcomponent
          // Should like Component(() => {})
          if (
            init.isCallExpression() &&
            init.get('callee').isIdentifier() &&
            (init.get('callee').node as t.Identifier).name === COMPONENT &&
            (init.get('arguments')[0].isFunctionExpression() || init.get('arguments')[0].isArrowFunctionExpression())
          ) {
            const fnNode = init.get('arguments')[0] as
              | NodePath<t.ArrowFunctionExpression>
              | NodePath<t.FunctionExpression>;
            const subComponent = createComponentNode(id.node.name, fnNode, ctx.current);

            analyzeFnComp(fnNode, subComponent, ctx);
            addSubComponent(ctx.current, subComponent);
            return;
          }

          const dependency =
            init.isArrowFunctionExpression() || init.isFunctionExpression()
              ? null
              : getDependenciesFromNode(init.node, ctx.current._reactiveBitMap, reactivityFuncNames);

          addVariable(
            ctx.current,
            {
              name: id.node.name,
              value: init.node || null,
              kind: path.node.kind,
            },
            dependency || null
          );
        }
      });
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>, { current }) {
      const fnId = path.node.id;
      if (!fnId) {
        throw new Error('Function declaration must have an id');
      }

      addMethod(current, {
        name: fnId.name,
        value: path.node,
        kind: 'const',
      });
    },
  };
}
