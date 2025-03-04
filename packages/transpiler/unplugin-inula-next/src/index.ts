import type { UnpluginFactory } from 'unplugin';
import type { Options } from './types';
import { createUnplugin } from 'unplugin';
import { minimatch } from 'minimatch';
import InulaNext from '@openinula/babel-preset-inula-next';
import { transform } from '@babel/core';
import { codeFrameColumns } from '@babel/code-frame';
export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = {}) => ({
  name: 'Inula-Next',
  enforce: 'pre',
  transformInclude(id) {
    const {
      files: preFiles = '**/*.{js,jsx,ts,tsx}',
      excludeFiles: preExcludeFiles = '**/{dist,node_modules,lib}/*.{js,ts}',
    } = options;
    const files = Array.isArray(preFiles) ? preFiles : [preFiles];
    const excludeFiles = Array.isArray(preExcludeFiles) ? preExcludeFiles : [preExcludeFiles];

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
    return enter;
  },
  transform(code, id) {
    try {
      return transform(code, {
        babelrc: false,
        configFile: false,
        presets: [[InulaNext, options]],
        sourceMaps: true,
        filename: id,
      });
    } catch (err) {
      let errorMsg = err;
      if (typeof err === 'object' && err !== null && 'loc' in err && 'message' in err) {
        errorMsg = codeFrameColumns(code, err.loc, {
          highlightCode: true,
          message: err.message,
        });
      }
      console.error(errorMsg);

      return '';
    }
  },
});

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
