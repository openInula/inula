import type babel from '@babel/core';
import { NodePath, type PluginObj, type types as t } from '@babel/core';
import { type DLightOption } from './types';
import { defaultAttributeMap, defaultHTMLTags, COMPONENT } from './constants';
import { analyze } from './analyze';
import { extractFnFromMacro, isCompPath } from './utils';
import { register } from '@openinula/babel-api';
import { generate } from './generator';
import { ComponentNode } from './analyze/types';

function replaceWithComponent(path: NodePath<t.CallExpression>, root: ComponentNode) {
  const variableDeclarationPath = path.parentPath.parentPath;
  const randomName = Math.random().toString(36).substring(7);
  const compNode = generate(root);
  const realFuncName = compNode.id.name;
  compNode.id.name = randomName;
  variableDeclarationPath.replaceWith(compNode);
  compNode.id.name = realFuncName;
}

export default function (api: typeof babel, options: DLightOption): PluginObj {
  const { types } = api;
  const {
    files = '**/*.{js,ts,jsx,tsx}',
    excludeFiles = '**/{dist,node_modules,lib}/*',
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
    visitor: {
      Program: {
        enter(path, { filename }) {
          // return pluginProvider.programEnterVisitor(path, filename);
        },
        exit(path, { filename }) {
          // pluginProvider.programExitVisitor.bind(pluginProvider);
        },
      },
      CallExpression(path: NodePath<t.CallExpression>) {
        if (isCompPath(path)) {
          const componentNode = extractFnFromMacro(path, COMPONENT);
          let name = '';
          // try to get the component name, when parent is a variable declarator
          if (path.parentPath.isVariableDeclarator()) {
            const lVal = path.parentPath.get('id');
            if (lVal.isIdentifier()) {
              name = lVal.node.name;
            } else {
              console.error('Component macro must be assigned to a variable');
            }
          }
          const root = analyze(name, componentNode, {
            htmlTags,
          });

          replaceWithComponent(path, root);

          // The sub path has been visited, so we just skip
          path.skip();
        }
      },
    },
  };
}
