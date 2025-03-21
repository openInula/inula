import { type NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { COMPONENT, HOOK, importMap, USE_CONTEXT } from './constants';
import { minimatch } from 'minimatch';
import { CompilerError } from '@openinula/error-handler';

export function fileAllowed(fileName: string | undefined, includes: string[], excludes: string[]): boolean {
  if (includes.includes('*')) return true;
  if (!fileName) return false;
  if (excludes.some(pattern => minimatch(fileName, pattern))) return false;
  return includes.some(pattern => minimatch(fileName, pattern));
}

export function addImport(programNode: t.Program, importMap: Record<string, string>, packageName: string) {
  programNode!.body.unshift(
    t.importDeclaration(
      Object.entries(importMap).map(([key, value]) => t.importSpecifier(t.identifier(value), t.identifier(key))),
      t.stringLiteral(packageName)
    )
  );
}

export function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export function extractFnFromMacro(
  path: NodePath<t.CallExpression>,
  macroName: string
): NodePath<t.FunctionExpression> | NodePath<t.ArrowFunctionExpression> {
  const args = path.get('arguments');

  const fnNode = args[0];
  if (fnNode.isFunctionExpression() || fnNode.isArrowFunctionExpression()) {
    return fnNode;
  }

  throw new CompilerError(`${macroName} macro must have a function argument`, path.node.loc);
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

export function isUseContext(path: NodePath<t.CallExpression>) {
  // find the use context, like: useContext()
  const callee = path.get('callee');
  return callee.isIdentifier() && callee.node.name === USE_CONTEXT;
}

export function isHookPath(path: NodePath<t.CallExpression>) {
  // find the component, like: Component(() => {})
  const callee = path.get('callee');
  return callee.isIdentifier() && callee.node.name === HOOK;
}

export function getMacroType(path: NodePath<t.CallExpression>) {
  if (isCompPath(path)) {
    return COMPONENT;
  }
  if (isHookPath(path)) {
    return HOOK;
  }

  return null;
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

export function createMacroNode(
  fnBody: t.BlockStatement,
  macroName: string,
  params: t.FunctionExpression['params'] = []
) {
  return t.callExpression(t.identifier(macroName), [t.arrowFunctionExpression(params, fnBody)]);
}

export function isValidPath<T>(path: NodePath<T>): path is NodePath<Exclude<T, undefined | null>> {
  return !!path.node;
}

/**
 * Wrap the expression with untrack
 * e.g. untrack(() => a)
 */
export function wrapUntrack(node: t.Expression) {
  return t.callExpression(t.identifier(importMap.untrack), [t.arrowFunctionExpression([], node)]);
}

/**
 * Convert a bitmap to an array of indices where bits are set to 1
 * @param {number} bitmap - The bitmap to convert
 * @returns {number[]} Array of indices where bits are set
 */
export function bitmapToIndices(bitmap: number): number[] {
  // Handle edge cases
  if (bitmap === 0) return [];
  if (bitmap < 0) throw new Error('Negative numbers are not supported');

  const indices = [];
  let currentBit = 0;

  // Continue until we've processed all set bits
  while (bitmap > 0) {
    // Check if current bit is set
    if (bitmap & 1) {
      indices.push(1 << currentBit);
    }

    // Move to next bit
    bitmap = bitmap >>> 1;
    currentBit++;
  }

  return indices;
}
export function mergeVisitor<T extends Record<string, any>>(...visitors: Array<() => T>): T {
  return visitors.reduce<T>((acc, cur) => {
    return { ...acc, ...cur() };
  }, {} as T);
}

export function assertIdOrDeconstruct(id: NodePath<t.LVal>, error: string): asserts id is NodePath<t.Identifier> {
  if (!id.isIdentifier() && !id.isObjectPattern() && !id.isArrayPattern()) {
    throw new Error(error);
  }
}
