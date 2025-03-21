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

import { NodePath } from '@babel/core';
import { LifeCycle, Visitor } from '../types';
import { addLifecycle, addWatch } from '../nodeFactory';
import { types as t } from '@openinula/babel-api';
import { DID_MOUNT, DID_UNMOUNT, WATCH, WILL_MOUNT, WILL_UNMOUNT, reactivityFuncNames } from '../../constants';
import { extractFnFromMacro, getFnBodyPath } from '../../utils';
import { getDependenciesFromNode } from '@openinula/reactivity-parser';

function isLifeCycleName(name: string): name is LifeCycle {
  return [WILL_MOUNT, DID_MOUNT, WILL_UNMOUNT, DID_UNMOUNT].includes(name);
}

/**
 * Analyze the functional macro in the function component
 * 1. lifecycle
 *   1. willMount
 *   2. didMount
 *   3. willUnMount
 *   4. didUnmount
 * 2. watch
 */
export function functionalMacroAnalyze(): Visitor {
  return {
    ExpressionStatement(path: NodePath<t.ExpressionStatement>, ctx) {
      const expression = path.get('expression');
      if (expression.isCallExpression()) {
        const callee = expression.get('callee');
        if (callee.isIdentifier()) {
          const calleeName = callee.node.name;
          // lifecycle
          if (isLifeCycleName(calleeName)) {
            const fnNode = extractFnFromMacro(expression, calleeName);
            addLifecycle(ctx.current, calleeName, getFnBodyPath(fnNode).node);
            return;
          }

          // watch
          if (calleeName === WATCH) {
            const fnPath = extractFnFromMacro(expression, WATCH);
            const depsPath = getWatchDeps(expression);

            const dependency = getDependenciesFromNode(
              (depsPath ?? fnPath).node,
              ctx.current._reactiveBitMap,
              reactivityFuncNames
            );

            addWatch(ctx.current, fnPath, dependency);
            return;
          }
        }
      }

      ctx.unhandledNode.push(path.node);
    },
  };
}

function getWatchDeps(callExpression: NodePath<t.CallExpression>) {
  const args = callExpression.get('arguments');
  if (!args[1]) {
    return null;
  }

  let deps: null | NodePath<t.ArrayExpression> = null;
  if (args[1].isArrayExpression()) {
    deps = args[1];
  } else {
    console.error('watch deps should be an array expression');
  }
  return deps;
}
