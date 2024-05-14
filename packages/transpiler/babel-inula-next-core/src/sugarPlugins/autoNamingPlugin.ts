import babel, { NodePath, PluginObj } from '@babel/core';
import { register, types as t } from '@openinula/babel-api';
import { isFnExp, createMacroNode, getFnBodyNode } from '../utils';
import { COMPONENT, Hook } from '../constants';

/**
 * Auto Naming for Component and Hook
 * Find the CamelCase name and transform it into Component marco
 * function MyComponent() {} -> const MyComponent = Component(() => {})
 * const MyComponent = () => {} -> const MyComponent = Component(() => {})
 * const MyComponent = function() {} -> const MyComponent = Component(() => {})
 *
 * @param api
 * @param options
 */
export default function (api: typeof babel): PluginObj {
  register(api);

  return {
    visitor: {
      FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
        const { id } = path.node;
        const macroNode = getMacroNode(id, path.node.body);
        if (macroNode) {
          path.replaceWith(macroNode);
        }
      },
      VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
        if (path.node.declarations.length === 1) {
          const { id, init } = path.node.declarations[0];
          if (t.isIdentifier(id) && isFnExp(init)) {
            const macroNode = getMacroNode(id, getFnBodyNode(init));

            if (macroNode) {
              path.replaceWith(macroNode);
            }
          }
        }
      },
    },
  };
}

function getMacroNode(id: babel.types.Identifier | null | undefined, body: t.BlockStatement) {
  const macroName = getMacroName(id?.name);
  if (macroName) {
    return t.variableDeclaration('const', [t.variableDeclarator(id!, createMacroNode(body, macroName))]);
  }
}

function getMacroName(name: string | undefined) {
  if (!name) return null;

  if (isUpperCamelCase(name)) {
    return COMPONENT;
  } else if (isHook(name)) {
    return Hook;
  }

  return null;
}
function isUpperCamelCase(str: string) {
  return /^[A-Z]/.test(str);
}

function isHook(str: string) {
  return /^use[A-Z]/.test(str);
}
