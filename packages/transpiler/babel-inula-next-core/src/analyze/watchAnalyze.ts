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
import { Visitor } from './types';
import { addWatch } from './nodeFactory';
import * as t from '@babel/types';
import { WATCH } from '../constants';
import { extractFnFromMacro } from '../utils';

/**
 * Analyze the watch in the function component
 */
export function watchAnalyze(): Visitor {
  return {
    ExpressionStatement(path: NodePath<t.ExpressionStatement>, ctx) {
      const callExpression = path.get('expression');
      if (callExpression.isCallExpression()) {
        const callee = callExpression.get('callee');
        if (callee.isIdentifier() && callee.node.name === WATCH) {
          const fnNode = extractFnFromMacro(callExpression, WATCH);
          const deps = getWatchDeps(callExpression);
          addWatch(ctx.current, fnNode, deps);
        }
      }
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
