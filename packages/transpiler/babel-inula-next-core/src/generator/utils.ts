import type { NodePath } from '@babel/core';
import { types as t, traverse } from '@openinula/babel-api';
import { IRBlock, ReactiveVariable } from '../analyze/types';
import { importMap, reactivityFuncNames } from '../constants';

export function uid(idx: number) {
  return t.stringLiteral(`cache${idx}`);
}

/**
 * @View
 * if (Inula.notCached(self, ${uid}, depNode)) {${blockStatement}}
 */
export function wrapCheckCache(
  selfId: t.Identifier,
  cacheNode: t.ArrayExpression,
  statements: t.Statement[],
  idx: number
) {
  return t.ifStatement(
    t.callExpression(t.identifier(importMap.notCached), [selfId, uid(idx), cacheNode]),
    t.blockStatement(statements)
  );
}

/**
 * @brief Check if it's the left side of an assignment expression, e.g. count = 1 or count++
 * @param path
 * @returns assignment expression
 */
export function isAssignmentExpression(
  path: NodePath<t.Node>
): NodePath<t.AssignmentExpression> | NodePath<t.UpdateExpression> | null {
  let parentPath = path.parentPath;
  while (parentPath && !t.isStatement(parentPath.node)) {
    if (parentPath.isAssignmentExpression()) {
      if (parentPath.node.left === path.node) return parentPath;
      const leftPath = parentPath.get('left') as NodePath;
      if (path.isDescendant(leftPath)) return parentPath;
    } else if (parentPath.isUpdateExpression()) {
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
export function wrapUpdate(selfId: t.Identifier, node: t.Statement | t.Expression | null, states: ReactiveVariable[]) {
  if (!node) return;
  const addUpdateDerived = (node: t.CallExpression['arguments'][number], bit: number) => {
    // add a call to updateDerived and comment show the bit
    const bitNode = t.numericLiteral(bit);
    t.addComment(bitNode, 'trailing', `0b${bit.toString(2)}`, false);
    return t.callExpression(t.identifier(importMap.updateNode), [selfId, node, bitNode]);
  };
  traverse(nodeWrapFile(node), {
    Identifier: (path: NodePath<t.Identifier>) => {
      const variable = states.find(v => v.name === path.node.name);
      if (!variable) return;

      const assignmentPath = isAssignmentExpression(path);
      if (!assignmentPath) return;

      const assignmentNode = assignmentPath.node;
      const writingNode = extractWritingPart(assignmentNode); // the variable writing part of the assignment
      if (!writingNode) return;

      // ---- Find all the states in the left
      const variables: ReactiveVariable[] = [];
      traverse(nodeWrapFile(writingNode), {
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
      // handle collections mutable methods, like arr.push()
      if (!t.isMemberExpression(path.node.callee)) return;
      const funcNameNode = path.node.callee.property;
      if (!t.isIdentifier(funcNameNode)) return;
      if (!reactivityFuncNames.includes(funcNameNode.name)) return;

      // Traverse up the member expression chain to find the root object
      let callee = (path.get('callee') as NodePath<t.MemberExpression>).get('object');
      while (callee.isMemberExpression()) {
        callee = callee.get('object');
      }

      if (callee.isIdentifier()) {
        const key = callee.node.name;

        const variable = states.find(v => v.name === key);
        if (!variable) return;
        path.replaceWith(addUpdateDerived(path.node, variable.bit!));
      }

      path.skip();
    },
  });
}

function extractWritingPart(assignmentNode: t.AssignmentExpression | t.UpdateExpression) {
  // Handle different types of assignments
  if (t.isUpdateExpression(assignmentNode)) {
    // For update expressions like ++x or --x
    return assignmentNode.argument;
  } else if (t.isAssignmentExpression(assignmentNode)) {
    // For regular assignments, create a new assignment expression
    // with an empty string as right side (placeholder)
    return t.assignmentExpression('=', assignmentNode.left, t.stringLiteral(''));
  }
  return null;
}

export function getStates(root: IRBlock) {
  return root.variables.filter(v => v.type === 'reactive' && v.bit) as ReactiveVariable[];
}

export function nodeWrapFile(node: t.Expression | t.Statement): t.File {
  return t.file(t.program([t.isStatement(node) ? node : t.expressionStatement(node)]));
}
