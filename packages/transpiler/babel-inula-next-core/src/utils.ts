import { NodePath } from '@babel/core';
import {types as t} from '@openinula/babel-api';
import { COMPONENT } from './constants';

export function extractFnFromMacro(
  path: NodePath<t.CallExpression>,
  macroName: string
): NodePath<t.FunctionExpression> | NodePath<t.ArrowFunctionExpression> {
  const args = path.get('arguments');

  const fnNode = args[0];
  if (fnNode.isFunctionExpression() || fnNode.isArrowFunctionExpression()) {
    return fnNode;
  }

  throw new Error(`${macroName} macro must have a function argument`);
}

export function isFnExp(node: t.Node | null | undefined): node is t.FunctionExpression | t.ArrowFunctionExpression {
  return t.isFunctionExpression(node) || t.isArrowFunctionExpression(node);
}

export function getFnBodyPath(path: NodePath<t.FunctionExpression | t.ArrowFunctionExpression>) {
  const fnBody = path.get('body');
  if (fnBody.isExpression()) {
    // turn expression into block statement for consistency
    fnBody.replaceWith(t.blockStatement([t.returnStatement(fnBody.node)]));
  }

  return fnBody as unknown as NodePath<t.BlockStatement>;
}

export function getFnBodyNode(node: t.FunctionExpression | t.ArrowFunctionExpression) {
  const fnBody = node.body;
  if (t.isExpression(fnBody)) {
    // turn expression into block statement for consistency
    return t.blockStatement([t.returnStatement(fnBody)]);
  }

  return fnBody;
}

export function isCompPath(path: NodePath<t.CallExpression>) {
  // find the component, like: Component(() => {})
  const callee = path.get('callee');
  return callee.isIdentifier() && callee.node.name === COMPONENT;
}

export interface ArrowFunctionWithBlock extends t.ArrowFunctionExpression {
  body: t.BlockStatement;
}

export function wrapArrowFunctionWithBlock(path: NodePath<t.ArrowFunctionExpression>): ArrowFunctionWithBlock {
  const { node } = path;
  if (node.body.type !== 'BlockStatement') {
    node.body = t.blockStatement([t.returnStatement(node.body)]);
  }

  return node as ArrowFunctionWithBlock;
}

export function createMacroNode(fnBody: t.BlockStatement, macroName: string) {
  return t.callExpression(t.identifier(macroName), [t.arrowFunctionExpression([], fnBody)]);
}

export function isValidPath<T>(path: NodePath<T>): path is NodePath<Exclude<T, undefined | null>> {
  return !!path.node;
}
