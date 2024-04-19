import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export function extractFnFromMacro(path: NodePath<t.CallExpression>, macroName: string) {
  const args = path.get('arguments');

  const fnNode = args[0];
  if (fnNode.isFunctionExpression() || fnNode.isArrowFunctionExpression()) {
    return fnNode;
  }

  throw new Error(`${macroName} macro must have a function argument`);
}

export function getFnBody(path: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>) {
  const fnBody = path.get('body');
  if (fnBody.isExpression()) {
    // turn expression into block statement for consistency
    fnBody.replaceWith(t.blockStatement([t.returnStatement(fnBody.node)]));
  }
  return (fnBody as NodePath<t.BlockStatement>).get('body');
}
