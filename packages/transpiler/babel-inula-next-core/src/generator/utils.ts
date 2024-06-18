import type { NodePath } from '@babel/core';
import { types as t, traverse } from '@openinula/babel-api';
import { ComponentNode, ReactiveVariable } from '../analyze/types';
import { importMap, reactivityFuncNames } from '../constants';

export function uid() {
  // ---- Or mock for testing
  // return Math.random().toString(36).substring(2, 10);
  return 'random_str';
}

/**
 * @View
 * if (Inula.notCached(self, ${uid}, depNode)) {${blockStatement}}
 */
export function wrapCheckCache(cacheNode: t.ArrayExpression, statements: t.Statement[]) {
  return t.ifStatement(
    t.callExpression(t.identifier(importMap.notCached), [t.identifier('self'), t.stringLiteral(uid()), cacheNode]),
    t.blockStatement(statements)
  );
}

/**
 * @brief Check if it's the left side of an assignment expression, e.g. count = 1
 * @param path
 * @returns assignment expression
 */
export function isAssignmentExpression(path: NodePath<t.Node>) {
  let parentPath = path.parentPath;
  while (parentPath && !t.isStatement(parentPath.node)) {
    if (t.isAssignmentExpression(parentPath.node)) {
      if (parentPath.node.left === path.node) return parentPath;
      const leftPath = parentPath.get('left') as NodePath;
      if (path.isDescendant(leftPath)) return parentPath;
    } else if (t.isUpdateExpression(parentPath.node)) {
      return parentPath;
    }
    parentPath = parentPath.parentPath;
  }

  return null;
}

/**
 * @View
 * xxx = yyy => self.updateDerived(xxx = yyy, 1)
 */
export function wrapUpdate(node: t.Statement | t.Expression | null, states: ReactiveVariable[]) {
  if (!node) return;
  const addUpdateDerived = (node: t.Node, bit: number) => {
    // add a call to updateDerived and comment show the bit
    const bitNode = t.numericLiteral(bit);
    t.addComment(bitNode, 'trailing', `0b${bit.toString(2)}`, false);
    return t.callExpression(t.memberExpression(t.identifier('self'), t.identifier('updateDerived')), [node, bitNode]);
  };
  traverse(nodeWrapFile(node), {
    Identifier: (path: NodePath<t.Identifier>) => {
      const variable = states.find(v => v.name === path.node.name);
      if (!variable) return;
      const assignmentPath = isAssignmentExpression(path);
      if (!assignmentPath) return;
      const assignmentNode = assignmentPath.node;
      const leftNode = t.assignmentExpression('=', assignmentNode.left, t.stringLiteral(''));
      // ---- Find all the states in the left
      const variables: ReactiveVariable[] = [];
      traverse(nodeWrapFile(leftNode), {
        Identifier: (path: NodePath<t.Identifier>) => {
          const variable = states.find(v => v.name === path.node.name);
          if (variable && !variables.find(v => v.name === variable.name)) {
            variables.push(variable);
          }
        },
      });
      const allBits = variables.reduce((acc, cur) => acc | cur.bit!, 0);
      assignmentPath.replaceWith(addUpdateDerived(assignmentNode, allBits));
      assignmentPath.skip();
    },
    CallExpression: (path: NodePath<t.CallExpression>) => {
      if (!t.isMemberExpression(path.node.callee)) return;
      const funcNameNode = path.node.callee.property;
      if (!t.isIdentifier(funcNameNode)) return;
      if (!reactivityFuncNames.includes(funcNameNode.name)) return;
      let callee = path.get('callee').get('object') as NodePath;

      while (t.isMemberExpression(callee.node)) {
        callee = callee.get('object') as NodePath;
      }

      const key = callee.node.name;

      const variable = states.find(v => v.name === key);
      if (!variable) return;
      path.replaceWith(addUpdateDerived(path.node, variable.bit!));
      path.skip();
    },
  });
}

export function getStates(root: ComponentNode) {
  return root.variables.filter(v => v.type === 'reactive' && v.bit) as ReactiveVariable[];
}

export function nodeWrapFile(node: t.Expression | t.Statement): t.File {
  return t.file(t.program([t.isStatement(node) ? node : t.expressionStatement(node)]));
}
