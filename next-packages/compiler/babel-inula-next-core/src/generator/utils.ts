import type { NodePath } from '@babel/core';
import { types as t, traverse } from '@openinula/babel-api';
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
 * xxx = yyy => self.wave(xxx = yyy, 1)
 */
export function wrapUpdate(
  selfId: t.Identifier,
  node: t.Statement | t.Expression | null,
  getWaveBits: (name: string) => number
) {
  if (!node) return;
  const addWave = (node: t.CallExpression['arguments'][number], bit: number) => {
    // add a call to wave and comment show the bit
    const bitNode = t.numericLiteral(bit);
    t.addComment(bitNode, 'trailing', `0b${bit.toString(2)}`, false);
    return t.callExpression(t.memberExpression(selfId, t.identifier('wave')), [node, bitNode]);
  };
  traverse(nodeWrapFile(node), {
    Identifier: (path: NodePath<t.Identifier>) => {
      if (!getWaveBits(path.node.name)) return;

      const assignmentPath = isAssignmentExpression(path);
      if (!assignmentPath) return;

      const assignmentNode = assignmentPath.node;
      const writingNode = extractWritingPart(assignmentNode); // the variable writing part of the assignment
      if (!writingNode) return;

      // ---- Find all the states in the left
      let allBits = 0;
      traverse(nodeWrapFile(writingNode), {
        Identifier: (path: NodePath<t.Identifier>) => {
          allBits |= getWaveBits(path.node.name);
        },
      });
      assignmentPath.replaceWith(addWave(assignmentNode, allBits));
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

        const waveBits = getWaveBits(key);
        if (!waveBits) return;
        path.replaceWith(addWave(path.node, waveBits));
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

export function nodeWrapFile(node: t.Expression | t.Statement): t.File {
  return t.file(t.program([t.isStatement(node) ? node : t.expressionStatement(node)]));
}
