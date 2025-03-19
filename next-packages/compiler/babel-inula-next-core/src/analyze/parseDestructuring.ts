import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';
import { CompilerError } from '@openinula/error-handler';

export type DestructuringPayload =
  | {
      type: 'rest';
      name: string;
    }
  | {
      type: 'single';
      name: string;
      value: NodePath<t.Expression | t.PatternLike>;
      node: t.ObjectProperty;
    }
  | {
      type: 'props';
      name: string;
      node: t.Identifier;
    };

type DestructuringDispatch = (payload: DestructuringPayload) => void;
export function parseDestructuring(
  path: NodePath<t.RestElement | t.Identifier | t.Pattern>,
  dispatch: DestructuringDispatch
) {
  if (path.isObjectPattern()) {
    path.get('properties').forEach(prop => {
      if (prop.isRestElement()) {
        // --- rest element ---
        const arg = prop.get('argument');
        if (!Array.isArray(arg) && arg.isIdentifier()) {
          dispatch({ type: 'rest', name: arg.node.name });
          return;
        }
        throw new CompilerError('Unsupported rest element type in object destructuring', prop.node.loc);
      } else if (prop.isObjectProperty()) {
        // --- normal property ---
        const key = prop.node.key;
        if (t.isIdentifier(key) || t.isStringLiteral(key)) {
          const name = t.isIdentifier(key) ? key.name : key.value;
          dispatch({ type: 'single', name, value: prop.get('value'), node: prop.node });
          return;
        }

        throw new CompilerError(`Unsupported key type in object destructuring: ${key.type}`, prop.node.loc);
      }
    });
  } else if (path.isIdentifier()) {
    // --- props identifier ---
    dispatch({ type: 'props', name: path.node.name, node: path.node });
  } else {
    throw new CompilerError(
      `Component ${name}: The first parameter of the function component must be an object pattern or identifier`,
      path.node.loc
    );
  }
}
