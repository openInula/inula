import { ComponentNode, CompOrHook, HookNode, IRStmt } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { COMPONENT, CURRENT_COMPONENT, HOOK, importMap, type ImportMapType } from '../constants';
import { stateGenerator } from './stateGenerator';
import { mergeVisitor } from '../utils';
import { BitManager } from '../analyze/IRBuilder';
import { wrapUpdate } from './utils';
import { viewGenerator } from './viewGenerator';
import { rawStmtGenerator } from './rawStmtGenerator';
import { compGenerator } from './compGenerator';
import { functionalMacroGenerator } from './functionalMacroGenerator';
import { propGenerator } from './propGenerator';
import { hookGenerator } from './hookGenerator';

export interface GeneratorContext {
  selfId: t.Identifier;
  current: ComponentNode | HookNode;
  bitManager: BitManager;
  hoist: (node: t.Statement | t.Statement[]) => void;
  wrapUpdate: (node: t.Statement | t.Expression | null) => void;
  getReactBits: (depIdBitmap: number) => number;
  getWaveBits: (name: string) => number;
  getWaveBitsById: (id: number) => number;
  importMap: ImportMapType;
  parentId?: t.Identifier;
  templates: Array<[string, t.Expression]>;
}

// Generator type of IRStmt
export type Generator<S = GeneratorContext> = {
  [type in IRStmt['type']]?: (stmt: Extract<IRStmt, { type: type }>, state: S) => t.Statement | t.Statement[];
};

const compBuiltinGenerators: Array<() => Generator> = [
  stateGenerator,
  rawStmtGenerator,
  propGenerator,
  viewGenerator,
  compGenerator,
  rawStmtGenerator,
  functionalMacroGenerator,
];

const hookBuiltinGenerators: Array<() => Generator> = [
  stateGenerator,
  rawStmtGenerator,
  propGenerator,
  hookGenerator,
  rawStmtGenerator,
  functionalMacroGenerator,
];

function getBuiltinGenerators(type: 'comp' | 'hook') {
  if (type === 'comp') {
    return compBuiltinGenerators;
  }
  if (type === 'hook') {
    return hookBuiltinGenerators;
  }
  throw new Error('Unsupported type to analyze');
}

export function generate(
  root: ComponentNode | HookNode,
  bitManager: BitManager,
  hoist: (node: t.Statement | t.Statement[]) => void,
  parentId?: t.Identifier
): t.FunctionDeclaration {
  const ctx: GeneratorContext = {
    selfId: generateSelfId(root.scope.level),
    current: root,
    bitManager,
    hoist,
    wrapUpdate: (node: t.Statement | t.Expression | null) => {
      wrapUpdate(ctx.selfId, node, ctx.getWaveBits);
    },
    getReactBits: bitManager.getReactBits,
    getWaveBits: bitManager.getWaveBits.bind(null, root),
    getWaveBitsById: bitManager.getWaveBitsById,
    templates: [],
    importMap,
    parentId,
  };

  const visitor = mergeVisitor(...getBuiltinGenerators(root.type));
  const fnBody: t.Statement[] = root.body
    .map(stmt => {
      const generator = visitor[stmt.type];
      if (generator) {
        return generator(stmt as any, ctx);
      }
      console.warn(`No generator for stmt: ${stmt.type}`);
      return [];
    })
    .flat();

  return t.functionDeclaration(t.identifier(root.name), root.params, t.blockStatement(fnBody));
}

export function generateSelfId(level: number) {
  return t.identifier(`${CURRENT_COMPONENT}${level ? level : ''}`);
}
