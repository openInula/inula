import type babel from '@babel/core';
import { type PluginObj } from '@babel/core';
import { PluginProviderClass } from './pluginProvider';
import { type DLightOption } from './types';
import { defaultAttributeMap } from './const';
import { analyze } from './analyze';

export default function (api: typeof babel, options: DLightOption): PluginObj {
  const { types } = api;
  const {
    files = '**/*.{js,ts,jsx,tsx}',
    excludeFiles = '**/{dist,node_modules,lib}/*',
    enableDevTools = false,
    htmlTags = defaultHtmlTags => defaultHtmlTags,
    attributeMap = defaultAttributeMap,
  } = options;

  const pluginProvider = new PluginProviderClass(
    api,
    types,
    Array.isArray(files) ? files : [files],
    Array.isArray(excludeFiles) ? excludeFiles : [excludeFiles],
    enableDevTools,
    htmlTags,
    attributeMap
  );

  return {
    visitor: {
      Program: {
        enter(path, { filename }) {
          return pluginProvider.programEnterVisitor(path, filename);
        },
        exit: pluginProvider.programExitVisitor.bind(pluginProvider),
      },
      FunctionDeclaration: {
        enter: path => {
          analyze(path);
        },
        exit: pluginProvider.classExit.bind(pluginProvider),
      },
      ClassMethod: pluginProvider.classMethodVisitor.bind(pluginProvider),
      ClassProperty: pluginProvider.classPropertyVisitor.bind(pluginProvider),
    },
  };
}
