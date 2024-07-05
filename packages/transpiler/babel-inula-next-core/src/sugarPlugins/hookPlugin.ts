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
import { builtinHooks, COMPONENT, HOOK_SUFFIX, SPECIFIC_CTX_SUFFIX, WHOLE_CTX_SUFFIX } from '../constants';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

function isValidArgument(arg: t.Node): arg is t.Expression | t.SpreadElement {
  if (t.isExpression(arg) || t.isSpreadElement(arg)) {
    return true;
  }
  throw new Error('should pass expression or spread element as parameter for custom hook');
}

/**
 * Transform use custom hook into createHook
 **  ```js
 *  function App() {
 *    const [x, y] = useMousePosition(baseX, baseY, {
 *      settings: 1,
 *      id: 0
 *    })
 *  }
 *  // turn into
 *  function App() {
 *    let useMousePosition_$h$_ = createHook(useMousePosition, [baseX, baseY, {settings}])
 *    let [x, y] = useMousePosition_$h$_;
 *  }
 *  ```
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

            const bodyPath = fnPath.get('body') as NodePath<t.BlockStatement>;
            const topLevelPaths = bodyPath.get('body');

            topLevelPaths.forEach(statementPath => {
              if (statementPath.isVariableDeclaration()) {
                const declarator = statementPath.get('declarations')[0];
                const init = declarator.get('init');
                if (init.isCallExpression() && init.get('callee').isIdentifier()) {
                  const callee = init.node.callee as t.Identifier;
                  if (callee.name.startsWith('use') && !builtinHooks.includes(callee.name)) {
                    // Generate a unique identifier for the hook
                    const hookId = t.identifier(`${path.scope.generateUid(callee.name)}${HOOK_SUFFIX}`);

                    // 过滤并类型检查参数
                    const validArguments = init.node.arguments.filter(isValidArgument);

                    // Create the createHook call
                    const createHookCall = t.callExpression(t.identifier('createHook'), [
                      callee,
                      t.arrayExpression(validArguments),
                    ]);

                    // Create a new variable declaration for the hook
                    const hookDeclaration = t.variableDeclaration('let', [
                      t.variableDeclarator(hookId, createHookCall),
                    ]);

                    // Insert the new declaration before the current statement
                    statementPath.insertBefore(hookDeclaration);

                    // Replace the original call with hook.return();
                    init.replaceWith(t.callExpression(t.memberExpression(hookId, t.identifier('return')), []));
                  }
                }
              }
            });
          }
        }
      },
    },
  };
}
