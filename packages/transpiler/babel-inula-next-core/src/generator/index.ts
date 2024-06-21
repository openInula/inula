import { ComponentNode, Variable } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateComp } from './compGenerator';
import { getStates, wrapUpdate } from './utils';

function reconstructVariable(variable: Variable) {
  if (variable.type === 'reactive') {
    // ---- If it is a computed, we initiate and modify it in `updateState`
    const kind = variable.dependency ? 'let' : variable.kind;
    const value = variable.dependency ? null : variable.value;
    return t.variableDeclaration(kind, [t.variableDeclarator(t.identifier(variable.name), value)]);
  }

  if (variable.type === 'plain') {
    return variable.value;
  }

  // --- SubComp
  return t.variableDeclaration('const', [t.variableDeclarator(t.identifier(variable.name), variable.fnNode.node)]);
}

export function generate(root: ComponentNode): t.FunctionDeclaration {
  const states = getStates(root);

  // ---- Wrap each variable with update
  root.variables.forEach(variable => {
    if (variable.type === 'subComp') return;
    wrapUpdate(variable.value, states);
  });

  const compNode = t.functionDeclaration(t.identifier(root.name), root.params, t.blockStatement([]));

  const addStatement = (...statements: t.Statement[]) => {
    compNode.body.body.push(...statements);
  };

  // ---- Declare self
  addStatement(t.variableDeclaration('let', [t.variableDeclarator(t.identifier('self'))]));

  // ---- Reconstruct the variables
  addStatement(...root.variables.map(reconstructVariable));

  // ---- Add comp
  addStatement(...generateComp(root));

  // ---- Add return self.init()
  addStatement(t.returnStatement(t.callExpression(t.memberExpression(t.identifier('self'), t.identifier('init')), [])));

  return compNode;
}
