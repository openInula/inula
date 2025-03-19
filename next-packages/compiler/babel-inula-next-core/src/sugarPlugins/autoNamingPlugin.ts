import babel, { NodePath, PluginObj } from '@babel/core';
import { register, types as t } from '@openinula/babel-api';
import { createMacroNode, getFnBodyNode, isFnExp } from '../utils';
import { builtinHooks, COMPONENT, HOOK } from '../constants';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

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
      Program(program) {
        program.traverse({
          FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
            if (ALREADY_COMPILED.has(path)) return;

            const { id } = path.node;
            const macroNode = getMacroNode(id, path.node.body, path.node.params);
            if (macroNode) {
              path.replaceWith(macroNode);
            }

            ALREADY_COMPILED.add(path);
          },
          VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
            if (ALREADY_COMPILED.has(path)) return;

            if (path.node.declarations.length === 1) {
              const { id, init } = path.node.declarations[0];
              if (t.isIdentifier(id) && isFnExp(init)) {
                const macroNode = getMacroNode(id, getFnBodyNode(init), init.params);

                if (macroNode) {
                  path.replaceWith(macroNode);
                }
              }
            }

            ALREADY_COMPILED.add(path);
          },
        });
      },
    },
  };
}

function getMacroNode(
  id: babel.types.Identifier | null | undefined,
  body: t.BlockStatement,
  params: t.FunctionExpression['params'] = []
) {
  const macroName = getMacroName(id?.name);
  if (macroName) {
    return t.variableDeclaration('const', [t.variableDeclarator(id!, createMacroNode(body, macroName, params))]);
  }
}

function getMacroName(name: string | undefined) {
  if (!name) return null;

  if (isUpperCamelCase(name)) {
    return COMPONENT;
  } else if (isHook(name)) {
    return HOOK;
  }

  return null;
}
function isUpperCamelCase(str: string) {
  return /^[A-Z]/.test(str);
}

function isHook(str: string) {
  return /^use[A-Z]/.test(str) && !builtinHooks.includes(str);
}
