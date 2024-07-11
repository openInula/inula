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
import type { InulaNextOption } from '../types';
import { register } from '@openinula/babel-api';
import { COMPONENT } from '../constants';
import { ArrowFunctionWithBlock, extractFnFromMacro, isCompPath, isHookPath } from '../utils';
import { types as t } from '@openinula/babel-api';

/**
 * Iterate identifier in nested destructuring, collect the identifier that can be used
 * e.g. function ({prop1, prop2: [p20X, {p211, p212: p212X}]}
 * we should collect prop1, p20X, p211, p212X
 * @param idPath
 */
export function searchNestedProps(idPath: NodePath<t.ArrayPattern | t.ObjectPattern>) {
  const nestedProps: string[] | null = [];

  if (idPath.isObjectPattern() || idPath.isArrayPattern()) {
    idPath.traverse({
      Identifier(path) {
        // judge if the identifier is a prop
        // 1. is the key of the object property and doesn't have alias
        // 2. is the item of the array pattern and doesn't have alias
        // 3. is alias of the object property
        const parentPath = path.parentPath;
        if (parentPath.isObjectProperty() && path.parentKey === 'value') {
          // collect alias of the object property
          nestedProps.push(path.node.name);
        } else if (
          parentPath.isArrayPattern() ||
          parentPath.isObjectPattern() ||
          parentPath.isRestElement() ||
          (parentPath.isAssignmentPattern() && path.key === 'left')
        ) {
          // collect the key of the object property or the item of the array pattern
          nestedProps.push(path.node.name);
        }
      },
    });
  }

  return nestedProps;
}

/**
 * The state deconstructing plugin is used to transform the state deconstructing in the component body
 *  let { a, b } = props;
 *  // turn into
 *  let a, b;
 *  watch(() => {
 *    { a, b } = props;
 *  });
 *
 * @param api
 * @param options
 */
export default function (api: typeof babel, options: InulaNextOption): PluginObj {
  register(api);
  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (!isCompPath(path) && !isHookPath(path)) {
          return;
        }
        const fnPath = extractFnFromMacro(path, COMPONENT) as
          | NodePath<t.FunctionExpression>
          | NodePath<ArrowFunctionWithBlock>;

        fnPath.traverse({
          VariableDeclaration(declarationPath) {
            const nodesToReplace: t.Statement[] = [];

            declarationPath.get('declarations').map(path => {
              const idPath = path.get('id');
              const initNode = path.node.init;

              if (initNode && (idPath.isObjectPattern() || idPath.isArrayPattern())) {
                const nestedProps: string[] | null = searchNestedProps(idPath);
                if (nestedProps.length) {
                  // declare the nested props as the variable
                  nodesToReplace.push(
                    t.variableDeclaration(
                      'let',
                      nestedProps.map(prop => t.variableDeclarator(t.identifier(prop)))
                    )
                  );
                  // move the deconstructing assignment into the watch function
                  nodesToReplace.push(
                    t.expressionStatement(
                      t.callExpression(t.identifier('watch'), [
                        t.arrowFunctionExpression(
                          [],
                          t.blockStatement([t.expressionStatement(t.assignmentExpression('=', idPath.node, initNode))])
                        ),
                      ])
                    )
                  );
                  declarationPath.replaceWithMultiple(nodesToReplace);
                }
              }
            });
          },
        });
      },
    },
  };
}
