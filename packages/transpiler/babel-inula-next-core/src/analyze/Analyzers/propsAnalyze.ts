import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { AnalyzeContext, Visitor } from '../types';

export function propsAnalyze(ast: NodePath<t.Identifier | t.RestElement | t.Pattern>): Visitor {
  return {
    Prop: (path: NodePath<t.RestElement | t.ObjectProperty>, { builder }: AnalyzeContext) => {
      if (path.isRestElement()) {
        // --- rest element ---
        const arg = path.get('argument');
        if (!Array.isArray(arg) && arg.isIdentifier()) {
          builder.addRestProps(arg.node.name);
          return;
        }
        throw Error('Unsupported rest element type in object destructuring');
      } else if (path.isObjectProperty()) {
        const key = path.node.key;
        if (t.isIdentifier(key) || t.isStringLiteral(key)) {
          const name = t.isIdentifier(key) ? key.name : key.value;
          builder.addSingleProp(name, path.get('value'), path.node);
          return;
        }

        throw Error(`Unsupported key type in object destructuring: ${key.type}`);
      }
    },
    Props: (path: NodePath<t.Identifier>, { builder }: AnalyzeContext) => {
      builder.addProps(path.node.name, path.node);
    },
  };
}
