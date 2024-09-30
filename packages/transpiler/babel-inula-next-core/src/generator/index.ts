import { ComponentNode, HookNode, SubComponentNode, Variable } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { generateComp } from './compGenerator';
import { getStates, wrapUpdate } from './utils';
import { HOOK_SUFFIX } from '../constants';

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
  addStatement(
    t.returnStatement(t.callExpression(t.memberExpression(generateSelfId(root.level), t.identifier('init')), []))
  );

  return compNode;
}

export function generateSelfId(level: number) {
  return t.identifier(`self${level ? level : ''}`);
}
