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
import { isHookPath, extractFnFromMacro, ArrowFunctionWithBlock, isCompPath, wrapUntrack } from '../utils';
import { builtinHooks, COMPONENT, HOOK_SUFFIX, importMap } from '../constants';
import type { Scope } from '@babel/traverse';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

function isValidArgument(arg: t.Node): arg is t.Expression | t.SpreadElement {
  if (t.isExpression(arg) || t.isSpreadElement(arg)) {
    return true;
  }
  throw new Error('should pass expression or spread element as parameter for custom hook');
}

/**
 *  function useMousePosition(baseX, baseY, { settings, id }) {
 *  ->
 *  function useMousePosition({p1: baseX, p2: baseY, p3: { settings, id }}
 * @param fnPath
 */
function transformHookParams(fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>) {
  const params = fnPath.node.params;
  const objPropertyParam = params.map((param, idx) =>
    !t.isRestElement(param) ? t.objectProperty(t.identifier(`p${idx}`), param) : param
  );

  fnPath.node.params = [t.objectPattern(objPropertyParam)];
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
 *    let useMousePosition_$h$_ =[useMousePosition, [baseX, baseY, {settings}]];
 *    watch(() => {
 *      untrack(() => useMousePosition_$h$_).updateProp('p0', baseX)
 *    })
 *   watch(() => {
 *     untrack(() => useMousePosition_$h$_).updateProp('p1', baseY)
 *   })
 *   watch(() => {
 *     untrack(() => useMousePosition_$h$_).updateProp('p2', {settings})
 *   })
 *   let [x, y] = useMousePosition_$h$_.value();
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

            // handle the useXXX()
            transformUseHookCalling(fnPath, path.scope);

            if (isHookPath(path)) {
              transformHookParams(fnPath);
            }
          }
        }
      },
    },
  };
}

function transformUseHookCalling(
  fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>,
  scope: Scope
) {
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
      const declarator = statementPath.get('declarations')[0];
      const init = declarator.get('init');
      if (init.isCallExpression() && init.get('callee').isIdentifier()) {
        const callee = init.node.callee as t.Identifier;
        if (callee.name.startsWith('use') && !builtinHooks.includes(callee.name)) {
          // Generate a unique identifier for the hook
          const hookId = t.identifier(`${scope.generateUid(callee.name)}${HOOK_SUFFIX}`);

          // 过滤并类型检查参数
          const validArguments = init.node.arguments.filter(isValidArgument);
          const updateWatchers = generateUpdateWatchers(hookId, validArguments);
          // Create the createHook call
          const createHookCall = t.callExpression(t.identifier(importMap.useHook), [
            callee,
            // wrapUntrack(t.arrayExpression(validArguments)),
            t.arrayExpression(validArguments),
          ]);

          // Create a new variable declaration for the hook
          const hookDeclaration = t.variableDeclaration('let', [t.variableDeclarator(hookId, createHookCall)]);

          // Insert the new declaration and hook updaters before the current statement
          statementPath.insertBefore([hookDeclaration, ...updateWatchers]);

          // Replace the original call with hook.return();
          init.replaceWith(t.callExpression(t.memberExpression(hookId, t.identifier('value')), []));
        }
      }
    }
  });
}

// Generate update watchers for each argument, which is not static
function generateUpdateWatchers(
  hookId: t.Identifier,
  validArguments: (babel.types.SpreadElement | babel.types.Expression)[]
) {
  return validArguments
    .filter(arg => !t.isLiteral(arg))
    .map((arg, idx) => {
      const argName = `p${idx}`;
      return t.expressionStatement(
        t.callExpression(t.identifier('watch'), [
          t.arrowFunctionExpression(
            [],
            t.blockStatement([
              t.expressionStatement(
                t.callExpression(t.memberExpression(wrapUntrack(hookId), t.identifier('updateProp')), [
                  t.stringLiteral(argName),
                  arg,
                ])
              ),
            ])
          ),
        ])
      );
    });
}
