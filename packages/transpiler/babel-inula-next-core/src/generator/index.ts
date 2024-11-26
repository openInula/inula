import { ComponentNode, HookNode, IRStmt, SubComponentNode } from '../analyze/types';
import { types as t } from '@openinula/babel-api';
import { importMap, type ImportMapType } from '../constants';
import { stateGenerator } from './stateGenerator';
import { mergeVisitor } from '../utils';
import { BitManager } from '../analyze/IRBuilder';

interface GeneratorContext {
  selfId: t.Identifier;
  bitManager: BitManager;
  getReactBits: (depIdBitmap: number) => number;
  getWaveBits: (name: string) => number;
  getWaveBitsById: (id: number) => number;
  importMap: ImportMapType;
}

// according to the type of IRStmt
export type Generator<S = GeneratorContext> = {
  [type in IRStmt['type']]?: (stmt: Extract<IRStmt, { type: type }>, state: S) => t.Statement | t.Statement[];
};
const builtinGenerators: Array<() => Generator> = [stateGenerator];

export function generate(
  root: ComponentNode | SubComponentNode | HookNode,
  bitManager: BitManager
): t.FunctionDeclaration {
  const ctx: GeneratorContext = {
    selfId: generateSelfId(root.scope.level),
    bitManager,
    getReactBits: bitManager.getReactBits,
    getWaveBits: bitManager.getWaveBits.bind(null, root),
    getWaveBitsById: bitManager.getWaveBitsById,
    importMap,
  };

  const visitor = mergeVisitor(...builtinGenerators);
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
  return t.identifier(`self${level ? level : ''}`);
}
