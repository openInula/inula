import { ComponentNode, Variable } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateComp } from './compGenerator';
import { getStates, wrapUpdate } from './utils';

function reconstructVariable(variable: Variable) {
  if (variable.type === 'reactive') {
    return t.variableDeclaration(variable.kind, [t.variableDeclarator(t.identifier(variable.name), variable.value)]);
  }

  if (variable.type === 'method') {
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

  const compNode = t.functionDeclaration(t.identifier(root.name), [], t.blockStatement([]));

  const addStatement = (...statements: t.Statement[]) => {
    compNode.body.body.push(...statements);
  };

  // ---- Declare self
  addStatement(t.variableDeclaration('let', [t.variableDeclarator(t.identifier('self'))]));

  // ---- Reconstruct the variables
  addStatement(...root.variables.map(reconstructVariable));

  // ---- Add comp
  addStatement(generateComp(root));

  // ---- Add return self
  addStatement(t.returnStatement(t.identifier('self')));

  return compNode;
}
