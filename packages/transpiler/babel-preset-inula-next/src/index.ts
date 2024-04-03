import syntaxDecorators from '@babel/plugin-syntax-decorators';
import dlight from './plugin';
import { type DLightOption } from './types';
import { type ConfigAPI, type TransformOptions } from '@babel/core';
import { plugin as fn2Class } from '@inula/class-transformer';

export default function (_: ConfigAPI, options: DLightOption): TransformOptions {
  return {
    plugins: [
      ['@babel/plugin-syntax-jsx'],
      ['@babel/plugin-syntax-typescript', { isTSX: true }],
      [syntaxDecorators.default ?? syntaxDecorators, { legacy: true }],
      fn2Class,
      [dlight, options],
    ],
  };
}

export { type DLightOption };
