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

import { Visitor } from './types';
import { addMethod, addProperty, addSubComponent, createComponentNode } from './nodeFactory';
import { isValidPath } from './utils';
import { type NodePath } from '@babel/core';
import { COMPONENT } from '../constants';
import { analyzeFnComp } from '.';
import { getDependenciesFromNode } from './reactive/getDependencies';
import { types as t } from '@openinula/babel-api';

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
          let depBits = 0;
          if (isValidPath(init)) {
            // handle the method
            if (init.isArrowFunctionExpression() || init.isFunctionExpression()) {
              addMethod(ctx.current, id.node.name, init.node);
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

            depBits = getDependenciesFromNode(id.node.name, init, ctx);
          }
          addProperty(ctx.current, id.node.name, init.node || null, depBits);
        }
      });
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>, { current }) {
      const fnId = path.node.id;
      if (!fnId) {
        throw new Error('Function declaration must have an id');
      }

      const functionExpression = t.functionExpression(
        path.node.id,
        path.node.params,
        path.node.body,
        path.node.generator,
        path.node.async
      );
      addMethod(current, fnId.name, functionExpression);
    },
  };
}
