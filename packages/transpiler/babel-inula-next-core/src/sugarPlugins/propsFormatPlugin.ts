import babel, { NodePath, PluginObj } from '@babel/core';
import type { DLightOption } from '../types';
import { register } from '@openinula/babel-api';
import { COMPONENT, WATCH } from '../constants';
import { ArrowFunctionWithBlock, extractFnFromMacro, isCompPath, wrapArrowFunctionWithBlock } from '../utils';
import { types as t } from '@openinula/babel-api';
import { type Scope } from '@babel/traverse';
export const PROP_SUFFIX = '_$p$';
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
//   let prop1_$p$ = prop1
//   let prop2_$p$ = prop2
//   let p20
//   let p21
//   watch(() => {
//     [p20, p21] = prop2
//   })
// }
function createPropAssignment(prop: Prop, scope: Scope) {
  const newName = `${prop.name}${PROP_SUFFIX}`;
  const declarations: t.Statement[] = [
    t.variableDeclaration('let', [t.variableDeclarator(t.identifier(newName), t.identifier(prop.name))]),
  ];
  if (prop.alias) {
    declarations.push(
      t.variableDeclaration('let', [t.variableDeclarator(t.identifier(`${prop.alias}`), t.identifier(newName))])
    );
  }
  if (prop.nestedRelationship) {
    // need to declare each the nested props
    console.log(prop.nestedProps);
    declarations.push(
      ...prop.nestedProps!.map(nestedProp =>
        t.variableDeclaration('let', [t.variableDeclarator(t.identifier(nestedProp))])
      )
    );
    declarations.push(
      t.expressionStatement(
        t.callExpression(t.identifier(WATCH), [
          t.arrowFunctionExpression(
            [],
            t.blockStatement([
              t.expressionStatement(t.assignmentExpression('=', prop.nestedRelationship!, t.identifier(newName))),
            ])
          ),
        ])
      )
    );
  }

  if (!prop.nestedRelationship || !prop.alias) {
    // this means the prop can be used directly in the function body
    // need rename the prop
    scope.rename(prop.name, newName);
  }
  return declarations;
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

          // --- only keep the first level props---
          // e.g. function({ prop1, prop2 }) {}
          fnPath.node.params = [
            t.objectPattern(
              props.map(prop =>
                t.objectProperty(
                  t.identifier(prop.name),
                  prop.defaultVal
                    ? t.assignmentPattern(t.identifier(prop.name), prop.defaultVal)
                    : t.identifier(prop.name),
                  false,
                  true
                )
              )
            ),
          ];
        }
      },
    },
  };
}

function parseProperty(path: NodePath<t.ObjectProperty | t.RestElement>): Prop {
  if (path.isObjectProperty()) {
    // --- normal property ---
    const key = path.node.key;
    if (t.isIdentifier(key) || t.isStringLiteral(key)) {
      const name = t.isIdentifier(key) ? key.name : key.value;
      return analyzeNestedProp(path.get('value'), name);
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

function analyzeNestedProp(valuePath: NodePath<t.ObjectProperty['value']>, name: string): Prop {
  const value = valuePath.node;
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
    valuePath.traverse({
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

  return { type: PropType.SINGLE, name, defaultVal, alias, nestedProps, nestedRelationship };
}
