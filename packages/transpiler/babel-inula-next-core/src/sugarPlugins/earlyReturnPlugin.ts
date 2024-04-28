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

import { NodePath, type types as t } from '@babel/core';
import { createComponentNode, createCondNode, createJSXNode } from '../analyze/nodeFactory';
import { AnalyzeContext, Branch, Visitor } from '../analyze/types';
import { isValidPath } from '../analyze/utils';

export function earlyReturnPlugin(): Visitor {
  return {
    ReturnStatement(path: NodePath<t.ReturnStatement>, context: AnalyzeContext) {
      const currentComp = context.current;

      const argument = path.get('argument');
      if (argument.isJSXElement()) {
        currentComp.children = createJSXNode(currentComp, argument);
      }
    },
    IfStatement(ifStmt: NodePath<t.IfStatement>, context: AnalyzeContext) {
      if (!hasEarlyReturn(ifStmt)) {
        return;
      }
      const currentComp = context.current;

      const branches: Branch[] = [];
      let next: NodePath<t.Statement> | null = ifStmt;
      let branchIdx = 0;

      // Walk through the if-else chain to create branches
      while (next && next.isIfStatement()) {
        const nextConditions = [next.get('test')];
        // gen id for branch with babel
        const name = `$$branch-${branchIdx}`;
        branches.push({
          conditions: nextConditions,
          content: createComponentNode(name, getStatements(ifStmt.get('consequent')), currentComp),
        });

        const elseBranch: NodePath<t.Statement | null | undefined> = next.get('alternate');
        next = isValidPath(elseBranch) ? elseBranch : null;
        branchIdx++;
      }

      // Time for the else branch
      // We merge the else branch with the rest statements in fc body to form the children
      const elseBranch = next ? getStatements(next) : [];
      const defaultComponent = createComponentNode(
        '$$branch-default',
        elseBranch.concat(context.restStmt),
        currentComp
      );
      context.skipRest();

      currentComp.children = createCondNode(currentComp, defaultComponent, branches);
    },
  };
}

function getStatements(next: NodePath<t.Statement>) {
  return next.isBlockStatement() ? next.get('body') : [next];
}

function hasEarlyReturn(path: NodePath<t.Node>) {
  let hasReturn = false;
  path.traverse({
    ReturnStatement(path: NodePath<t.ReturnStatement>) {
      if (
        path.parentPath.isFunctionDeclaration() ||
        path.parentPath.isFunctionExpression() ||
        path.parentPath.isArrowFunctionExpression()
      ) {
        return;
      }
      hasReturn = true;
    },
  });
  return hasReturn;
}
