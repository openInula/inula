import { ComponentNode, HookNode, IRStmt, SubComponentNode, Variable } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateComp } from './compGenerator';
import { getStates, wrapUpdate } from './utils';
import { HOOK_SUFFIX, importMap } from '../constants';

// according to the type of IRStmt
export type Generator = {
  [type in IRStmt['type']]?: (stmt: Extract<IRStmt, { type: type }>) => t.Statement | t.Statement[];
};
const builtinGenerators: Generator = [];
function reconstructVariable(variable: Variable) {
  if (variable.type === 'reactive') {
    // ---- If it is a computed, we initiate and modify it in `updateState`
    const kind = variable.dependency ? 'let' : variable.kind;
    const value = variable.dependency ? null : variable.value;
    if (variable.name.endsWith(HOOK_SUFFIX)) {
      (variable.value as t.CallExpression).arguments.push(t.numericLiteral(variable.bit!));
    }
    return t.variableDeclaration(kind, [t.variableDeclarator(t.identifier(variable.name), value)]);
  }

  if (variable.type === 'plain') {
    return variable.value;
  }

  // --- SubComp
  return generate(variable);
}

export function generate(root: ComponentNode | SubComponentNode | HookNode): t.FunctionDeclaration {
  const states = getStates(root);

  const fnBody: t.Statement[] = root.body.map(stmt => {
    if (stmt.type === 'init') {
      return stmt.block;
    }
  });
  // ---- Wrap each variable with update
  root.variables.forEach(variable => {
    if (variable.type === 'subComp') return;
    wrapUpdate(generateSelfId(root.level), variable.value, states);
  });

  const compNode = t.functionDeclaration(t.identifier(root.name), root.params, t.blockStatement([]));

  const addStatement = (...statements: t.Statement[]) => {
    compNode.body.body.push(...statements);
  };

  // ---- Declare self
  addStatement(t.variableDeclaration('let', [t.variableDeclarator(generateSelfId(root.level))]));

  // ---- Reconstruct the variables
  addStatement(...root.variables.map(reconstructVariable));

  // ---- Add comp
  addStatement(...generateComp(root));

  // ---- Add return self.init()
  addStatement(t.returnStatement(t.callExpression(t.identifier(importMap.initCompNode), [generateSelfId(root.level)])));

  return compNode;
}

export function generateSelfId(level: number) {
  return t.identifier(`self${level ? level : ''}`);
}
