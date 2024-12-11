import type { NodePath } from '@babel/core';
import { types as t } from '@openinula/babel-api';

export type DeconstruingPayload =
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

type DeconstruingDispatch = (payload: DeconstruingPayload) => void;
export function parseDeconstructable(
  path: NodePath<t.RestElement | t.Identifier | t.Pattern>,
  dispatch: DeconstruingDispatch
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
        throw Error('Unsupported rest element type in object destructuring');
      } else if (prop.isObjectProperty()) {
        // --- normal property ---
        const key = prop.node.key;
        if (t.isIdentifier(key) || t.isStringLiteral(key)) {
          const name = t.isIdentifier(key) ? key.name : key.value;
          dispatch({ type: 'single', name, value: prop.get('value'), node: prop.node });
          return;
        }

        throw Error(`Unsupported key type in object destructuring: ${key.type}`);
      }
    });
  } else if (path.isIdentifier()) {
    // --- props identifier ---
    dispatch({ type: 'props', name: path.node.name, node: path.node });
  } else {
    throw new Error(
      `Component ${name}: The first parameter of the function component must be an object pattern or identifier`
    );
  }
}
