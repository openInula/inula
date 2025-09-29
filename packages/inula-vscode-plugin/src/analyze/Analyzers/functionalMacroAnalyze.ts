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
import { types as t } from '@openinula/babel-api';
import { DID_MOUNT, DID_UNMOUNT, WATCH, WILL_MOUNT, WILL_UNMOUNT } from '../../constants';
import { extractFnFromMacro } from '../../utils';

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
    ExpressionStatement(path: NodePath<t.ExpressionStatement>, { builder }) {
      const expression = path.get('expression');
      if (expression.isCallExpression()) {
        const callee = expression.get('callee');
        if (callee.isIdentifier()) {
          const calleeName = callee.node.name;
          // lifecycle
          if (isLifeCycleName(calleeName)) {
            const fnPath = extractFnFromMacro(expression, calleeName);
            builder.addLifecycle(calleeName, fnPath);
            return;
          }

          // watch
          if (calleeName === WATCH) {
            const fnPath = extractFnFromMacro(expression, WATCH);
            const depsPath = getWatchDeps(expression);

            const dependency = builder.getDependency((depsPath ?? fnPath).node);
            builder.addWatch(fnPath, dependency);
            return;
          }
        }
      }

      builder.addRawStmt(path.node);
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
