import babel, { NodePath, PluginObj } from '@babel/core';
import type { InulaNextOption } from '../types';
import { register, types as t } from '@openinula/babel-api';
import { COMPONENT, PROP_SUFFIX } from '../constants';
import {
  ArrowFunctionWithBlock,
  extractFnFromMacro,
  isCompPath,
  isHookPath,
  wrapArrowFunctionWithBlock,
} from '../utils';
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
  nestedRelationship?: t.ObjectPattern | t.ArrayPattern | null;
}

// e.g. function({ prop1, prop2: [p20, p21] }) {}
// transform into
// function(prop1, prop2: [p20, p21]) {
//   let prop1_$p$ = prop1
//   let prop2_$p$ = prop2
//   let [p20, p21] = prop2 // Attention: destructuring will be handled in state destructuring plugin.
// }
function createPropAssignment(prop: Prop, scope: Scope, suffix: string) {
  const newName = `${prop.name}${suffix}`;
  const declarations: t.Statement[] = [
    t.variableDeclaration('let', [t.variableDeclarator(t.identifier(newName), t.identifier(prop.name))]),
  ];
  if (prop.alias) {
    declarations.push(
      t.variableDeclaration('let', [t.variableDeclarator(t.identifier(`${prop.alias}`), t.identifier(newName))])
    );
  }
  if (prop.nestedRelationship) {
    declarations.push(
      t.variableDeclaration('let', [t.variableDeclarator(prop.nestedRelationship, t.identifier(newName))])
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

function extractMemberExpressionInFnBody(
  fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>,
  propsName: string
) {
  const props: Prop[] = [];
  const body = fnPath.get('body') as NodePath<t.BlockStatement>;
  body.traverse({
    MemberExpression(path: NodePath<t.MemberExpression>) {
      // find the props destructuring, like const { prop1, prop2 } = props;
      const obj = path.node.object;

      if (t.isIdentifier(obj) && obj.name === propsName) {
        const property = path.node.property;
        if (!t.isIdentifier(property)) {
          return;
        }
        const name = property.name;
        const prop: Prop = { type: PropType.SINGLE, name };
        if (path.parentPath.isVariableDeclarator() && t.isIdentifier(path.parentPath.node.id)) {
          const rename = path.parentPath.node.id.name;
          if (name !== rename) {
            prop.alias = rename;
          }
          path.parentPath.remove();
        }
        if (!props.map(prop => prop.name).includes(prop.name)) {
          props.push(prop);
        }
      }
    },
  });
  return props;
}

function replaceProps(
  fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>,
  propsName: string,
  props: Prop[]
) {
  const body = fnPath.get('body') as NodePath<t.BlockStatement>;
  props.forEach(prop => {
    body.traverse({
      MemberExpression(path: NodePath<t.MemberExpression>) {
        const obj = path.node.object;
        const property = path.node.property;
        if (t.isIdentifier(property) && t.isIdentifier(obj) && obj.name === propsName && property.name === prop.name) {
          path.replaceWith(t.identifier(prop.name + PROP_SUFFIX));
        }
      },
    });
  });
}

function transformParam(
  propsPath: NodePath<t.Identifier | t.RestElement | t.Pattern>,
  props: Prop[],
  fnPath: NodePath<t.FunctionExpression> | NodePath<ArrowFunctionWithBlock>,
  suffix: string
) {
  let memberExpressionProps: Prop[] = [];
  if (propsPath) {
    if (propsPath.isObjectPattern()) {
      // --- object destructuring ---
      props = propsPath.get('properties').map(prop => parseProperty(prop));
    } else if (propsPath.isIdentifier()) {
      // --- identifier destructuring ---
      props = extractPropsDestructingInFnBody(fnPath, propsPath.node.name);
      memberExpressionProps = extractMemberExpressionInFnBody(fnPath, propsPath.node.name);
      props = [...props, ...memberExpressionProps];
    }
  }

  fnPath.node.body.body.unshift(...props.flatMap(prop => createPropAssignment(prop, fnPath.scope, suffix)));
  if (propsPath.isIdentifier()) {
    replaceProps(fnPath, propsPath.node.name, memberExpressionProps);
  }

  // --- only keep the first level props---
  // e.g. function({ prop1, prop2 }) {}
  const param = t.objectPattern(
    props.map(prop => (prop.type === PropType.REST ? t.restElement(t.identifier(prop.name)) : createProperty(prop)))
  );
  fnPath.node.params = suffix === PROP_SUFFIX ? [param] : [fnPath.node.params[0], param];
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
export default function (api: typeof babel, options: InulaNextOption): PluginObj {
  register(api);
  let props: Prop[];

  return {
    visitor: {
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isCompPath(path) || isHookPath(path)) {
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
          transformParam(propsPath, props, fnPath, PROP_SUFFIX);
        }
      },
    },
  };
}

function createProperty(prop: Prop) {
  return t.objectProperty(
    t.identifier(prop.name),
    prop.defaultVal ? t.assignmentPattern(t.identifier(prop.name), prop.defaultVal) : t.identifier(prop.name),
    false,
    true
  );
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

  return { type: PropType.SINGLE, name, defaultVal, alias, nestedRelationship };
}
