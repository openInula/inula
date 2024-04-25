import { type types as t, type NodePath } from '@babel/core';
import { AnalyzeContext, Visitor } from './types';
import { addProp } from './nodeFactory';
import { PropType } from '../constants';
import { types } from '../babelTypes';

/**
 * Analyze the props deconstructing in the function component
 * 1. meet identifier, just collect the name
 * 2. has alias, collect the alias name
 * 3. has default value, collect the default value
 * 4. has rest element, collect the rest element
 * 5. nested destructuring, the e2e goal:
 * ```js
 *  function(prop1, prop2: [p20, p21]) {}
 *  // transform into
 *  function({ prop1, prop2: [p20, p21] }) {
 *    let p20, p21
 *    watch(() => {
 *      [p20, p21] = prop2
 *    })
 *  }
 * ```
 */
export function propsAnalyze(): Visitor {
  return {
    Prop(path: NodePath<t.ObjectProperty | t.RestElement>, ctx) {
      if (path.isObjectProperty()) {
        // --- normal property ---
        const key = path.node.key;
        const value = path.node.value;
        if (types.isIdentifier(key) || types.isStringLiteral(key)) {
          const name = types.isIdentifier(key) ? key.name : key.value;
          analyzeSingleProp(value, name, path, ctx);
          return;
        }

        throw Error(`Unsupported key type in object destructuring: ${key.type}`);
      } else {
        // --- rest element ---
        const arg = path.get('argument');
        if (!Array.isArray(arg) && arg.isIdentifier()) {
          addProp(ctx.current, PropType.REST, arg.node.name);
        }
      }
    },
  };
}

function analyzeSingleProp(
  value: t.ObjectProperty['value'],
  key: string,
  path: NodePath<t.ObjectProperty>,
  { current }: AnalyzeContext
) {
  let defaultVal: t.Expression | null = null;
  let alias: string | null = null;
  const nestedProps: string[] | null = [];
  let nestedRelationship: t.ObjectPattern | t.ArrayPattern | null = null;
  if (types.isIdentifier(value)) {
    // 1. handle alias without default value
    // handle alias without default value
    if (key !== value.name) {
      alias = value.name;
    }
  } else if (types.isAssignmentPattern(value)) {
    // 2. handle default value case
    const assignedName = value.left;
    defaultVal = value.right;
    if (types.isIdentifier(assignedName)) {
      if (assignedName.name !== key) {
        // handle alias in default value case
        alias = assignedName.name;
      }
    } else {
      throw Error(`Unsupported assignment type in object destructuring: ${assignedName.type}`);
    }
  } else if (types.isObjectPattern(value) || types.isArrayPattern(value)) {
    // 3. nested destructuring
    // we should collect the identifier that can be used in the function body as the prop
    // e.g. function ({prop1, prop2: [p20X, {p211, p212: p212X}]}
    // we should collect prop1, p20X, p211, p212X
    path.get('value').traverse({
      Identifier(path) {
        // judge if the identifier is a prop
        // 1. is the key of the object property and doesn't have alias
        // 2. is the item of the array pattern and doesn't have alias
        // 3. is alias of the object property
        const parentPath = path.parentPath;
        if (parentPath.isObjectProperty() && path.parentKey === 'value') {
          // collect alias of the object property
          nestedProps.push(path.node.name);
        } else if (
          parentPath.isArrayPattern() ||
          parentPath.isObjectPattern() ||
          parentPath.isRestElement() ||
          (parentPath.isAssignmentPattern() && path.key === 'left')
        ) {
          // collect the key of the object property or the item of the array pattern
          nestedProps.push(path.node.name);
        }
      },
    });
    nestedRelationship = value;
  }
  addProp(current, PropType.SINGLE, key, defaultVal, alias, nestedProps, nestedRelationship);
}
