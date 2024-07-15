import { transform } from '@babel/core';
import InulaNext, { type InulaNextOption } from '@openinula/babel-preset-inula-next';
import { minimatch } from 'minimatch';
import { Plugin, TransformResult } from 'vite';

export default function (options: Partial<InulaNextOption> = {}): Plugin {
  const {
    files: preFiles = '**/*.{js,jsx,ts,tsx}',
    excludeFiles: preExcludeFiles = '**/{dist,node_modules,lib}/*.{js,ts}',
  } = options;
  const files = Array.isArray(preFiles) ? preFiles : [preFiles];
  const excludeFiles = Array.isArray(preExcludeFiles) ? preExcludeFiles : [preExcludeFiles];

  return {
    name: 'Inula-Next',
    enforce: 'pre',
    transform(code: string, id: string) {
      let enter = false;
      for (const allowedPath of files) {
        if (minimatch(id, allowedPath)) {
          enter = true;
          break;
        }
      }
      for (const notAllowedPath of excludeFiles) {
        if (minimatch(id, notAllowedPath)) {
          enter = false;
          break;
        }
      }
      if (!enter) return;
      try {
        return transform(code, {
          babelrc: false,
          configFile: false,
          presets: [[InulaNext, options]],
          sourceMaps: true,
          filename: id,
        }) as TransformResult;
      } catch (err) {
        console.error('Error:', err);
      }
      return '';
    },
  };
}
