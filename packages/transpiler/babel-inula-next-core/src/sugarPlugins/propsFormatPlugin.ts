import babel, { NodePath, PluginObj } from '@babel/core';
import type { DLightOption } from '../types';
import { register } from '@openinula/babel-api';
import { COMPONENT } from '../constants';
import { ArrowFunctionWithBlock, extractFnFromMacro, isCompPath, wrapArrowFunctionWithBlock } from '../utils';
import { types as t } from '@openinula/babel-api';
import { type Scope } from '@babel/traverse';

export enum PropType {
  REST = 'rest',
  SINGLE = 'single',
}

interface Prop {
  name: string;
  type: PropType;
  alias?: string | null;
  defaultVal?: t.Expression | null;
  nestedProps?: string[] | null;
  nestedRelationship?: t.ObjectPattern | t.ArrayPattern | null;
}

// e.g. function({ prop1, prop2: [p20, p21] }) {}
// transform into
// function(prop1, prop2: [p20, p21]) {
//   let prop1_$$prop
//   let prop2_$$prop
//   let p20
//   let p21
// }
function createPropAssignment(prop: Prop, scope: Scope) {
  const newName = `${prop.name}_$$prop`;
  const decalrations = [t.variableDeclaration('let', [t.variableDeclarator(t.identifier(newName), prop.defaultVal)])];
  if (prop.alias) {
    decalrations.push(
      t.variableDeclaration('let', [
        t.variableDeclarator(t.identifier(`${prop.alias}`), t.identifier(`${prop.name}_$$prop`)),
      ])
    );
  }
  if (prop.nestedRelationship) {
    decalrations.push(
      t.variableDeclaration('let', [t.variableDeclarator(prop.nestedRelationship, t.identifier(`${prop.name}_$$prop`))])
    );
  }

  if (!prop.nestedRelationship || !prop.alias) {
    // this means the prop can be used directly in the function body
    // need rename the prop
    scope.rename(prop.name, newName);
  }
  return decalrations;
}

/**
 * Find the props destructuring in the function body, like:
 * const { prop1, prop2 } = props;
 * To extract the props
 * @param fnPath
 * @param propsName
 */
function extractPropsDestructingInFnBody(
  fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>,
  propsName: string
) {
  let props: Prop[] = [];
  const body = fnPath.get('body') as NodePath<t.BlockStatement>;
  body.traverse({
    VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
      // find the props destructuring, like const { prop1, prop2 } = props;
      const declarations = path.get('declarations');
      declarations.forEach(declaration => {
        const init = declaration.get('init');
        const id = declaration.get('id');
        if (init.isIdentifier() && init.node.name === propsName) {
          if (id.isObjectPattern()) {
            props = id.get('properties').map(prop => parseProperty(prop));
          } else if (id.isIdentifier()) {
            props = extractPropsDestructingInFnBody(fnPath, id.node.name);
          }
          // delete the declaration
          if (props.length > 0) {
            path.remove();
          }
        }
      });
    },
  });
  return props;
}

/**
 * The props format plugin, which is used to format the props of the component
 * Goal: turn every pattern of props into a standard format
 *
 * 1. Nested props
 * 2. props.xxx
 *
 * @param api
 * @param options
 */
export default function (api: typeof babel, options: DLightOption): PluginObj {
  register(api);
  let props: Prop[];

  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isCompPath(path)) {
          const fnPath = extractFnFromMacro(path, COMPONENT) as
            | NodePath<t.FunctionExpression>
            | NodePath<ArrowFunctionWithBlock>;
          // --- transform the props ---
          if (fnPath.isArrowFunctionExpression()) {
            wrapArrowFunctionWithBlock(fnPath);
          }

          // --- analyze the function props ---
          const params = fnPath.get('params') as NodePath<t.Identifier | t.RestElement | t.Pattern>[];
          if (params.length === 0) {
            return;
          }

          const propsPath = params[0];
          if (propsPath) {
            if (propsPath.isObjectPattern()) {
              // --- object destructuring ---
              props = propsPath.get('properties').map(prop => parseProperty(prop));
            } else if (propsPath.isIdentifier()) {
              // --- identifier destructuring ---
              props = extractPropsDestructingInFnBody(fnPath, propsPath.node.name);
            }
          }

          fnPath.node.body.body.unshift(...props.flatMap(prop => createPropAssignment(prop, fnPath.scope)));

          // --- clear the props ---
          fnPath.node.params = [];
        }
      },
    },
  };
}

function parseProperty(path: NodePath<t.ObjectProperty | t.RestElement>): Prop {
  if (path.isObjectProperty()) {
    // --- normal property ---
    const key = path.node.key;
    const value = path.node.value;
    if (t.isIdentifier(key) || t.isStringLiteral(key)) {
      const name = t.isIdentifier(key) ? key.name : key.value;
      return analyzeNestedProp(value, name);
    }

    throw Error(`Unsupported key type in object destructuring: ${key.type}`);
  } else {
    // --- rest element ---
    const arg = path.get('argument');
    if (!Array.isArray(arg) && arg.isIdentifier()) {
      return {
        type: PropType.REST,
        name: arg.node.name,
      };
    }
    throw Error('Unsupported rest element type in object destructuring');
  }
}

function analyzeNestedProp(value: t.ObjectProperty['value'], name: string): Prop {
  let defaultVal: t.Expression | null = null;
  let alias: string | null = null;
  const nestedProps: string[] | null = [];
  let nestedRelationship: t.ObjectPattern | t.ArrayPattern | null = null;
  if (t.isIdentifier(value)) {
    // 1. handle alias without default value
    // handle alias without default value
    if (name !== value.name) {
      alias = value.name;
    }
  } else if (t.isAssignmentPattern(value)) {
    // 2. handle default value case
    const assignedName = value.left;
    defaultVal = value.right;
    if (t.isIdentifier(assignedName)) {
      if (assignedName.name !== name) {
        // handle alias in default value case
        alias = assignedName.name;
      }
    } else {
      throw Error(`Unsupported assignment type in object destructuring: ${assignedName.type}`);
    }
  } else if (t.isObjectPattern(value) || t.isArrayPattern(value)) {
    nestedRelationship = value;
  }

  return { type: PropType.SINGLE, name, defaultVal, alias, nestedProps, nestedRelationship };
}
