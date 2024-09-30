import { types as t } from '@openinula/babel-api';
import { Bitmap } from '@openinula/reactivity-parser';
import { IRNode, Variable, WatchFunc } from '../analyze/types';
import { getStates, wrapCheckCache, wrapUpdate } from './utils';
import { HOOK_SUFFIX } from '../constants';
import { importMap } from '../constants';
import { generateSelfId } from './index';

/**
 * wrap stmt in runOnce function, like
 * runOnce(() => log(1));
 * @param stmt
 */
function wrapRunOnce(stmt: t.Statement) {
  return t.expressionStatement(
    t.callExpression(t.identifier(importMap.runOnce), [t.arrowFunctionExpression([], t.blockStatement([stmt]))])
  );
}

export function generateUpdateState(root: IRNode) {
  const states = getStates(root);
  const blockNode = t.blockStatement([]);

  // ---- Merge same bits and same dep keys
  const updates: Record<Bitmap, [t.ArrayExpression | null, t.Statement[]][]> = {};

  const getDepStatements = (bitMap: number, depNode: t.ArrayExpression | null) => {
    const cacheMap = updates[bitMap];
    for (const [key, statements] of cacheMap) {
      if (key === null && depNode === null) return statements;
      if (t.isNodesEquivalent(key!, depNode!)) return statements;
    }
    const statements: t.Statement[] = [];
    cacheMap.push([depNode, statements]);
    return statements;
  };

  const variableAddUpdate = (variable: Variable) => {
    if (variable.type !== 'reactive') return;
    const bitMap = variable.dependency?.depMask;
    if (!bitMap) return;
    /**
     * @View
     * variable = ${value}
     */
    let updateNode = t.expressionStatement(
      t.assignmentExpression('=', t.identifier(variable.name), variable.value ?? t.nullLiteral())
    );
    if (variable.name.endsWith(HOOK_SUFFIX)) {
      updateNode = wrapRunOnce(updateNode);
    } else {
      wrapUpdate(generateSelfId(root.level), updateNode, states);
    }

    const depsNode = variable.dependency!.dependenciesNode;
    if (!updates[bitMap]) {
      updates[bitMap] = [];
    }
    getDepStatements(bitMap, depsNode).push(updateNode);
  };

  root.variables.forEach(variableAddUpdate);

  // ---- Add watch
  const addWatch = (watch: WatchFunc) => {
    if (!watch.dependency) return;
    const bitMap = watch.dependency.depMask!;
    let updateNode: t.Statement | t.Expression = watch.callback.node.body;
    if (t.isExpression(updateNode)) updateNode = t.expressionStatement(updateNode);
    wrapUpdate(generateSelfId(root.level), updateNode, states);

    const depsNode = watch.dependency.dependenciesNode;
    if (!updates[bitMap]) {
      updates[bitMap] = [];
    }

    getDepStatements(bitMap, depsNode).push(updateNode);
  };

  root.watch?.forEach(addWatch);

  /**
   * @view
   * if (changed & bit) {
   *   ${statements}
   * }
   */
  const addUpdate = (bit: Bitmap, statements: t.Statement[]) => {
    blockNode.body.push(
      t.ifStatement(
        t.binaryExpression('&', t.identifier('changed'), t.numericLiteral(bit)),
        t.blockStatement(statements)
      )
    );
  };

  for (const [bit, cacheMap] of Object.entries(updates)) {
    for (const [depsNode, statements] of cacheMap) {
      addUpdate(
        Number(bit),
        depsNode ? [wrapCheckCache(generateSelfId(root.level), depsNode, statements)] : statements
      );
    }
  }

  return t.arrowFunctionExpression([t.identifier('changed')], blockNode);
}
