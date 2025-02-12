import { transform } from '@babel/core';
import InulaNext, { type InulaNextOption } from '@openinula/babel-preset-inula-next';
import { minimatch } from 'minimatch';
import codeFrameColumns from '@babel/code-frame';
import { getOptions } from 'loader-utils';
import type { LoaderContext } from 'webpack';

export default function (this: LoaderContext<InulaNextOption>, source: string) {
  const callback = this.async();
  const id = this.resourcePath;
  const options = this.getOptions ? this.getOptions() : getOptions(this);
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
  if (!enter) return;
  try {
    const { code: transformedSource, map } = transform(source, {
      babelrc: false,
      configFile: false,
      presets: [[InulaNext, options]],
      sourceMaps: true,
      filename: id,
    })!;

    callback(null, transformedSource, map);
  } catch (err) {
    let errorMsg = err;
    if (typeof err === 'object' && err !== null && 'loc' in err && 'message' in err) {
      errorMsg = codeFrameColumns(source, err.loc, {
        highlightCode: true,
        message: err.message,
      });
    }
    console.error(errorMsg);
    throw err;
  }
}
