import syntaxDecorators from '@babel/plugin-syntax-decorators';
import syntaxJSX from '@babel/plugin-syntax-jsx';
import syntaxTypescript from '@babel/plugin-syntax-typescript';
import inulaNext from './plugin';
import { type DLightOption } from './types';
import { type ConfigAPI, type TransformOptions } from '@babel/core';
import { plugin as fn2Class } from '@openinula/class-transformer';
import { parse as babelParse } from '@babel/parser';

export default function (_: ConfigAPI, options: DLightOption): TransformOptions {
  return {
    plugins: [
      syntaxJSX.default ?? syntaxJSX,
      [syntaxTypescript.default ?? syntaxTypescript, { isTSX: true }],
      [syntaxDecorators.default ?? syntaxDecorators, { legacy: true }],
      fn2Class,
      [inulaNext, options],
    ],
  };
}

export { type DLightOption };

export function parse(code: string) {
  const result = babelParse(code, {
    // parse in strict mode and allow module declarations
    sourceType: 'module',

    plugins: ['jsx'],
  });

  if (result.errors.length) {
    throw new Error(result.errors[0].message);
  }

  const program = result.program;
}
