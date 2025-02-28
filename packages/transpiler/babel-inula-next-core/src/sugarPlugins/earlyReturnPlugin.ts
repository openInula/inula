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
import { isValidPath } from '../utils';
import { extractFnFromMacro, isCompPath, getFnBodyPath, createMacroNode } from '../utils';
import { COMPONENT } from '../constants';
import { Scope } from '@babel/traverse';

/**
 * Generate a conditional node with branches
 * ```jsx
 *   <if cond={count === 100}>
 *     <Comp_jf91a2 />
 *   </if>
 *   <else>
 *     <Comp_ao528j />
 *   </else>
 * ```
 * @param branches
 * @returns
 */
function generateCondNode(branches: Branch[]) {
  const branchNodes = branches.map((branch, idx) => {
    const tag = idx === 0 ? 'if' : idx === branches.length - 1 ? 'else' : 'else-if';
    const conditionAttr = branch.conditions
      ? [t.jSXAttribute(t.jSXIdentifier('cond'), t.jsxExpressionContainer(branch.conditions))]
      : [];

    // The branch node is a jsx element, like <if cond={count === 100}><Comp_jf91a2 /></if>
    return t.jsxElement(
      t.jsxOpeningElement(t.jSXIdentifier(tag), conditionAttr),
      t.jsxClosingElement(t.jSXIdentifier(tag)),
      [t.jsxElement(t.jsxOpeningElement(t.jSXIdentifier(branch.name), [], true), null, [], true)]
    );
  });

  return createFragmentNode(branchNodes);
}

function createFragmentNode(children: t.JSXElement[]) {
  return t.jSXFragment(t.jSXOpeningFragment(), t.jSXClosingFragment(), children);
}

export default function (api: typeof babel): PluginObj {
  register(api);

  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isCompPath(path)) {
          const fnPath = extractFnFromMacro(path, COMPONENT);
          const bodyPath = getFnBodyPath(fnPath);
          // iterate through the function body to find early return
          const ifStmtIndex = bodyPath.get('body').findIndex(stmt => stmt.isIfStatement() && hasEarlyReturn(stmt));
          if (ifStmtIndex === -1) {
            return;
          }

          const branches = parseBranches(
            bodyPath.get('body')[ifStmtIndex] as NodePath<t.IfStatement>,
            bodyPath.node.body.slice(ifStmtIndex + 1)
          );

          // At first, we remove the node after the if statement in the function body
          let i = bodyPath.node.body.length - 1;
          while (i >= ifStmtIndex) {
            bodyPath.get('body')[i].remove();
            i--;
          }

          // Then we generate  every branch component
          const branchNodes = branches.map(branch =>
            t.variableDeclaration('const', [t.variableDeclarator(t.identifier(branch.name), branch.content)])
          );
          // push the branch components to the function body
          bodyPath.pushContainer('body', branchNodes);

          // At last, we generate the cond node
          const condNode = generateCondNode(branches);
          bodyPath.pushContainer('body', t.returnStatement(condNode));
        }
      },
    },
  };
}

interface Branch {
  name: string;
  conditions?: t.Expression;
  content: t.CallExpression;
}

function parseBranches(ifStmt: NodePath<t.IfStatement>, restStmt: t.Statement[]) {
  const branches: Branch[] = [];
  let next: NodePath<t.Statement> | null = ifStmt;

  // Walk through the if-else chain to create branches
  while (next && next.isIfStatement()) {
    const nextConditions = next.node.test;
    // gen id for branch with babel
    branches.push({
      name: genUid(ifStmt.scope, 'Branch'),
      conditions: nextConditions,
      content: createMacroNode(t.blockStatement(getStatements(ifStmt.get('consequent'))), COMPONENT),
    });

    const elseBranch: NodePath<t.Statement | null | undefined> = next.get('alternate');
    next = isValidPath(elseBranch) ? elseBranch : null;
  }
  // Time for the else branch
  // We merge the else branch with the rest statements in fc body to form the children
  const elseBranch = next ? (next.isBlockStatement() ? next.node.body : [next.node]) : [];
  branches.push({
    name: genUid(ifStmt.scope, 'Default'),
    content: createMacroNode(t.blockStatement(elseBranch.concat(restStmt)), COMPONENT),
  });

  return branches;
}

function getStatements(next: NodePath<t.Statement>) {
  return next.isBlockStatement() ? next.node.body : [next.node];
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

export function genUid(scope: Scope, name: string) {
  let result = name;
  let i = 1;
  do {
    result = `${name}_${i}`;
    i++;
  } while (
    scope.hasBinding(result) ||
    scope.hasGlobal(result) ||
    scope.hasReference(result) ||
    scope.hasGlobal(result)
  );

  // Mark the id as a reference to prevent it from being renamed
  const program = scope.getProgramParent();
  program.references[result] = true;

  return result;
}
