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
import { isHookPath, extractFnFromMacro, ArrowFunctionWithBlock, isCompPath } from '../utils';
import { COMPONENT, SPECIFIC_CTX_SUFFIX, WHOLE_CTX_SUFFIX } from '../constants';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

function checkUseContextArgs(init: t.CallExpression) {
  if (init.arguments.length !== 1) {
    throw new Error('useContext argument must have only one identifier');
  }
  const contextArg = init.arguments[0];
  if (!t.isIdentifier(contextArg)) {
    throw new Error('useContext argument must be identifier');
  }
}

function isValidUseContextCallExpression(init: t.Expression | null | undefined): init is t.CallExpression {
  return !!init && t.isCallExpression(init) && t.isIdentifier(init.callee) && init.callee.name === 'useContext';
}

function tryAppendContextVariable(
  declarator: t.VariableDeclarator,
  statementPath: NodePath<t.Statement>,
  init: t.CallExpression
) {
  const id = declarator.id;
  if (t.isObjectPattern(id)) {
    // Object destructuring case
    id.properties
      .map(prop => {
        if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
          const name = prop.key.name;
          statementPath.scope.rename(name, `${name}${SPECIFIC_CTX_SUFFIX}`);
          const clonedInit = t.cloneNode(init);
          clonedInit.arguments.push(t.stringLiteral(name));
          return t.variableDeclarator(t.identifier(`${name}${SPECIFIC_CTX_SUFFIX}`), clonedInit);
        }
        return null;
      })
      .forEach(declarator => {
        if (declarator) {
          statementPath.insertAfter(t.variableDeclaration('let', [declarator]));
        }
      });
  } else if (t.isIdentifier(id)) {
    // Direct assignment case
    const taggedName = `${id.name}${WHOLE_CTX_SUFFIX}`;
    statementPath.scope.rename(id.name, taggedName);
    statementPath.insertAfter(t.variableDeclaration('let', [t.variableDeclarator(t.identifier(taggedName), init)]));
  }
}

/**
 * Transform useContext into tagged value
 *
 *  Object destructuring case, tagged with _$c$_, means to subscribe the specific key
 *  ```js
 *  function App() {
 *    const { level, path } = useContext(UserContext);
 *  }
 *  // turn into
 *  function App() {
 *    let level_$c$_ =  useContext(UserContext, 'level')
 *    let path_$c$_ = useContext(UserContext, 'path')
 *  }
 *  ```
 *
 *  Other case, tagged with _$ctx$_, means to subscribe the whole context
 *   ```js
 *  function App() {
 *    const user = useContext(UserContext);
 *  }
 *  // turn into
 *  function App() {
 *    let user_$ctx$_ = useContext(UserContext)
 *  }
 * @param api
 * @param options
 */
export default function (api: typeof babel): PluginObj {
  register(api);

  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isHookPath(path) || isCompPath(path)) {
          const fnPath = extractFnFromMacro(path, COMPONENT) as
            | NodePath<t.FunctionExpression>
            | NodePath<ArrowFunctionWithBlock>;

          if (fnPath && !ALREADY_COMPILED.has(fnPath)) {
            ALREADY_COMPILED.add(fnPath);

            const bodyPath = fnPath.get('body');
            if (Array.isArray(bodyPath) || !bodyPath.isBlockStatement()) {
              return;
            }
            const topLevelPaths = bodyPath.get('body');
            if (!topLevelPaths) {
              return;
            }
            topLevelPaths.forEach(statementPath => {
              if (statementPath.isVariableDeclaration()) {
                const declarations = statementPath.node.declarations.filter(declarator => {
                  const init = declarator.init;
                  if (!isValidUseContextCallExpression(init)) {
                    return true;
                  }
                  checkUseContextArgs(init);
                  tryAppendContextVariable(declarator, statementPath, init);
                  return false;
                });

                if (declarations.length === 0) {
                  statementPath.remove();
                } else if (declarations.length !== statementPath.node.declarations.length) {
                  statementPath.node.declarations = declarations;
                }
              }
            });

            // Check for non-top-level useContext calls
            bodyPath.traverse({
              CallExpression(callPath) {
                if (t.isIdentifier(callPath.node.callee) && callPath.node.callee.name === 'useContext') {
                  if (!callPath.parentPath.isVariableDeclarator()) {
                    console.error(
                      `Error: useContext call at ${callPath.node.loc?.start.line}:${callPath.node.loc?.start.column} is not at the variables declaration..`
                    );
                    throw new Error('useContext must be called at the top level of the component.');
                  }
                  if (callPath.parentPath?.parentPath?.parentPath !== bodyPath) {
                    console.error(
                      `Error: useContext call at ${callPath.node.loc?.start.line}:${callPath.node.loc?.start.column} is not at the top level of the component. This violates React Hook rules.`
                    );
                    throw new Error('useContext must be called at the top level of the component.');
                  }
                }
              },
            });
          }
        }
      },
    },
  };
}
