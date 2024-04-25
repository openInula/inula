import type babel from '@babel/core';
import { type PluginObj } from '@babel/core';
import { type DLightOption } from './types';
import { defaultAttributeMap, defaultHTMLTags } from './const';
import { analyze } from './analyze';
import { NodePath, type types as t } from '@babel/core';
import { COMPONENT } from './constants';
import { extractFnFromMacro } from './utils';
import { register } from './babelTypes';

export default function (api: typeof babel, options: DLightOption): PluginObj {
  const { types } = api;
  const {
    files = '**/*.{js,ts,jsx,tsx}',
    excludeFiles = '**/{dist,node_modules,lib}/*',
    enableDevTools = false,
    customHtmlTags = defaultHtmlTags => defaultHtmlTags,
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
        // find the component, like: Component(() => {})
        const callee = path.get('callee');

        if (callee.isIdentifier() && callee.node.name === COMPONENT) {
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
          // The sub path has been visited, so we just skip
          path.skip();
        }
      },
    },
  };
}
