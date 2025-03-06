import type { TransformResult, UnpluginFactory } from 'unplugin';
import type { Options } from './types';
import { createUnplugin } from 'unplugin';
import { minimatch } from 'minimatch';
import InulaNext from '@openinula/babel-preset-inula-next';
import { transform } from '@babel/core';
import { codeFrameColumns } from '@babel/code-frame';
import { CompilerError } from '@openinula/error-handler';

export const unpluginFactory: UnpluginFactory<Options | undefined> = options => ({
  name: 'Inula-Next',
  enforce: 'pre',
  transformInclude(id) {
    const {
      files: preFiles = '**/*.{jsx,tsx}',
      excludeFiles: preExcludeFiles = '**/{dist,node_modules,lib}/**/*.{js,ts}',
    } = options ?? {};
    const normalizedId = id.split('?')[0].split('#')[0];

    const files = Array.isArray(preFiles) ? preFiles : [preFiles];
    const excludeFiles = Array.isArray(preExcludeFiles) ? preExcludeFiles : [preExcludeFiles];

    let enter = false;
    for (const allowedPath of files) {
      if (minimatch(normalizedId, allowedPath)) {
        enter = true;
        break;
      }
    }
    for (const notAllowedPath of excludeFiles) {
      if (minimatch(normalizedId, notAllowedPath)) {
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
      }) as TransformResult;
    } catch (err) {
      let errorMsg = err;
      if (isCompilerError(err)) {
        errorMsg = codeFrameColumns(code, err.loc!, {
          highlightCode: true,
          message: err.message,
        });
      }
      console.error(errorMsg);

      return '';
    }
  },
});

function isCompilerError(err: any): err is CompilerError {
  return typeof err === 'object' && err !== null && 'loc' in err && 'message' in err;
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory);

export default unplugin;
