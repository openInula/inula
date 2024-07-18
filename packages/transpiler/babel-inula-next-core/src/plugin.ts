import type babel from '@babel/core';
import type { BabelFile } from '@babel/core';
import { NodePath, type PluginObj, type types as t } from '@babel/core';
import { type InulaNextOption } from './types';
import { defaultAttributeMap, defaultHTMLTags, importMap } from './constants';
import { analyze } from './analyze';
import { addImport, extractFnFromMacro, fileAllowed, getMacroType, toArray } from './utils';
import { register } from '@openinula/babel-api';
import { generate } from './generator';
import { ComponentNode, HookNode } from './analyze/types';

const ALREADY_COMPILED: WeakSet<NodePath> | Set<NodePath> = new (WeakSet ?? Set)();

function replaceWithComponent(path: NodePath<t.CallExpression>, root: ComponentNode | HookNode) {
  const variableDeclarationPath = path.parentPath.parentPath!;
  const randomName = Math.random().toString(36).substring(7);
  const compNode = generate(root);
  const realFuncName = compNode.id!.name;
  compNode.id!.name = randomName;
  variableDeclarationPath.replaceWith(compNode);
  compNode.id!.name = realFuncName;
}

interface PluginState {
  customState: Record<string, ComponentNode>;
  filename: string;
  file: BabelFile;
}

function transformNode(path: NodePath<t.CallExpression>, htmlTags: string[], state: PluginState) {
  if (ALREADY_COMPILED.has(path)) return false;
  const type = getMacroType(path);
  if (type) {
    const componentNode = extractFnFromMacro(path, type);
    let name = '';
    // try to get the component name, when parent is a variable declarator
    if (path.parentPath.isVariableDeclarator()) {
      const lVal = path.parentPath.get('id');
      if (lVal.isIdentifier()) {
        name = lVal.node.name;
      } else {
        console.error(`${type} macro must be assigned to a variable`);
      }
    }
    const root = analyze(type, name, componentNode, {
      htmlTags,
    });

    recordComponentInState(state, name, root);

    replaceWithComponent(path, root);

    return true;
  }

  ALREADY_COMPILED.add(path);
  return false;
}

export default function (api: typeof babel, options: InulaNextOption): PluginObj<PluginState> {
  const {
    files = '**/*.{js,ts,jsx,tsx}',
    excludeFiles = '**/{dist,node_modules,lib}/*',
    packageName = '@openinula/next',
    enableDevTools = false,
    htmlTags: customHtmlTags = defaultHtmlTags => defaultHtmlTags,
    attributeMap = defaultAttributeMap,
  } = options;

  const htmlTags =
    typeof customHtmlTags === 'function'
      ? customHtmlTags(defaultHTMLTags)
      : customHtmlTags.includes('*')
        ? [...new Set([...defaultHTMLTags, ...customHtmlTags])].filter(tag => tag !== '*')
        : customHtmlTags;

  register(api);
  return {
    name: 'babel-inula-next-core',
    visitor: {
      Program: {
        exit(program, state) {
          if (!fileAllowed(state.filename, toArray(files), toArray(excludeFiles))) {
            program.skip();
            return;
          }
          let transformationHappened = false;

          program.traverse({
            CallExpression(path) {
              transformationHappened = transformNode(path, htmlTags, state) || transformationHappened;
            },
          });

          if (transformationHappened && !options.skipImport) {
            addImport(program.node, importMap, packageName);
          }
        },
      },
    },
  };
}

function recordComponentInState(state: PluginState, name: string, componentNode: ComponentNode | HookNode) {
  const metadata = state.file.metadata as { components: Record<string, ComponentNode | HookNode> };
  if (metadata.components == null) {
    metadata.components = {
      [name]: componentNode,
    };
  } else {
    metadata.components[name] = componentNode;
  }
}
