import { ComponentNode, Variable } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateComp, generateLifecycle } from './compGenerator';
import { getStates, wrapUpdate } from './utils';
import { WILL_MOUNT } from '../constants';

function reconstructVariable(variable: Variable) {
  if (variable.type === 'reactive') {
    // ---- If it is a dependency, it is a let, then we can modify it in `updateState`
    const kind = variable.dependency ? 'let' : variable.kind;
    return t.variableDeclaration(kind, [t.variableDeclarator(t.identifier(variable.name), variable.value)]);
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

  const compNode = t.functionDeclaration(t.identifier(root.name), root.params, t.blockStatement([]));

  const addStatement = (...statements: t.Statement[]) => {
    compNode.body.body.push(...statements);
  };

  // ---- Declare self
  addStatement(t.variableDeclaration('let', [t.variableDeclarator(t.identifier('self'))]));

  // ---- Reconstruct the variables
  addStatement(...root.variables.map(reconstructVariable));

  // ---- Add willMount
  if (root.lifecycle[WILL_MOUNT]?.length) {
    addStatement(...(generateLifecycle(root, WILL_MOUNT).body as t.BlockStatement).body);
  }

  // ---- Add comp
  addStatement(...generateComp(root));

  // ---- Add return self
  addStatement(t.returnStatement(t.identifier('self')));

  return compNode;
}
